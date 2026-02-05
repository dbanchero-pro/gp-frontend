import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';

const routes: Routes = [
    
    {
        path: 'auditoria',
        loadChildren: () =>
            import('./auditoria/auditoria-administracion.module').then(
                (m) => m.AuditoriaAdministracionModule
            ),
        canActivate: [AuthGuard],

    },
    {
        path: 'puntos-recepcion',
        loadChildren: () =>
            import('./puntos-recepcion/puntos-recepcion.module').then(
                (m) => m.PuntosRecepcionModule
            ),
        canActivate: [AuthGuard],
    },
    {
        path: 'gestion-usuarios',
        loadChildren: () =>
            import('./gestion-usuarios/gestion-usuarios.module').then(
                (m) => m.GestionUsuariosModule
            ),
        canActivate: [AuthGuard],
    },
    {
        path: 'plazo-proveedor',
        loadChildren: () =>
            import('./plazo-proveedor/plazo-proveedor.module').then(
                (m) => m.PlazoProveedorModule
            ),
        canActivate: [AuthGuard],
    },
    {
        path: 'campos-reglas',
        loadChildren: () =>
            import('./campos-reglas/campos-reglas.module').then(
                (m) => m.CamposReglasModule
            ),
        canActivate: [AuthGuard],
    },

];

export const manageEmialsRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
    ],
    imports: [
        RouterModule.forChild(routes),
    ],
})
export class AdministracionModule {}

