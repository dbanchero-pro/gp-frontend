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
import { ConsultaUsuariosConformidadItemsComponent } from './components/usuario-organismo/consulta-usuarios-conformidad-items/consulta-usuarios-conformidad-items.component';
import { ConsultaUsuariosConformidadComponent } from './components/usuario-organismo/consulta-usuarios-conformidad/consulta-usuarios-conformidad.component';
import { ConsultaUsuariosRecepcionPuntoComponent } from './components/usuario-organismo/consulta-usuarios-recepcion-punto/consulta-usuarios-recepcion-punto.component';
import { ConsultaUsuariosRecepcionComponent } from './components/usuario-organismo/consulta-usuarios-recepcion/consulta-usuarios-recepcion.component';
import { NuevoUsuarioPopupComponent } from './components/usuario-organismo/nuevo-usuario-popup/nuevo-usuario-popup.component';
import { NuevoUsuarioUcPopupComponent } from './components/usuario-organismo/nuevo-usuario-uc-popup/nuevo-usuario-uc-popup.component';
import { UnidadesCompraSicePopupComponent } from './components/usuario-organismo/unidades-compra-sice-popup/unidades-compra-sice-popup.component';
import { AgregarModificarProveedorPopupComponent } from './components/usuario-proveedor/agregar-modificar-proveedor-popup/agregar-modificar-proveedor-popup.component';
import { ConsultaUsuariosProveedorComponent } from './components/usuario-proveedor/consulta-usuarios-proveedor/consulta-usuarios-proveedor.component';
import { VincularEmpresaPopupComponent } from './components/usuario-proveedor/vincular-empresa-popup/vincular-empresa-popup.component';
import { ConsultaUsuariosRolesComponent } from './components/usuario-roles/consulta-usuarios-roles/consulta-usuarios-roles.component';
import { ConsultaUsuariosRolesCompraComponent } from './components/usuario-roles/consulta-usuarios-roles-compra/consulta-usuarios-roles-compra.component';
import { ConsultaUsuariosRolesItemsComponent } from './components/usuario-roles/consulta-usuarios-roles-items/consulta-usuarios-roles-items.component';
import { PuntoRecepcionResumenPipe } from './pipes/punto-recepcion-resumen.pipe';

const routes: Routes = [
    {
        path: 'consulta-usuario-proveedor',
        component: ConsultaUsuariosProveedorComponent,
        canActivate: [AuthGuard],
    },
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
        path: 'consulta-usuario-recepcion',
        component: ConsultaUsuariosRecepcionComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'consulta-usuario-recepcion/:idUsuario',
        component: ConsultaUsuariosRecepcionPuntoComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'consulta-usuario-conformidad/:idUsuario/items/:idCompra',
        component: ConsultaUsuariosConformidadItemsComponent,
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
        AgregarModificarProveedorPopupComponent,
        ConsultaUsuariosConformidadItemsComponent,
        PuntoRecepcionResumenPipe,
        ConsultaUsuariosProveedorComponent,
        VincularEmpresaPopupComponent,
        ConsultaUsuariosConformidadComponent,
        ConsultaUsuariosConformidadCompraComponent,
        ConsultaUsuariosRecepcionPuntoComponent,
        ConsultaUsuariosRecepcionComponent,
        NuevoUsuarioPopupComponent,
        NuevoUsuarioUcPopupComponent,
        UnidadesCompraSicePopupComponent,
        ConsultaUsuariosRolesComponent,
        ConsultaUsuariosRolesCompraComponent,
        ConsultaUsuariosRolesItemsComponent
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
