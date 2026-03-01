import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
    selector: 'app-alert-dialog',
    templateUrl: './alert-dialog.component.html',
    styleUrls: ['./alert-dialog.component.scss'],
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
export class AlertDialogComponent {
    modalRef!: BsModalRef;

    @ViewChild('template', { read: TemplateRef })
    modalMensaje!: TemplateRef<any>;
    titulo: string = 'Alerta';
    mensajeInicial: string = '';
    textoAdicional: string = '';
    mostrarTextoAdicional: boolean = false;
    constructor(
        private readonly modalService: BsModalService,
        private readonly actualizar: ActualizarService,
    ) {
        this.actualizar.alerta$.subscribe((data: any[]) => {
            if (data.length === 1) {
                this.mensajeInicial = data[0];
                this.openModal(this.modalMensaje);
            } else if (data.length === 2) {
                this.titulo = data[0];
                this.mensajeInicial = data[1];
                this.openModal(this.modalMensaje);
            } else if (data.length === 3) {
                this.titulo = data[0];
                this.mensajeInicial = data[1];
                this.textoAdicional = data[2];
                this.mostrarTextoAdicional = true;
                this.openModal(this.modalMensaje);
            }
        });
    }

    openModal(template: TemplateRef<any>): void {
        this.modalService.onShown.subscribe(() => {
            (
                document.querySelector(
                    " button[autofocus='true']",
                ) as HTMLElement
            ).focus();
        });
        this.modalRef = this.modalService.show(template, {
            class: 'modal-dialog-centered',
        });
    }
}
