import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DeactivateGuard } from '../../shared/guards/deactivate-guard';
import { ConsultaRepositorioArchivosComponent } from './components/repositorio-archivos/consulta-repositorio-archivos/consulta-repositorio-archivos.component';
import { AgregarDocumentoRepositorioPopupComponent } from './components/repositorio-archivos/agregar-documento-repositorio-popup/agregar-documento-repositorio-popup.component';
import { ConsultaClausulasComponent } from './components/clausulas/consulta-clausulas/consulta-clausulas.component';
import { AgregarModificarClausulaComponent } from './components/clausulas/agregar-modificar-clausula/agregar-modificar-clausula.component';
import { AgregarModificarRedaccionPopupComponent } from './components/clausulas/agregar-modificar-redaccion-popup/agregar-modificar-redaccion-popup.component';
import { AgregarModificarRedaccionComponent } from './components/clausulas/agregar-modificar-redaccion/agregar-modificar-redaccion.component';
import { HistorialClausulasComponent } from './components/clausulas/historial-clausulas/historial-clausulas.component';
import { ConsultaCapitulosComponent } from './components/capitulos/consulta-capitulos/consulta-capitulos.component';
import { AgregarModificarCapituloComponent } from './components/capitulos/agregar-modificar-capitulo/agregar-modificar-capitulo.component';
import { ConsultaSeccionesComponent } from './components/secciones/consulta-secciones/consulta-secciones.component';
import { AgregarModificarSeccionComponent } from './components/secciones/agregar-modificar-seccion/agregar-modificar-seccion.component';
import { ConsultaModelosComponent } from './components/modelos/consulta-modelos/consulta-modelos.component';
import { AgregarModificarModeloComponent } from './components/modelos/agregar-modificar-modelo/agregar-modificar-modelo.component';

export const routes: Routes = [
    {
        path: 'repositorio-archivos',
        component: ConsultaRepositorioArchivosComponent
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
        AgregarDocumentoRepositorioPopupComponent,
        ConsultaClausulasComponent,
        AgregarModificarClausulaComponent,
        AgregarModificarRedaccionPopupComponent,
        AgregarModificarRedaccionComponent,
        HistorialClausulasComponent,
        ConsultaCapitulosComponent,
        AgregarModificarCapituloComponent,
        ConsultaSeccionesComponent,
        AgregarModificarSeccionComponent,
        ConsultaModelosComponent,
        AgregarModificarModeloComponent
    ], imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class PliegosModule { }

