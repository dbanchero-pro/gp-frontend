import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';
import { DeactivateGuard } from 'src/app/shared/guards/deactivate-guard';
import { AgregarModificarCapituloComponent } from './components/capitulos/agregar-modificar-capitulo/agregar-modificar-capitulo.component';
import { ConsultaCapitulosComponent } from './components/capitulos/consulta-capitulos/consulta-capitulos.component';
import { AgregarModificarClausulaComponent } from './components/clausulas/agregar-modificar-clausula/agregar-modificar-clausula.component';
import { AgregarModificarRedaccionComponent } from './components/clausulas/agregar-modificar-redaccion/agregar-modificar-redaccion.component';
import { ConsultaClausulasComponent } from './components/clausulas/consulta-clausulas/consulta-clausulas.component';
import { DiferenciasClausulasComponent } from './components/clausulas/diferencias-clausulas/diferencias-clausulas.component';
import { HistorialClausulasComponent } from './components/clausulas/historial-clausulas/historial-clausulas.component';
import { ModelosClausulaComponent } from './components/clausulas/modelos-clausula/modelos-clausula.component';
import { AgregarModificarModeloComponent } from './components/modelos/agregar-modificar-modelo/agregar-modificar-modelo.component';
import { ConsultaModelosComponent } from './components/modelos/consulta-modelos/consulta-modelos.component';
import { AgregarModificarRepositorioArchivoComponent } from './components/repositorio-archivos/agregar-modificar-repositorio-archivo/agregar-modificar-repositorio-archivo.component';
import { ConsultaRepositorioArchivosComponent } from './components/repositorio-archivos/consulta-repositorio-archivos/consulta-repositorio-archivos.component';
import { AgregarModificarSeccionComponent } from './components/secciones/agregar-modificar-seccion/agregar-modificar-seccion.component';
import { ConsultaSeccionesComponent } from './components/secciones/consulta-secciones/consulta-secciones.component';
import { AgregarModificarCampoComponent } from './components/campos-reglas/agregar-modificar-campo/agregar-modificar-campo.component';
import { ConsultaUsuariosRolesComponent } from './components/gestion-usuarios/usuario-roles/consulta-usuarios-roles/consulta-usuarios-roles.component';
import { ConsultaUsuariosRolesCompraComponent } from './components/gestion-usuarios/usuario-roles/consulta-usuarios-roles-compra/consulta-usuarios-roles-compra.component';
import { ConsultaUsuariosRolesItemsComponent } from './components/gestion-usuarios/usuario-roles/consulta-usuarios-roles-items/consulta-usuarios-roles-items.component';
import { ConsultaUsuariosConformidadCompraComponent } from './components/gestion-usuarios/usuario-organismo/consulta-usuarios-conformidad-compra/consulta-usuarios-conformidad-compra.component';
import { ConsultaUsuariosConformidadComponent } from './components/gestion-usuarios/usuario-organismo/consulta-usuarios-conformidad/consulta-usuarios-conformidad.component';
import { NuevoUsuarioPopupComponent } from './components/gestion-usuarios/usuario-organismo/nuevo-usuario-popup/nuevo-usuario-popup.component';
import { NuevoUsuarioTipoCompraPopupComponent } from './components/gestion-usuarios/usuario-organismo/nuevo-usuario-tipo-compra-popup/nuevo-usuario-tipo-compra-popup.component';
import { NuevoUsuarioUcPopupComponent } from './components/gestion-usuarios/usuario-organismo/nuevo-usuario-uc-popup/nuevo-usuario-uc-popup.component';
import { UnidadesCompraSicePopupComponent } from './components/gestion-usuarios/usuario-organismo/unidades-compra-sice-popup/unidades-compra-sice-popup.component';
import { ModificarRolPopupComponent } from './components/gestion-usuarios/usuario-roles/modificar-rol-popup/modificar-rol-popup.component';
import { AgregarModificarReglaPopupComponent } from './components/campos-reglas/agregar-modificar-regla-popup/agregar-modificar-regla-popup.component';
import { ConsultaCamposReglasComponent } from './components/campos-reglas/consulta-campos-reglas/consulta-campos-reglas.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { NumeroCompraPipe } from 'src/app/shared/pipes/nro-compra-pipe';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
const routes: Routes = [
    {
        path: 'campos-reglas',
        component: ConsultaCamposReglasComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'campos-reglas/agregar',
        component: AgregarModificarCampoComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'campos-reglas/modificar/:idCampo',
        component: AgregarModificarCampoComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
       
    {
        path: 'gestion-usuarios/consulta-usuario-roles',
        component: ConsultaUsuariosRolesComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'gestion-usuarios/consulta-usuario-roles/:idUsuario',
        component: ConsultaUsuariosRolesCompraComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'gestion-usuarios/consulta-usuario-roles/:idUsuario/items/:idCompra',
        component: ConsultaUsuariosRolesItemsComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'repositorio-archivos',
        component: ConsultaRepositorioArchivosComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'repositorio-archivos/agregar',
        component: AgregarModificarRepositorioArchivoComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'repositorio-archivos/modificar/:idDocumento',
        component: AgregarModificarRepositorioArchivoComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas',
        component: ConsultaClausulasComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'clausulas/historial/:id',
        component: HistorialClausulasComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'clausulas/diferencias/:id',
        component: DiferenciasClausulasComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'clausulas/modelos/:id',
        component: ModelosClausulaComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'clausulas/agregar',
        component: AgregarModificarClausulaComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/agregar/redaccion/agregar',
        component: AgregarModificarRedaccionComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/agregar/redaccion/modificar/:idRedaccion',
        component: AgregarModificarRedaccionComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/modificar/:idClausula',
        component: AgregarModificarClausulaComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/modificar/:idClausula/redaccion/agregar',
        component: AgregarModificarRedaccionComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/modificar/:idClausula/redaccion/modificar/:idRedaccion',
        component: AgregarModificarRedaccionComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'capitulos',
        component: ConsultaCapitulosComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'capitulos/agregar',
        component: AgregarModificarCapituloComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'capitulos/modificar/:idCapitulo',
        component: AgregarModificarCapituloComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'secciones',
        component: ConsultaSeccionesComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'secciones/agregar',
        component: AgregarModificarSeccionComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'secciones/modificar/:idSeccion',
        component: AgregarModificarSeccionComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'modelos',
        component: ConsultaModelosComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'modelos/agregar',
        component: AgregarModificarModeloComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'modelos/modificar/:idModelo',
        component: AgregarModificarModeloComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    }

];

export const manageEmialsRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        ConsultaCamposReglasComponent,
        AgregarModificarCampoComponent,
        AgregarModificarReglaPopupComponent,
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
    ],
})
export class AdministracionModule {}

