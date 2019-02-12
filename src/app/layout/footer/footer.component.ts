import { Component, OnInit, Inject } from '@angular/core';
import { APP_CONFIG, AppConfig, AppConfigRouter } from '@app/config/app.config';

@Component({
  selector   : 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls  : ['./footer.component.styl']
})
export class FooterComponent implements OnInit {
  router: AppConfigRouter;

  constructor(@Inject(APP_CONFIG) private _config: AppConfig) {
    this.router = _config.router;
  }

  ngOnInit() {}
}
