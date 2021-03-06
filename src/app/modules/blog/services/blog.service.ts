import { Injectable } from '@angular/core';
import { TransferState, makeStateKey } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

import { LoggerService } from '@app/core/services/logger.service';
import { ResponseHandlerService } from '@app/core/services/response-handler.service';
import { ICategory, IArticle, ISearchMap, ISelectedChipsMap } from '@app/interface';
import { HttpClientService } from '@app/core/services/http-client.service';

const CATEGORIES_KEY = makeStateKey<ICategory[]>('categories');
// const ARTICLES_SUBJECT_KEY = makeStateKey<Subject<IArticle[]>>('articles$');

@Injectable()
export class BlogService {
  categories: ICategory[];
  articles$ = new BehaviorSubject<IArticle[]>([]);
  searchs$ = new BehaviorSubject<IArticle[]>([]);

  isLoading$ = new BehaviorSubject<boolean>(false);
  isMore$ = new BehaviorSubject<boolean>(false);
  isSearch = false;

  searchMap: ISelectedChipsMap | object = {};

  index = 1;
  private _size = 5;
  private _isLoading = true;
  constructor(private _http: HttpClientService, private _loggerSer: LoggerService, private _state: TransferState) {
    this._getCategory();
  }

  private _getArticles() {
    if (this.isSearch) {
      return;
    }

    if (this._isLoading) {
      this.isLoading$.next(true);
    }

    if (this.searchs$.value.length) {
      this.searchs$.next([]);
    }

    const params = {
      index: '1',
      limit: (this.index * this._size).toString()
    };
    this._http
      .get<IArticle[]>('_getArticles', '/article/list', params)
      .pipe(
        retry(3),
        catchError(ResponseHandlerService.handleErrorData<IArticle[]>('_getArticles', []))
      )
      .subscribe(d => {
        this._checkIsMore(d);
        this.articles$.next(d);
        this.isLoading$.next(false);
        this._isLoading = false;
      });
  }

  private _checkIsMore(v: IArticle[]) {
    const is = v.length === this.articles$.value.length;
    if (is) {
      this.isMore$.next(is);
    } else {
      this.index++;
    }
  }

  searchTitle(value: string) {
    return this._http
      .get<{ title: string }[]>('searchTitle', '/article/search', { title: value })
      .pipe(catchError(ResponseHandlerService.handleErrorData<{ title: string }[]>('search', [])));
  }

  private _saerchResult(value: ISearchMap) {
    if (!this.isSearch) {
      return;
    }
    this.isLoading$.next(true);

    this._http
      .get<IArticle[]>('_saerchResult', '/article/search', value)
      .pipe(catchError(ResponseHandlerService.handleErrorData<IArticle[]>('_saerchResult', [])))
      .subscribe(d => {
        this.searchs$.next(d);
        this.isSearch = true;
        this.isLoading$.next(false);
      });
  }

  changeSearchMap(v: { [i: string]: any }) {
    this.searchMap = { ...this.searchMap, ...v };
  }

  getArticleList(v?: ISearchMap) {
    const vs = Object.values(this.searchMap);
    vs.forEach(i => {
      if (i) {
        this.isSearch = true;
        return;
      }
      this.isSearch = false;
    });
    if (this.isSearch && v) {
      this._saerchResult(v);
    } else {
      this._getArticles();
    }
  }

  private _getCategory() {
    const category = this._state.get(CATEGORIES_KEY, null);

    if (category) {
      this.categories = category;
    } else {
      this._http
        .get<ICategory[]>('_getCategory', '/category')
        .pipe(
          retry(3),
          catchError(ResponseHandlerService.handleErrorData<ICategory[]>('_getCategory', []))
        )
        .subscribe(d => {
          this._state.set(CATEGORIES_KEY, d);
          this.categories = d;
        });
    }
  }

  restore() {
    this.index = 1;
    this.articles$.next([]);
    this.searchMap = {};
  }
}
