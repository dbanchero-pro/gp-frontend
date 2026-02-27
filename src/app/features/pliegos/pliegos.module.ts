import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { DeactivateGuard } from '../../shared/guards/deactivate-guard';
import { AuthGuard } from '../../shared/guards/auth-guard';
import { AgregarModificarCapituloComponent } from '../administracion/components/capitulos/agregar-modificar-capitulo/agregar-modificar-capitulo.component';
import { ConsultaCapitulosComponent } from '../administracion/components/capitulos/consulta-capitulos/consulta-capitulos.component';
import { AgregarModificarClausulaComponent } from '../administracion/components/clausulas/agregar-modificar-clausula/agregar-modificar-clausula.component';
import { AgregarModificarRedaccionComponent } from '../administracion/components/clausulas/agregar-modificar-redaccion/agregar-modificar-redaccion.component';
import { ConsultaClausulasComponent } from '../administracion/components/clausulas/consulta-clausulas/consulta-clausulas.component';
import { DiferenciasClausulasComponent } from '../administracion/components/clausulas/diferencias-clausulas/diferencias-clausulas.component';
import { HistorialClausulasComponent } from '../administracion/components/clausulas/historial-clausulas/historial-clausulas.component';
import { ModelosClausulaComponent } from '../administracion/components/clausulas/modelos-clausula/modelos-clausula.component';
import { AgregarModificarModeloComponent } from '../administracion/components/modelos/agregar-modificar-modelo/agregar-modificar-modelo.component';
import { ConsultaModelosComponent } from '../administracion/components/modelos/consulta-modelos/consulta-modelos.component';
import { AgregarModificarRepositorioArchivoComponent } from '../administracion/components/repositorio-archivos/agregar-modificar-repositorio-archivo/agregar-modificar-repositorio-archivo.component';
import { ConsultaRepositorioArchivosComponent } from '../administracion/components/repositorio-archivos/consulta-repositorio-archivos/consulta-repositorio-archivos.component';
import { AgregarModificarSeccionComponent } from '../administracion/components/secciones/agregar-modificar-seccion/agregar-modificar-seccion.component';
import { ConsultaSeccionesComponent } from '../administracion/components/secciones/consulta-secciones/consulta-secciones.component';
import { AgregarUsuarioPopupComponent } from './components/asignar-usuarios/agregar-usuario-popup/agregar-usuario-popup.component';
import { AsignarUsuariosComponent } from './components/asignar-usuarios/asignar-usuarios.component';
import { ModificarUsuarioPopupComponent } from './components/asignar-usuarios/modificar-usuario-popup/modificar-usuario-popup.component';
import { BandejaEntradaComponent } from './components/bandeja-entrada/bandeja-entrada.component';
import { CancelarPliegoPopupComponent } from './components/cancelar-pliego-popup/cancelar-pliego-popup.component';
import { ElaborarPliegoComponent } from './components/elaborar-pliego/elaborar-pliego';
import { IniciarPliegoComponent } from './components/iniciar-pliego/iniciar-pliego.component';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { CompraResumenPipe } from 'src/app/shared/pipes/compra-resumen.pipe';
import { FormatoCiPipe } from 'src/app/shared/pipes/formato-ci.pipe';
import { NumeroCompraPipe } from 'src/app/shared/pipes/nro-compra-pipe';

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
        NgxMaskDirective,
    ],
    providers: [provideNgxMask()],
    exports: [FormatoCiPipe, CompraResumenPipe],
})
export class PliegosModule { }

