import { ExtraOptions,Routes,  } from '@angular/router';


export const routes: Routes = [
{
    path: '',
    loadComponent: () => import('./shared/dashboard/layout/layout.component').then(m => m.LayoutComponent),
    children: [
        {
            path: '',
            loadComponent: () => import('./business/menuprincipal/menuprincipal.component').then(m => m.menuprincipalComponent)
        },
                {
            path: 'acercadeestandarizacion',
            loadComponent: () => import('./business/documentacion/documentacion.component').then(m => m.DocumentacionComponent)
        },
        {
            path: 'recoleccioninformacion',
            loadComponent: () => import('./business/recoleccioninformacion/recoleccioninformacion.component').then(m => m.RecoleccioninformacionComponent),
        },
        {
            path: 'identificacionrequerimientos',
            loadComponent: () => import('./business/identificacionrequerimientos/identificacionrequerimientos.component').then(m => m.IdentificacionrequerimientosComponent)
        },
        {
            path: 'socializacionprocedimientos',
            loadComponent: () => import('./business/socializacionprocedimientos/socializacionprocedimientos.component').then(m => m.SocializacionprocedimientosComponent)
        },
                {
            path: 'manualusuario',
            loadComponent: () => import('./business/manualusuario/manualusuario.component').then(m => m.ManualusuarioComponent)
        },

        {
            path: 'estandarizar',
                loadComponent: () => import('./Paginas/estandarizar/estandarizar.component').then(m => m.EstandarizarComponent)
            },
     
        {
            path:'**',
            redirectTo: '',
            pathMatch: 'full'
        },
        ]
    }
]

const routerOptions: ExtraOptions = {
  scrollPositionRestoration: 'enabled',
  anchorScrolling: 'enabled'
};
