import { Component, OnInit } from '@angular/core';
import { ActualizarService } from '../../services/common/actualizar.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
    selector: 'app-pagina-403',
    templateUrl: './pagina403.component.html',
    styleUrls: ['./pagina403.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AlertModule,
        BsDropdownModule,
        BsDatepickerModule,
        ModalModule,
        PaginationModule,
        TabsModule,
        TooltipModule,
        TypeaheadModule,
        NgxDaterangepickerBootstrapModule,
        NgxEditorModule,
        NgxDatatableModule,
    ],
})
export class Pagina403Component implements OnInit {
    constructor(private readonly actualizarServ: ActualizarService) {}

    ngOnInit() {
        this.actualizarServ.subTitulo('');
    }
}
