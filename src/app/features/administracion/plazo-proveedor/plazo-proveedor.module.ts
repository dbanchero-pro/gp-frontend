import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { SharedModule } from 'src/app/shared/shared.module';
import { AuthGuard } from 'src/app/shared/guards/auth-guard';

import { ConfigurarPlazoComponent } from './components/configurar-plazo/configurar-plazo.component';

const routes: Routes = [
    {
        path: 'configurar-plazo',
        component: ConfigurarPlazoComponent,
        canActivate: [AuthGuard]
    }
];

@NgModule({
    declarations: [
        ConfigurarPlazoComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        SharedModule,
        RouterModule.forChild(routes)
    ]
})
export class PlazoProveedorModule { }
