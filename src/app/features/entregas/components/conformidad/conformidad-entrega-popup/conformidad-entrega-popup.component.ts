import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { AppConfig } from 'src/app/app.config';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';

import { IAppConfig } from 'src/app/shared/models/common/app-config.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { TipoObservacion } from '../../../enum/tipo-observacion.enum';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregaDTO } from '../../../models/entrega.model';
import { IEntregableDTO } from '../../../models/entregable.model';
import { IOrdenCompraDTO } from '../../../models/orden-ompra.model';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { RecepcionConformidadBaseComponent } from '../../comun/recepcion-conformidad-base/recepcion-conformidad-base.component';

@Component({
    selector: 'app-conformidad-entrega-popup',
    templateUrl: './conformidad-entrega-popup.component.html',
    standalone: false
})
export class ConformidadEntregaPopupComponent extends RecepcionConformidadBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<IEntregaDTO>();
    @Input() override itemOrdenCompra!: IItemOrdenCompraDTO;
    @Input() override ordenCompra!: IOrdenCompraDTO;
    @Input() override entrega!: IEntregaDTO;
    @Input() esModificacion: boolean = false;
    @Input() override entregable!: IEntregableDTO;

    TipoUnidad = TipoUnidad;
    settings: IAppConfig = AppConfig.settings;
    tiposObservacion = Object.values(TipoObservacion);

    titulo: string = '';

    protected override labelAceptadaCantidad = 'Cantidad con conformidad';
    protected override labelAceptadaPorcentaje = 'Porcentaje con conformidad';

    constructor(
        private readonly fb: FormBuilder,
        protected override readonly documentosUtilService: DocumentosUtilService,
        protected override readonly itemOrdenCompraService: ItemOrdenCompraService,
        protected override readonly entregableService: EntregableService
    ) {
        super(documentosUtilService, itemOrdenCompraService, entregableService);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.settings = AppConfig.settings;
        this.obtenerItemOrdenCompra();
        this.obtenerEntregable();
        this.form = this.fb.group({
            fechaConformidad: ['', [Validators.required, this.fechaRangoValidatorConformidad()]],
            cantidadAceptada: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/), this.validarCantidadAceptada(), this.validarFormatoDecimal(this.esPorcentaje)]],
            cantidadRechazada: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/), this.validarCantidadRechazada(), this.validarFormatoDecimal(this.esPorcentaje)]],
            cantidadPendiente: [''],
            motivo: ['', [this.motivoRequeridoSiRechazo()]],
            tipoObservacion: [null, [this.tipoObservacionRequeridoSiFueraFecha()]],
            observacion: ['', [this.observacionRequeridoSiTipoFalta()]]
        });

        this.cargarDatosEntrega();
        this.configurarRecalculoAutomatico();

        this.form.get('tipoObservacion')?.valueChanges.subscribe(() => {
            this.form.get('observacion')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });

        this.form.get('fechaConformidad')?.valueChanges.subscribe(() => {
            this.form.get('tipoObservacion')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            this.form.get('observacion')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });

        if (this.entrega && this.entrega.cantidadConformidadAceptada == null) {
            this.form.get('cantidadAceptada')?.setValue(this.entrega.cantidadRecepcionAceptada ?? 0);
            this.form.get('cantidadRechazada')?.setValue(0);
        }
    }

    //Calculos
    protected override obtenerCantidadTotal(): number {
        return this.entrega?.cantidadRecepcionAceptada ?? 0;
    }

    private cargarDatosEntrega(): void {
        if (this.entrega) {
            this.form.patchValue({
                fechaConformidad: new Date().toISOString().split('T')[0],
                cantidadAceptada: this.entrega.cantidadConformidadAceptada,
                cantidadRechazada: this.entrega.cantidadConformidadRechazada,
                motivo: this.entrega.motivoConformidadRechazada ?? '',
                tipoObservacion: this.entrega.tipoObservacion ?? null,
                observacion: this.entrega.observaciones ?? ''
            });
            this.documentos = this.entrega.documentosConformidad ?? [];
            this.titulo = this.esModificacion ? 'Modificar conformidad entrega: ' : 'Dar conformidad entrega: ';
        } else {
            this.form.patchValue({
                fechaConformidad: new Date().toISOString().split('T')[0],
                cantidadAceptada: 0,
                cantidadRechazada: 0,
                cantidadPendiente: this.obtenerCantidadTotal()
            });
        }
    }

    //Validators

    private tipoObservacionRequeridoSiFueraFecha(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) return null;
            const fueraDeFecha = this.conformidadFueraFecha();
            if (fueraDeFecha && !control.value) {
                return { required: true };
            }
            return null;
        };
    }

    private observacionRequeridoSiTipoFalta(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) return null;
            const tipo = this.form.get('tipoObservacion')?.value;
            if (tipo && (!control.value || control.value.trim() === '')) {
                return { required: true };
            }
            return null;
        };
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;

        const cantidadAceptada = Number(formValues.cantidadAceptada);
        const cantidadRechazada = Number(formValues.cantidadRechazada);

        const entrega: IEntregaDTO = {
            idEntrega: this.entrega?.idEntrega,
            fechaComprometida: this.entrega?.fechaComprometida,
            cantidad: this.entrega?.cantidad ?? 0,
            tipoUnidad: this.entrega?.tipoUnidad,
            estado: this.entrega?.estado,
            responsable: this.entrega?.responsable,
            documentosConformidad: this.documentos.filter(d => d.eliminado === true || d.modificado === true),
            itemOrdenCompra: this.itemOrdenCompra,
            entregable: this.entregable,
            cantidadConformidadAceptada: cantidadAceptada,
            cantidadConformidadRechazada: cantidadRechazada,
            cantidadRecepcionAceptada: this.entrega?.cantidadRecepcionAceptada ?? 0,
            cantidadRecepcionRechazada: this.entrega?.cantidadRecepcionRechazada ?? 0,
            fechaRecepcion: this.entrega?.fechaRecepcion,
            fechaConformidad: formValues.fechaConformidad,
            motivoConformidadRechazada: formValues.motivo,
            tipoObservacion: formValues.tipoObservacion,
            observaciones: formValues.observacion
        };

        this.guardarEvento.emit(entrega);
    }

    recepcionFueraFecha(): boolean {
        if (this.entrega.fechaComprometida && this.entrega.fechaRecepcion)
            return this.entrega.fechaRecepcion > this.entrega.fechaComprometida;

        return false;
    }

    conformidadFueraFecha(): boolean {
        const fechaConformidadValue = this.form?.get('fechaConformidad')?.value;
        let fechaConformidad: Date | null = null;
        if (fechaConformidadValue) {
            fechaConformidad = new Date(fechaConformidadValue);
        } else if (this.entrega?.fechaConformidad) {
            fechaConformidad = new Date(this.entrega.fechaConformidad);
        }

        if (this.entrega?.fechaComprometida && fechaConformidad) {
            const fechaComprometida = new Date(this.entrega.fechaComprometida);
            return fechaConformidad > fechaComprometida;
        }

        return false;
    }

    cantidadPendienteRecepcion(entrega: IEntregaDTO) {
        if (entrega.cantidad && entrega.cantidadRecepcionAceptada) {
            return (entrega.cantidad - entrega.cantidadRecepcionAceptada).toFixed(2);
        }
        return 0;
    }

}

