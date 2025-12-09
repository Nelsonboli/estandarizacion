import { ExtraOptions, Routes, } from '@angular/router';


export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./shared/dashboard/layout/layout.component').then(m => m.LayoutComponent),
        children: [
            {
                path: '',
                loadComponent: () => import('./modulos/menuprincipal/menuprincipal.component').then(m => m.menuprincipalComponent)
            },
            {
                path: 'acercadeestandarizacion',
                loadComponent: () => import('./modulos/documentacion/documentacion.component').then(m => m.DocumentacionComponent)
            },
            {
                path: 'recoleccioninformacion',
                loadComponent: () => import('./modulos/recoleccioninformacion/recoleccioninformacion.component').then(m => m.RecoleccioninformacionComponent)
            },
            {
                path: 'identificacionrequerimientos', loadComponent: () => import('./modulos/identificacionrequerimientos/identificacionrequerimientos.component').then(m => m.IdentificacionrequerimientosComponent),
            },

            {
                path: 'socializacionprocedimientos',
                loadComponent: () => import('./modulos/socializacionprocedimientos/socializacionprocedimientos.component').then(m => m.SocializacionprocedimientosComponent)
            },
            {
                path: 'manualusuario',
                loadComponent: () => import('./modulos/manualusuario/manualusuario.component').then(m => m.ManualusuarioComponent)
            },

            {
                path: 'identificacionrequerimientos/estandarizar/:id', loadComponent: () => import('./paginas/estandarizar/estandarizar.component').then(m => m.EstandarizarComponent)
            },

            {
                path: '**',
                redirectTo: '',
                pathMatch: 'full'
            },
        ]
    }
]

