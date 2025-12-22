import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';
import { SharedModule } from 'src/app/shared/shared.module';
import { AgregarDescargoAjustePopupComponent } from './components/agregar-descargo-ajuste-popup/agregar-descargo-ajuste-popup.component';
import { AgregarModificarAjustePopupComponent } from './components/agregar-modificar-ajuste-popup/agregar-modificar-ajuste-popup.component';
import { AjusteDetalleComponent } from './components/ajuste-detalle/ajuste-detalle.component';
import { AuditoriaAjusteComponent } from './components/auditoria/auditoria-ajuste/auditoria-ajuste.component';
import { AjusteMasivoItemsPopupComponent } from './components/ajuste-masivo-items-popup/ajuste-masivo-items-popup.component';
import { AjusteErroresPopupComponent } from './components/ajuste-errores-popup/ajuste-errores-popup.component';
import { ResolucionAjustePopupComponent } from './components/resolucion-ajuste/resolucion-ajuste-popup.component';
import { VerAjustesComponent } from './components/ver-ajustes/ver-ajustes.component';
import { TipoAjusteResumenPipe } from './pipes/tipo-ajuste-resumen.pipe';

const routes: Routes = [
    {
        path: 'auditoria-ajustes',
        component: AuditoriaAjusteComponent,
        canActivate: [AuthGuard]
    },
    { path: ':idOrdenCompra', component: VerAjustesComponent },
    { path: ':idOrdenCompra/item/:idItemOrdenCompra/:idVariacion', component: VerAjustesComponent },
    
];

@NgModule({
    declarations: [
        VerAjustesComponent,
        TipoAjusteResumenPipe,
        AgregarModificarAjustePopupComponent,
        AjusteMasivoItemsPopupComponent,
        AjusteErroresPopupComponent,
        ResolucionAjustePopupComponent,
        AgregarDescargoAjustePopupComponent,
        ResolucionAjustePopupComponent,
        AuditoriaAjusteComponent,
        AjusteDetalleComponent
    ],
    
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes),
    ],
    exports: [TipoAjusteResumenPipe],
})
export class AjustesModule { }

