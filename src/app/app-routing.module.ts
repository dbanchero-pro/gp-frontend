import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

import { Pagina403Component } from './shared/components/pagina403/pagina403.component';
import { AuthGuard } from './shared/guards/auth-guard';
import { HomeComponent } from './template/components/home/home.component';

const routes: Routes = [
    {
        path: 'inicio',
        component: HomeComponent,
    },
    {
        path: '403',
        component: Pagina403Component,
    },
    {
        path: 'administracion',
        loadChildren: () =>
            import('./features/administracion/administracion.module').then(
                (m) => m.AdministracionModule,
            ),
    },
    {
        path: 'pliegos',
        loadChildren: () =>
            import('./features/pliegos/pliegos.module').then(
                (m) => m.PliegosModule,
            ),

        canActivate: [AuthGuard],
    },
    { path: '', pathMatch: 'full', redirectTo: 'inicio' },
    { path: '**', redirectTo: '' },
];

@NgModule({
    declarations: [],
    imports: [
        RouterModule.forRoot(routes, {
            paramsInheritanceStrategy: 'always',
            scrollPositionRestoration: 'enabled',
            anchorScrolling: 'enabled',
            onSameUrlNavigation: 'reload',
            enableTracing: false,
            initialNavigation: 'enabledNonBlocking',
            preloadingStrategy: PreloadAllModules,
        }),
    ],
    exports: [RouterModule],
})
export class AppRoutingModule {}
