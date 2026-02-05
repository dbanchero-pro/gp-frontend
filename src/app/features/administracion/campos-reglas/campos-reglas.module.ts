import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { ConsultaCamposReglasComponent } from './components/consulta-campos-reglas/consulta-campos-reglas.component';
import { AgregarModificarCampoPopupComponent } from './components/agregar-modificar-campo-popup/agregar-modificar-campo-popup.component';
import { AgregarModificarReglaPopupComponent } from './components/agregar-modificar-regla-popup/agregar-modificar-regla-popup.component';

export const routes: Routes = [
    {
        path: '',
        component: ConsultaCamposReglasComponent
    }
];

export const camposReglasRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        ConsultaCamposReglasComponent,
        AgregarModificarCampoPopupComponent,
        AgregarModificarReglaPopupComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class CamposReglasModule { }
