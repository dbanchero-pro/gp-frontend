import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ConsultaRepositorioArchivosComponent } from './components/repositorio-archivos/consulta-repositorio-archivos/consulta-repositorio-archivos.component';
import { AgregarDocumentoRepositorioPopupComponent } from './components/repositorio-archivos/agregar-documento-repositorio-popup/agregar-documento-repositorio-popup.component';

export const routes: Routes = [
    {
        path: 'repositorio-archivos',
        component: ConsultaRepositorioArchivosComponent
    }
];

export const manageEmialsRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        ConsultaRepositorioArchivosComponent,
        AgregarDocumentoRepositorioPopupComponent
    ], imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class PliegosModule { }

