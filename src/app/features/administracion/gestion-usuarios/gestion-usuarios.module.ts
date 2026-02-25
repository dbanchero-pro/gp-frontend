import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';
import { SharedModule } from 'src/app/shared/shared.module';
import { CompraResumenPipe } from '../../../shared/pipes/compra-resumen.pipe';
import { FormatoCiPipe } from '../../../shared/pipes/formato-ci.pipe';
import { NumeroCompraPipe } from '../../../shared/pipes/nro-compra-pipe';
import { ConsultaUsuariosConformidadCompraComponent } from './components/usuario-organismo/consulta-usuarios-conformidad-compra/consulta-usuarios-conformidad-compra.component';
import { ConsultaUsuariosConformidadComponent } from './components/usuario-organismo/consulta-usuarios-conformidad/consulta-usuarios-conformidad.component';
import { NuevoUsuarioPopupComponent } from './components/usuario-organismo/nuevo-usuario-popup/nuevo-usuario-popup.component';
import { NuevoUsuarioTipoCompraPopupComponent } from './components/usuario-organismo/nuevo-usuario-tipo-compra-popup/nuevo-usuario-tipo-compra-popup.component';
import { NuevoUsuarioUcPopupComponent } from './components/usuario-organismo/nuevo-usuario-uc-popup/nuevo-usuario-uc-popup.component';
import { UnidadesCompraSicePopupComponent } from './components/usuario-organismo/unidades-compra-sice-popup/unidades-compra-sice-popup.component';
import { ConsultaUsuariosRolesComponent } from './components/usuario-roles/consulta-usuarios-roles/consulta-usuarios-roles.component';
import { ConsultaUsuariosRolesCompraComponent } from './components/usuario-roles/consulta-usuarios-roles-compra/consulta-usuarios-roles-compra.component';
import { ConsultaUsuariosRolesItemsComponent } from './components/usuario-roles/consulta-usuarios-roles-items/consulta-usuarios-roles-items.component';
import { ModificarRolPopupComponent } from './components/usuario-roles/modificar-rol-popup/modificar-rol-popup.component';

const routes: Routes = [
    {
        path: 'consulta-usuario-conformidad',
        component: ConsultaUsuariosConformidadComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'consulta-usuario-conformidad/:idUsuario',
        component: ConsultaUsuariosConformidadCompraComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'consulta-usuario-roles',
        component: ConsultaUsuariosRolesComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'consulta-usuario-roles/:idUsuario',
        component: ConsultaUsuariosRolesCompraComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'consulta-usuario-roles/:idUsuario/items/:idCompra',
        component: ConsultaUsuariosRolesItemsComponent,
        canActivate: [AuthGuard],
    },
];

export const manageEmialsRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        ConsultaUsuariosConformidadComponent,
        ConsultaUsuariosConformidadCompraComponent,
        NuevoUsuarioPopupComponent,
        NuevoUsuarioTipoCompraPopupComponent,
        NuevoUsuarioUcPopupComponent,
        UnidadesCompraSicePopupComponent,
        ConsultaUsuariosRolesComponent,
        ConsultaUsuariosRolesCompraComponent,
        ConsultaUsuariosRolesItemsComponent,
        ModificarRolPopupComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        NgxMaskDirective,
        NumeroCompraPipe,
    ],
    providers: [provideNgxMask()],
    exports: [FormatoCiPipe, CompraResumenPipe],
})
export class GestionUsuariosModule {}
