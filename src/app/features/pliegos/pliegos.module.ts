import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DeactivateGuard } from '../../shared/guards/deactivate-guard';
import { AuthGuard } from '../../shared/guards/auth-guard';
import { ConsultaSeccionesComponent } from '../administracion/secciones/components/consulta-secciones/consulta-secciones.component';
import { AgregarModificarSeccionComponent } from '../administracion/secciones/components/agregar-modificar-seccion/agregar-modificar-seccion.component';
import { ConsultaModelosComponent } from '../administracion/modelos/components/consulta-modelos/consulta-modelos.component';
import { AgregarModificarModeloComponent } from '../administracion/modelos/components/agregar-modificar-modelo/agregar-modificar-modelo.component';
import { BandejaEntradaComponent } from './components/bandeja-entrada/bandeja-entrada.component';
import { CancelarPliegoPopupComponent } from './components/cancelar-pliego-popup/cancelar-pliego-popup.component';
import { AsignarUsuariosComponent } from './components/asignar-usuarios/asignar-usuarios.component';
import { AgregarUsuarioPopupComponent } from './components/asignar-usuarios/agregar-usuario-popup/agregar-usuario-popup.component';
import { ModificarUsuarioPopupComponent } from './components/asignar-usuarios/modificar-usuario-popup/modificar-usuario-popup.component';
import { AgregarModificarCapituloComponent } from '../administracion/capitulos/components/agregar-modificar-capitulo/agregar-modificar-capitulo.component';
import { ConsultaCapitulosComponent } from '../administracion/capitulos/components/consulta-capitulos/consulta-capitulos.component';
import { AgregarModificarClausulaComponent } from '../administracion/clausulas/components/agregar-modificar-clausula/agregar-modificar-clausula.component';
import { AgregarModificarRedaccionComponent } from '../administracion/clausulas/components/agregar-modificar-redaccion/agregar-modificar-redaccion.component';
import { ConsultaClausulasComponent } from '../administracion/clausulas/components/consulta-clausulas/consulta-clausulas.component';
import { DiferenciasClausulasComponent } from '../administracion/clausulas/components/diferencias-clausulas/diferencias-clausulas';
import { HistorialClausulasComponent } from '../administracion/clausulas/components/historial-clausulas/historial-clausulas.component';
import { ModelosClausulaComponent } from '../administracion/clausulas/components/modelos-clausula/modelos-clausula.component';
import { AgregarModificarRepositorioArchivoComponent } from '../administracion/repositorio-archivos/components/agregar-modificar-repositorio-archivo/agregar-modificar-repositorio-archivo.component';
import { ConsultaRepositorioArchivosComponent } from '../administracion/repositorio-archivos/components/consulta-repositorio-archivos/consulta-repositorio-archivos.component';
import { ElaborarPliegoComponent } from './components/elaborar-pliego/elaborar-pliego';
import { IniciarPliegoComponent } from './components/iniciar-pliego/iniciar-pliego.component';

export const routes: Routes = [
    
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
        path: 'bandeja-entrada/elaborar/:id',
        component: ElaborarPliegoComponent,
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
        IniciarPliegoComponent,
        ElaborarPliegoComponent
    ], imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class PliegosModule { }

