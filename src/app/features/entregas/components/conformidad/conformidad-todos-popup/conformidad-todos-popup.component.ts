import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AppConfig } from 'src/app/app.config';
import { IAppConfig } from 'src/app/shared/models/common/app-config.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { TipoObservacion } from '../../../enum/tipo-observacion.enum';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IConformidadEntregasRequest } from '../../../models/conformidad-entrega-request-model';
import { IConformidadItemsRequest } from '../../../models/conformidad-item-request.model';
import { RecepcionConformidadTodosBaseComponent } from '../../comun/recepcion-conformidad-todos-base/recepcion-conformidad-todos-base.component';

@Component({
    selector: 'app-conformidad-todos-popup',
    templateUrl: './conformidad-todos-popup.component.html',
    standalone: false
})
export class ConformidadTodosPopupComponent extends RecepcionConformidadTodosBaseComponent implements OnInit {
    settings: IAppConfig = AppConfig.settings;
    TipoUnidad = TipoUnidad;
    tiposObservacion = Object.values(TipoObservacion);

    constructor(
        private readonly fb: FormBuilder,
        protected override readonly documentosUtilService: DocumentosUtilService
    ) {
        super(documentosUtilService);
        this.titulo = 'Dar conformidad'
    }

    override ngOnInit(): void {
        const fechaPorDefecto = this.fechaMaxima;

        this.form = this.fb.group({
            fechaOperacion: [fechaPorDefecto, [Validators.required, this.fechaRangoValidator()]],
            aceptaOperacion: [true, Validators.required],
            motivo: ['', [this.motivoRequeridoSiRechazo()]],
            tipoObservacion: [null],
            observacion: ['', [this.observacionRequeridaSiFalta()]]
        });

        this.form.get('aceptaOperacion')?.valueChanges.subscribe(() => {
            this.form.get('motivo')?.updateValueAndValidity();
        });

        this.form.get('tipoObservacion')?.valueChanges.subscribe(() => {
            this.form.get('observacion')?.updateValueAndValidity();
        });
    }

    guardar(): void {
        this.actualizarService.capturarErrores = false;
        let requestItems: IConformidadItemsRequest | null = null;
        let requestEntregas: IConformidadEntregasRequest | null = null;

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;

        if (this.itemsOrdenCompra) {
            requestItems = {
                items: this.itemsOrdenCompra,
                fechaConformidad: formValues.fechaOperacion,
                aceptaConformidad: formValues.aceptaOperacion,
                motivo: formValues.motivo,
                documentos: this.documentos,
                tipoObservacion: formValues.tipoObservacion,
                observaciones: formValues.observacion
            };
        } else if (this.entregas) {
            requestEntregas = {
                idOC: this.itemOrdenCompra?.idOC,
                idItem: this.itemOrdenCompra?.idItem,
                idVariacion: this.itemOrdenCompra?.idVariacion,
                entregas: this.entregas,
                fechaConformidad: formValues.fechaOperacion,
                aceptaConformidad: formValues.aceptaOperacion,
                motivo: formValues.motivo,
                documentos: this.documentos,
                tipoObservacion: formValues.tipoObservacion,
                observaciones: formValues.observacion
            };
        }

        this.guardarEvento.emit(requestItems ?? requestEntregas!);
    }


    private observacionRequeridaSiFalta(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) return null;
            const tipo = this.form.get('tipoObservacion')?.value;
            if (tipo && (!control.value || control.value.trim() === '')) {
                return { required: true };
            }
            return null;
        };
    }

}