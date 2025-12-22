import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';

import { RouterModule, Routes } from '@angular/router';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';
import { SharedModule } from 'src/app/shared/shared.module';
import { NumeroCompraPipe } from '../../../shared/pipes/nro-compra-pipe';
import { AuditoriaPuntosRecepcionComponent } from './components/auditoria-puntos-recepcion/auditoria-puntos-recepcion.component';
import { AuditoriaUsuarioOrganismoPerfilComponent } from './components/auditoria-usuario-organismo-perfil/auditoria-usuario-organismo-perfil.component';
import { AuditoriaUsuarioProveedorComponent } from './components/auditoria-usuario-proveedor/auditoria-usuario-proveedor.component';


export const routes: Routes = [
    {
        path: 'puntos-recepcion',
        component: AuditoriaPuntosRecepcionComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'recepcion',
        component: AuditoriaUsuarioOrganismoPerfilComponent,
        data: { perfil: TipoPerfil.Recepcion },
        canActivate: [AuthGuard],
    },
    {
        path: 'conformidad',
        component: AuditoriaUsuarioOrganismoPerfilComponent,
        data: { perfil: TipoPerfil.Conformidad },
        canActivate: [AuthGuard],
    },
    {
        path: 'usuario-proveedor',
        component: AuditoriaUsuarioProveedorComponent,
        canActivate: [AuthGuard],
    },
];
export const manageEmialsRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        AuditoriaPuntosRecepcionComponent,
        AuditoriaUsuarioOrganismoPerfilComponent,
        AuditoriaUsuarioProveedorComponent,
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        NumeroCompraPipe,
    ],
})
export class AuditoriaAdministracionModule {}
