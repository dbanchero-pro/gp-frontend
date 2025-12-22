import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';
import { SharedModule } from 'src/app/shared/shared.module';
import { PuntosRecepcionModule } from '../administracion/puntos-recepcion/puntos-recepcion.module';
import { AuditoriaEntregaComponent } from './components/auditoria/auditoria-entrega/auditoria-entrega.component';
import { CantidadPorcentajeComponent } from './components/comun/cantidad-porcentaje/cantidad-porcentaje.component';
import { ConformidadDetalleComponent } from './components/comun/conformidad-detalle/conformidad-detalle.component';
import { EntregaDetalleComponent } from './components/comun/entrega-detalle/entrega-detalle.component';
import { EntregaComponent } from './components/comun/entrega/entrega.component';
import { EntregableCabezalComponent } from './components/comun/entregable-cabezal/entregable-cabezal.component';
import { EntregableComponent } from './components/comun/entregable/entregable.component';
import { PuntoRecepcionPopupComponent } from './components/comun/punto-recepcion-popup/punto-recepcion-popup.component';
import { RecepcionDetalleComponent } from './components/comun/recepcion-detalle/recepcion-detalle.component';
import { ConformidadEntregaPopupComponent } from './components/conformidad/conformidad-entrega-popup/conformidad-entrega-popup.component';
import { ConformidadTodosPopupComponent } from './components/conformidad/conformidad-todos-popup/conformidad-todos-popup.component';
import { AgregarDescargoEntregaPopupComponent } from './components/descargo/agregar-descargo-entrega-popup/agregar-descargo-entrega-popup.component';
import { RecepcionEntregaPopupComponent } from './components/recepcion/recepcion-entrega-popup/recepcion-entrega-popup.component';
import { RecepcionTodosPopupComponent } from './components/recepcion/recepcion-todos-popup/recepcion-todos-popup.component';
import { AgregarDocumentoPopupComponent } from './components/seguimiento/agregar-documento-popup/agregar-documento-popup.component';
import { AgregarModificarEntregaBienPopupComponent } from './components/seguimiento/agregar-modificar-entrega-bien-popup/agregar-modificar-entrega-bien-popup.component';
import { AgregarModificarEntregaObraPopupComponent } from './components/seguimiento/agregar-modificar-entrega-obra-popup/agregar-modificar-entrega-obra-popup.component';
import { AgregarModificarEntregablePopupComponent } from './components/seguimiento/agregar-modificar-entregable-popup/agregar-modificar-entregable-popup.component';
import { CaracteristicasItemPopupComponent } from './components/seguimiento/caracteristicas-item-popup/caracteristicas-item-popup.component';
import { SeguimientoEntregaProveedorOrganismoComponent } from './components/seguimiento/seguimiento-entrega-proveedor-organismo/seguimiento-entrega-proveedor-organismo.component';
import { SeguimientoEntregaComponent } from './components/seguimiento/seguimiento-entrega/seguimiento-entrega.component';
import { SeguimientoEntregableComponent } from './components/seguimiento/seguimiento-entregable/seguimiento-entregable.component';
import { SeguimientoItem } from './components/seguimiento/seguimiento-item/seguimiento-item.component';
import { TipoSeguimiento } from './enum/tipo-seguimiento.enum';
import { EntregableResumenPipe } from './pipes/entregable-resumen.pipe';
import { ItemEstadoPipe } from './pipes/item-estado.pipe';

export const routes: Routes = [
    {
        path: 'seguimiento-proveedor',
        component: SeguimientoEntregaProveedorOrganismoComponent,
        data: { tipoSeguimiento: TipoSeguimiento.Proveedor },
        canActivate: [AuthGuard]
    },
    {
        path: 'seguimiento-organismo',
        component: SeguimientoEntregaProveedorOrganismoComponent,
        data: { tipoSeguimiento: TipoSeguimiento.Organismo },
        canActivate: [AuthGuard]
    },
    {
        path: 'seguimiento-proveedor/ordenes/:idOrdenCompra/items',
        component: SeguimientoItem,
        data: { tipoSeguimiento: TipoSeguimiento.Proveedor },
        canActivate: [AuthGuard]
    },
    {
        path: 'seguimiento-organismo/ordenes/:idOrdenCompra/items',
        component: SeguimientoItem,
        data: { tipoSeguimiento: TipoSeguimiento.Organismo },
        canActivate: [AuthGuard]
    },
    {
        path: 'auditoria-entregas',
        component: AuditoriaEntregaComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'seguimiento-organismo/ordenes/:idOrdenCompra/items/:idItemOrdenCompra/:idVariacion/entregas',
        component: SeguimientoEntregaComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'seguimiento-organismo/ordenes/:idOrdenCompra/items/:idItemOrdenCompra/:idVariacion/entregables',
        component: SeguimientoEntregableComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'seguimiento-proveedor/ordenes/:idOrdenCompra/items/:idItemOrdenCompra/:idVariacion/entregas',
        component: SeguimientoEntregaComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'seguimiento-proveedor/ordenes/:idOrdenCompra/items/:idItemOrdenCompra/:idVariacion/entregables',
        component: SeguimientoEntregableComponent,
        canActivate: [AuthGuard]
    },
];

export const manageEmialsRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        SeguimientoEntregaProveedorOrganismoComponent,
        SeguimientoItem,
        PuntoRecepcionPopupComponent,
        CaracteristicasItemPopupComponent,
        SeguimientoEntregaComponent,
        AuditoriaEntregaComponent,
        SeguimientoEntregableComponent,
        EntregableComponent,
        EntregableCabezalComponent,
        AgregarModificarEntregaBienPopupComponent,
        AgregarModificarEntregablePopupComponent,
        AgregarModificarEntregaObraPopupComponent,
        AgregarDocumentoPopupComponent,
        EntregableResumenPipe,
        EntregaComponent,
        CantidadPorcentajeComponent,
        RecepcionTodosPopupComponent,
        RecepcionEntregaPopupComponent,
        AgregarDescargoEntregaPopupComponent,
        ConformidadTodosPopupComponent,
        ConformidadEntregaPopupComponent,
        EntregaDetalleComponent,
        RecepcionDetalleComponent,
        ConformidadDetalleComponent,
        ItemEstadoPipe,
    ], imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
        PuntosRecepcionModule
    ]
})
export class EntregasModule { }

