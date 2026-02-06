import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../../shared/shared.module';
import { DeactivateGuard } from '../../../shared/guards/deactivate-guard';
import { ConsultaCamposReglasComponent } from './components/consulta-campos-reglas/consulta-campos-reglas.component';
import { AgregarModificarCampoComponent } from './components/agregar-modificar-campo/agregar-modificar-campo.component';
import { AgregarModificarReglaPopupComponent } from './components/agregar-modificar-regla-popup/agregar-modificar-regla-popup.component';

export const routes: Routes = [
    {
        path: '',
        component: ConsultaCamposReglasComponent
    },
    {
        path: 'agregar',
        component: AgregarModificarCampoComponent,
        canDeactivate: [DeactivateGuard]
    },
    {
        path: 'modificar/:idCampo',
        component: AgregarModificarCampoComponent,
        canDeactivate: [DeactivateGuard]
    }
];

export const camposReglasRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        ConsultaCamposReglasComponent,
        AgregarModificarCampoComponent,
        AgregarModificarReglaPopupComponent
    ],
    imports: [
        CommonModule,
        SharedModule,
        RouterModule.forChild(routes),
    ]
})
export class CamposReglasModule { }
