import { Component, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from 'src/app/app.config';
import { IAppConfig } from 'src/app/shared/models/common/app-config.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IRecepcionEntregasRequest } from '../../../models/recepcion-entrega-request-model';
import { IRecepcionItemsRequest } from '../../../models/recepcion-item-request.model';
import { RecepcionConformidadTodosBaseComponent } from '../../comun/recepcion-conformidad-todos-base/recepcion-conformidad-todos-base.component';

@Component({
    selector: 'app-recepcion-todos-popup',
    templateUrl: './recepcion-todos-popup.component.html',
    styleUrl: './recepcion-todos-popup.component.scss',
    standalone: false
})
export class RecepcionTodosPopupComponent extends RecepcionConformidadTodosBaseComponent implements OnInit, OnChanges {
    settings: IAppConfig = AppConfig.settings;
    TipoUnidad = TipoUnidad;
    advertencia: boolean = false;

    constructor(
        private readonly fb: FormBuilder,
        protected override readonly documentosUtilService: DocumentosUtilService
    ) {
        super(documentosUtilService);
        this.actualizarTitulo();
    }

    ngOnChanges(_changes: SimpleChanges): void {
        this.actualizarTitulo();
    }

    override ngOnInit(): void {
        this.actualizarTitulo();
        const fechaPorDefecto = this.fechaMaxima;

        this.form = this.fb.group({
            fechaOperacion: [fechaPorDefecto, [Validators.required, this.fechaRangoValidator()]],
            aceptaOperacion: [true, Validators.required],
            motivo: ['', [this.motivoRequeridoSiRechazo()]],
        });

        // Para actualizar valor obligatorio de motivo
        this.form.get('aceptaOperacion')?.valueChanges.subscribe(() => {
            this.form.get('motivo')?.updateValueAndValidity();
        });
    }

    private actualizarTitulo(): void {
        const hayItemsSeleccionados = Array.isArray(this.itemsOrdenCompra) && this.itemsOrdenCompra.length > 0;
        this.titulo = hayItemsSeleccionados ? 'Recepcionar items seleccionados' : 'Recepcionar entregas seleccionadas';
    }

    guardar(): void {
        this.actualizarService.capturarErrores = false;
        let requestItems: IRecepcionItemsRequest | null = null;
        let requestEntregas: IRecepcionEntregasRequest | null = null;

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;

        if (this.itemsOrdenCompra) {
            requestItems = {
                items: this.itemsOrdenCompra,
                fechaRecepcion: formValues.fechaOperacion,
                aceptaRecepcion: formValues.aceptaOperacion,
                motivo: formValues.motivo,
                documentos: this.documentos
            }
        }
        else if (this.entregas) {
            requestEntregas = {
                entregas: this.entregas,
                fechaRecepcion: formValues.fechaOperacion,
                aceptaRecepcion: formValues.aceptaOperacion,
                motivo: formValues.motivo,
                documentos: this.documentos
            }
        }

        this.guardarEvento.emit(requestItems ?? requestEntregas);
    }

}
