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
      // Configuración mejorada para scroll y fragments
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
      // Configuración adicional del router
      withRouterConfig({ 
        onSameUrlNavigation: 'reload',
        // Esto es importante para que los fragments funcionen correctamente
        paramsInheritanceStrategy: 'emptyOnly'
      })
    )
  ]
}).catch(err => console.error(err));