import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DeactivateGuard } from '../../shared/guards/deactivate-guard';
import { AuthGuard } from '../../shared/guards/auth-guard';
import { ConsultaRepositorioArchivosComponent } from './components/repositorio-archivos/consulta-repositorio-archivos/consulta-repositorio-archivos.component';
import { AgregarModificarRepositorioArchivoComponent } from './components/repositorio-archivos/agregar-modificar-repositorio-archivo/agregar-modificar-repositorio-archivo.component';
import { ConsultaClausulasComponent } from './components/clausulas/consulta-clausulas/consulta-clausulas.component';
import { AgregarModificarClausulaComponent } from './components/clausulas/agregar-modificar-clausula/agregar-modificar-clausula.component';
import { AgregarModificarRedaccionPopupComponent } from './components/clausulas/agregar-modificar-redaccion-popup/agregar-modificar-redaccion-popup.component';
import { AgregarModificarRedaccionComponent } from './components/clausulas/agregar-modificar-redaccion/agregar-modificar-redaccion.component';
import { HistorialClausulasComponent } from './components/clausulas/historial-clausulas/historial-clausulas.component';
import { DiferenciasClausulasComponent } from './components/clausulas/diferencias-clausulas/diferencias-clausulas';
import { ModelosClausulaComponent } from './components/clausulas/modelos-clausula/modelos-clausula.component';
import { ConsultaCapitulosComponent } from './components/capitulos/consulta-capitulos/consulta-capitulos.component';
import { AgregarModificarCapituloComponent } from './components/capitulos/agregar-modificar-capitulo/agregar-modificar-capitulo.component';
import { ConsultaSeccionesComponent } from './components/secciones/consulta-secciones/consulta-secciones.component';
import { AgregarModificarSeccionComponent } from './components/secciones/agregar-modificar-seccion/agregar-modificar-seccion.component';
import { ConsultaModelosComponent } from './components/modelos/consulta-modelos/consulta-modelos.component';
import { AgregarModificarModeloComponent } from './components/modelos/agregar-modificar-modelo/agregar-modificar-modelo.component';
import { BandejaEntradaComponent } from './components/bandeja-entrada/bandeja-entrada.component';
import { CancelarPliegoPopupComponent } from './components/bandeja-entrada/cancelar-pliego-popup/cancelar-pliego-popup';
import { AsignarUsuariosComponent } from './components/bandeja-entrada/asignar-usuarios/asignar-usuarios.component';
import { AgregarUsuarioPopupComponent } from './components/bandeja-entrada/asignar-usuarios/agregar-usuario-popup/agregar-usuario-popup.component';
import { ModificarUsuarioPopupComponent } from './components/bandeja-entrada/asignar-usuarios/modificar-usuario-popup/modificar-usuario-popup.component';
import { IniciarPliegoComponent } from './components/bandeja-entrada/iniciar-pliego/iniciar-pliego.component';

export const routes: Routes = [
    {
        path: 'campos-reglas',
        loadChildren: () =>
            import('./campos-reglas/campos-reglas.module').then(
                (m) => m.CamposReglasModule
            ),
        canActivate: [AuthGuard],
    },
    {
        path: 'bandeja-entrada',
        component: BandejaEntradaComponent
    },
    {
        path: 'bandeja-entrada/asignar/:id',
        component: AsignarUsuariosComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'bandeja-entrada/iniciar/:id',
        component: IniciarPliegoComponent
    },
    {
        path: 'repositorio-archivos',
        component: ConsultaRepositorioArchivosComponent
    },
    {
        path: 'repositorio-archivos/agregar',
        component: AgregarModificarRepositorioArchivoComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'repositorio-archivos/modificar/:idDocumento',
        component: AgregarModificarRepositorioArchivoComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas',
        component: ConsultaClausulasComponent
    },
    {
        path: 'clausulas/historial/:id',
        component: HistorialClausulasComponent
    },
    {
        path: 'clausulas/diferencias/:id',
        component: DiferenciasClausulasComponent
    },
    {
        path: 'clausulas/modelos/:id',
        component: ModelosClausulaComponent
    },
    {
        path: 'clausulas/agregar',
        component: AgregarModificarClausulaComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/agregar/redaccion/agregar',
        component: AgregarModificarRedaccionComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/agregar/redaccion/modificar/:idRedaccion',
        component: AgregarModificarRedaccionComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/modificar/:idClausula',
        component: AgregarModificarClausulaComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/modificar/:idClausula/redaccion/agregar',
        component: AgregarModificarRedaccionComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/modificar/:idClausula/redaccion/modificar/:idRedaccion',
        component: AgregarModificarRedaccionComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'capitulos',
        component: ConsultaCapitulosComponent
    },
    {
        path: 'capitulos/agregar',
        component: AgregarModificarCapituloComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'capitulos/modificar/:idCapitulo',
        component: AgregarModificarCapituloComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'secciones',
        component: ConsultaSeccionesComponent
    },
    {
        path: 'secciones/agregar',
        component: AgregarModificarSeccionComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'secciones/modificar/:idSeccion',
        component: AgregarModificarSeccionComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'modelos',
        component: ConsultaModelosComponent
    },
    {
        path: 'modelos/agregar',
        component: AgregarModificarModeloComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'modelos/modificar/:idModelo',
        component: AgregarModificarModeloComponent,
        canDeactivate: [DeactivateGuard]
    }
];

export const manageEmialsRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        ConsultaRepositorioArchivosComponent,
        AgregarModificarRepositorioArchivoComponent,
        ConsultaClausulasComponent,
        AgregarModificarClausulaComponent,
        AgregarModificarRedaccionPopupComponent,
        AgregarModificarRedaccionComponent,
        HistorialClausulasComponent,
        DiferenciasClausulasComponent,
        ModelosClausulaComponent,
        ConsultaCapitulosComponent,
        AgregarModificarCapituloComponent,
        ConsultaSeccionesComponent,
        AgregarModificarSeccionComponent,
        ConsultaModelosComponent,
        AgregarModificarModeloComponent,
        BandejaEntradaComponent,
        CancelarPliegoPopupComponent,
        AsignarUsuariosComponent,
        AgregarUsuarioPopupComponent,
        ModificarUsuarioPopupComponent,
        IniciarPliegoComponent
    ], imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class PliegosModule { }

