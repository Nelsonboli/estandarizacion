import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers ?? []),
    provideRouter(
      routes,
      // Feature correcta para restauración de scroll y anchor scrolling
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled', // 'disabled' | 'enabled' | 'top'
        anchorScrolling: 'enabled'            // 'disabled' | 'enabled'
      }),
      // opcional: otras configuraciones de router
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    )
  ]
}).catch(err => console.error(err));