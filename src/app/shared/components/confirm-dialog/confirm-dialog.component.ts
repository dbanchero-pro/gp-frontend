import { Component, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { ActualizarService } from '../../services/common/actualizar.service';
import { LoggerService } from '../../services/common/logger.service';import { CommonModule } from '@angular/common';import { FormsModule, ReactiveFormsModule } from '@angular/forms';import { RouterModule } from '@angular/router';import { AlertModule } from 'ngx-bootstrap/alert';import { BsDropdownModule } from 'ngx-bootstrap/dropdown';import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';import { PaginationModule } from 'ngx-bootstrap/pagination';import { TabsModule } from 'ngx-bootstrap/tabs';import { TooltipModule } from 'ngx-bootstrap/tooltip';import { TypeaheadModule } from 'ngx-bootstrap/typeahead';import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';import { NgxEditorModule } from 'ngx-editor';import { NgxDatatableModule } from '@swimlane/ngx-datatable';














@Component({
    selector: 'app-confirm-dialog',
    templateUrl: './confirm-dialog.component.html',
    styleUrls: ['./confirm-dialog.component.scss'],
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
export class ConfirmDialogComponent {
    modalRefs: BsModalRef[] = [];

    @ViewChild('modalMensaje', { read: TemplateRef })
    modalMensaje!: TemplateRef<any>;
    funcionConfirmar: any;
    funcionCancelar: any;
    procesando = false;
    public messages: string[] = [];

    constructor(
        private readonly modalService: BsModalService,
        private readonly logger: LoggerService,
        private readonly actualizar: ActualizarService
    ) {
        this.actualizar.confirmar$.subscribe((data: any[]) => {
            if (data.length === 3) {
                this.messages = data[0];
                this.funcionConfirmar = data[1];
                this.funcionCancelar = data[2];
                this.openModal(this.modalMensaje);
            } else {
                this.logger.logDebug(
                    'No se recibieron todos los datos necesarios para confirmar',
                    data
                );
            }
        });
    }

    confirmar(): void {
        this.procesando = true;
        this.modalRefs.pop()?.hide();
        window.setTimeout(() => {
            this.funcionConfirmar();
        }, 500);
    }

    cerrar(): void {
        this.modalRefs.pop()?.hide();
        window.setTimeout(() => {
            this.funcionCancelar();
        }, 500);
        this.procesando = false;
    }

    openModal(template: TemplateRef<any>): void {
        this.procesando = false;
        this.modalService.onShown.subscribe(() => {
            (
                document.querySelector(
                    " button[autofocus='true']"
                ) as HTMLElement
            ).focus();
        });
        const modalRef = this.modalService.show(template, {
            class: 'confirm-modal modal-dialog-centered',
            ignoreBackdropClick: true,
            backdrop: true,
        });
        
        modalRef.onHide?.subscribe((reason: string) => {
            this.cerrar();
        });
        this.modalRefs.push(modalRef);
    }
}


