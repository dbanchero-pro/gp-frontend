import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';
import { DeactivateGuard } from 'src/app/shared/guards/deactivate-guard';
import { SharedModule } from '../../../shared/shared.module';
import { AgregarModificarPuntoRecepcionComponent } from './components/agregar-modificar/agregar-modificar-punto-recepcion/agregar-modificar-punto-recepcion.component';
import { ElementosPuntosRecepcionComponent } from './components/consulta/elementos-puntos-recepcion/elementos-puntos-recepcion.component';
import { GestionPuntosRecepcionComponent } from './components/consulta/gestion-puntos-recepcion/gestion-puntos-recepcion.component';
import { ResponsablesPuntoRecepcionComponent } from './components/consulta/responsables-punto-recepcion/responsables-punto-recepcion.component';

const routes: Routes = [
    {
        path: '',
        component: GestionPuntosRecepcionComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'modificar/:idPC',
        component: AgregarModificarPuntoRecepcionComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    }
    ,
    {
        path: 'agregar',
        component: AgregarModificarPuntoRecepcionComponent,
        canActivate: [AuthGuard],
        canDeactivate: [DeactivateGuard]
    }
    ,
    {
        path: 'responsables/:idPC',
        component: ResponsablesPuntoRecepcionComponent,
        canActivate: [AuthGuard],
    }

];

export const manageEmialsRoutingModule: ModuleWithProviders<RouterModule> =
    RouterModule.forChild(routes);

@NgModule({
    declarations: [
        GestionPuntosRecepcionComponent,
        ElementosPuntosRecepcionComponent,
        AgregarModificarPuntoRecepcionComponent,
        ResponsablesPuntoRecepcionComponent,
    ],
    imports: [CommonModule, SharedModule, RouterModule.forChild(routes),],
    providers: [],
    exports: [
        ElementosPuntosRecepcionComponent
    ]
})
export class PuntosRecepcionModule { }
