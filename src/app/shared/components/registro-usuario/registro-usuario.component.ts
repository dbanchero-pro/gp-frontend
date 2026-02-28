import { Component, Input } from "@angular/core";import { CommonModule } from '@angular/common';import { FormsModule, ReactiveFormsModule } from '@angular/forms';import { RouterModule } from '@angular/router';import { AlertModule } from 'ngx-bootstrap/alert';import { BsDropdownModule } from 'ngx-bootstrap/dropdown';import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';import { ModalModule } from 'ngx-bootstrap/modal';import { PaginationModule } from 'ngx-bootstrap/pagination';import { TabsModule } from 'ngx-bootstrap/tabs';import { TooltipModule } from 'ngx-bootstrap/tooltip';import { TypeaheadModule } from 'ngx-bootstrap/typeahead';import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';import { NgxEditorModule } from 'ngx-editor';import { NgxDatatableModule } from '@swimlane/ngx-datatable';
















@Component({
    selector: "app-registro-usuario",
    templateUrl: "./registro-usuario.component.html",
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

export class RegistroUsuario {

    @Input() usuario: any = {};
    @Input() correo: boolean = false;
    @Input() documento: boolean = false;
    @Input() accionEliminar!: () => void;

    constructor() { }

    ejecutarAccionEliminar() {
        if (this.accionEliminar) {
            this.accionEliminar();
        }
    }

    formatearDocumento(doc: string): string {
        if (!doc) return '';

        const partes = doc.toUpperCase().split('-');

        if (partes.length < 3) return doc.toUpperCase();

        const pais = partes[0];
        const tipo = partes[1];
        const numero = partes[2];

        return `${pais} ${tipo} ${numero}`;
    }

}



