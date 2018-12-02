import { InjectionToken } from '@angular/core';

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config');

export const appConfig = {
  api: 'http://127.0.0.1:8999',
  headerDesktopLimit: 500,
  headerScrollLimit: 60,
  router: [
    {
      path: '',
      name: 'HOME',
      title: '',
      icon: 'home'
    },
    {
      path: '/blog',
      name: 'BLOG',
      title: 'Blog',
      icon: 'border_color'
    }
    // {
    //   path: '/contact',
    //   name: 'CONTACT',
    //   title:'Contact',
    //   icon: 'import_contacts'
    // }
  ]
};
export type AppConfig = typeof appConfig;
export type AppConfigRouter = typeof appConfig.router;
