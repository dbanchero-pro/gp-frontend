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
        path: 'clausulas/agregar',
        component: AgregarModificarClausulaComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'clausulas/modificar/:idClausula',
        component: AgregarModificarClausulaComponent,
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
        AgregarModificarRedaccionPopupComponent
    ], imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class PliegosModule { }

