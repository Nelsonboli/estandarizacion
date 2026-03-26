import { Routes } from '@angular/router';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./layout/layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./modules/menu-principal/menu-principal.component').then(m => m.menuprincipalComponent)
            },
            {
                path: 'acercadeestandarizacion',
                loadComponent: () => import('./modules/acerca-de-estandarizacion/documentacion.component').then(m => m.DocumentacionComponent)
            },
            {
                path: 'recoleccioninformacion',
                loadComponent: () => import('./modules/recoleccion-informacion/recoleccion-informacion.component').then(m => m.RecoleccioninformacionComponent)
            },
            {
                path: 'identificacionrequerimientos', loadComponent: () => import('./modules/identificacion-requerimientos/pages/identifiacion-requerimientos-pages/identificacion-requerimientos.component').then(m => m.IdentificacionrequerimientosComponent),
            },

            {
                path: 'socializacionprocedimientos',
                loadComponent: () => import('./modules/socializacion-procedimientos/pages/socializacion-pages/socializacion-procedimientos.component').then(m => m.SocializacionprocedimientosComponent)
            },
            {
                path: 'manualusuario',
                loadComponent: () => import('./modules/manual-usuario/manual-usuario.component').then(m => m.ManualusuarioComponent)
            },

            {
                path: 'identificacionrequerimientos/estandarizar/:id', loadComponent: () => import('./modules/estandarizacion/pages/estandarizacion-pages/estandarizacion.component').then(m => m.EstandarizarComponent)
            },

            {
                path: '**',
                redirectTo: '',
                pathMatch: 'full'
            },
        ]
    }
]

