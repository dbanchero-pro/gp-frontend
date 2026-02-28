import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UsuarioDTO } from '../../models/usuario/usuario.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { FormatoCiPipe } from '../../pipes/formato-ci.pipe';
import { FiltroOrganismoComponent } from '../filtro-organismo/filtro-organismo.component';
import { PopupBaseComponent } from '../popup-base/popup-base.component';














@Component({
    selector: 'app-organismo-popup',
    templateUrl: './organismo-popup.component.html',
    styleUrls: ['./organismo-popup.component.scss'],
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
    FormatoCiPipe,
    FiltroOrganismoComponent,
  ],
})
export class OrganismoPopupComponent extends PopupBaseComponent implements OnInit {
    @Input() idUsuarioSeleccionado: string | undefined;
    @Input() usuario?: UsuarioDTO;
    @Output() guardarEvento = new EventEmitter<any>();

    intentoGuardar = false;

    constructor(
        private readonly fb: FormBuilder
    ) { super(); }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.fb.group({
            organismo: [null, [Validators.required]],
            esEditorPrincipal: [false],
            esEditor: [false],
            esValidador: [false],
            esAprobador: [false],
        });
    }

    guardar(): void {
        this.intentoGuardar = true;
        this.form.markAllAsTouched();

        if (!this.form.valid || !this.alMenosUnRolSeleccionado()) {
            return;
        }

        const dataAGuardar = {
            ...this.form.get('organismo')?.value,
            esEditorPrincipal: this.form.get('esEditorPrincipal')!.value,
            esEditor: this.form.get('esEditor')!.value,
            esValidador: this.form.get('esValidador')!.value,
            esAprobador: this.form.get('esAprobador')!.value,
        };

        this.guardarEvento.emit(dataAGuardar);
        this.cerrarPopup();
    }

    alMenosUnRolSeleccionado(): boolean {
        return (
            this.form.get('esEditorPrincipal')!.value ||
            this.form.get('esEditor')!.value ||
            this.form.get('esValidador')!.value ||
            this.form.get('esAprobador')!.value
        );
    }

}

