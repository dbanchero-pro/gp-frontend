import { Directive, inject } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BsModalService, ModalOptions, ModalModule } from 'ngx-bootstrap/modal';
import { ActualizarService } from '../../services/common/actualizar.service';
import { campoVacio as campoVacioFn } from '../../utils/functions';
import { CommonModule } from '@angular/common';
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

@Directive()
export abstract class FormularioBaseComponent {
    form!: FormGroup;

    protected modalService = inject(BsModalService);

    protected actualizarService = inject(ActualizarService);

    campoVacio(control: string): boolean {
        return campoVacioFn(control, this.form);
    }

    campoError(control: string): boolean {
        const campo = this.form.get(control);
        return !!campo && campo.invalid && (campo.dirty || campo.touched);
    }

    abrirPopup(
        contenido: any,
        textoSubmit?: string,
        config?: ModalOptions | undefined,
    ): any {
        let nuevoConfig = config ?? {};
        nuevoConfig = {
            ...nuevoConfig,
            class: config?.class ?? 'modal-dialog-centered modal-lg',
            ignoreBackdropClick: true,
            backdrop: true,
            focus: true,
            ariaLabelledBy: 'tituloPopup',
        };
        nuevoConfig.initialState = nuevoConfig.initialState ?? {};
        nuevoConfig.initialState = {
            ...nuevoConfig.initialState,
            submitText:
                textoSubmit ??
                nuevoConfig.initialState?.['submitText'] ??
                'Aceptar',
        };
        const modalRef = this.modalService.show(contenido, nuevoConfig);
        this.actualizarService.popups.push(modalRef);
        return modalRef.content;
    }

    abrirPopupGrande(
        contenido: any,
        textoSubmit?: string,
        config?: ModalOptions | undefined,
    ): any {
        return this.abrirPopup(contenido, textoSubmit, {
            ...config,
            ariaLabelledBy: 'tituloPopup',
            class: 'modal-dialog-centered modal-xl',
        });
    }

    abrirPopupXXL(
        contenido: any,
        textoSubmit?: string,
        config?: ModalOptions | undefined,
    ): any {
        return this.abrirPopup(contenido, textoSubmit, {
            ...config,
            ariaLabelledBy: 'tituloPopup',
            class: 'modal-dialog-centered modal-xl modal-xxl',
        });
    }

    cerrarPopup() {
        const modalRef = this.actualizarService.popups.pop();
        if (modalRef?.hide) {
            modalRef.hide();
        }
    }
}
