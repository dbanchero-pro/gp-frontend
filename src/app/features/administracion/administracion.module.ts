import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';
import { DeactivateGuard } from 'src/app/shared/guards/deactivate-guard';
import { AgregarModificarCapituloComponent } from './capitulos/components/agregar-modificar-capitulo/agregar-modificar-capitulo.component';
import { ConsultaCapitulosComponent } from './capitulos/components/consulta-capitulos/consulta-capitulos.component';
import { AgregarModificarClausulaComponent } from './clausulas/components/agregar-modificar-clausula/agregar-modificar-clausula.component';
import { AgregarModificarRedaccionComponent } from './clausulas/components/agregar-modificar-redaccion/agregar-modificar-redaccion.component';
import { ConsultaClausulasComponent } from './clausulas/components/consulta-clausulas/consulta-clausulas.component';
import { DiferenciasClausulasComponent } from './clausulas/components/diferencias-clausulas/diferencias-clausulas';
import { HistorialClausulasComponent } from './clausulas/components/historial-clausulas/historial-clausulas.component';
import { ModelosClausulaComponent } from './clausulas/components/modelos-clausula/modelos-clausula.component';
import { AgregarModificarModeloComponent } from './modelos/components/agregar-modificar-modelo/agregar-modificar-modelo.component';
import { ConsultaModelosComponent } from './modelos/components/consulta-modelos/consulta-modelos.component';
import { AgregarModificarRepositorioArchivoComponent } from './repositorio-archivos/components/agregar-modificar-repositorio-archivo/agregar-modificar-repositorio-archivo.component';
import { ConsultaRepositorioArchivosComponent } from './repositorio-archivos/components/consulta-repositorio-archivos/consulta-repositorio-archivos.component';
import { AgregarModificarSeccionComponent } from './secciones/components/agregar-modificar-seccion/agregar-modificar-seccion.component';
import { ConsultaSeccionesComponent } from './secciones/components/consulta-secciones/consulta-secciones.component';

const routes: Routes = [
    {
        path: 'campos-reglas',
        loadChildren: () =>
            import('./campos-reglas/campos-reglas.module').then(
                (m) => m.CamposReglasModule
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
    ],
    imports: [
        RouterModule.forChild(routes),
    ],
})
export class AdministracionModule {}

