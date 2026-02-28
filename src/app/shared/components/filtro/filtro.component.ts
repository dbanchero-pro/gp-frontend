import { Component, EventEmitter, Input, Output } from '@angular/core';import { CommonModule } from '@angular/common';import { FormsModule, ReactiveFormsModule } from '@angular/forms';import { RouterModule } from '@angular/router';import { AlertModule } from 'ngx-bootstrap/alert';import { BsDropdownModule } from 'ngx-bootstrap/dropdown';import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';import { ModalModule } from 'ngx-bootstrap/modal';import { PaginationModule } from 'ngx-bootstrap/pagination';import { TabsModule } from 'ngx-bootstrap/tabs';import { TooltipModule } from 'ngx-bootstrap/tooltip';import { TypeaheadModule } from 'ngx-bootstrap/typeahead';import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';import { NgxEditorModule } from 'ngx-editor';import { NgxDatatableModule } from '@swimlane/ngx-datatable';















@Component({
    selector: 'app-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
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
    NgxDatatableModule
  ],
})
export class FiltroComponent {
    @Output() evFilter = new EventEmitter<any>();
    @Output() evDownload = new EventEmitter<any>();
    @Output() evCollapse = new EventEmitter<any>();
    @Input() title = 'Búsqueda';
    @Input() titleBtn = 'Aplicar filtros';
    @Input() iconTitle: string = 'fa fa-search';
    @Input() activarCollapse = true;
    @Input() mostrarFiltros = true;
    @Input() mostrarBtnFilter = true;
    @Input() claseCabezal = "";

    public collapsed = false;

    constructor() { 
        this.collapsed = false;
    }

    download(): void {
        this.evDownload.emit();
    }

    filter(): void {
        this.evFilter.emit();
    }

    toggleCollapse(): boolean {
        this.collapsed = !this.collapsed;
        this.evCollapse.emit();
        return this.collapsed;
    }

}


