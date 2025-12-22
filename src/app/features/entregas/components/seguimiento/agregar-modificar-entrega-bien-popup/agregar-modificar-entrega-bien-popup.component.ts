import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoEntrega } from '../../../enum/estado-entrega.enum';
import { IEntregaDTO } from '../../../models/entrega.model';
import { ItemOrdenCompraDTO } from '../../../models/item-orden-compra.model';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';

@Component({
    selector: 'app-agregar-modificar-entrega-bien-popup',
    templateUrl: './agregar-modificar-entrega-bien-popup.component.html',
    standalone: false
})
export class AgregarModificarEntregaBienPopupComponent extends PopupBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<IEntregaDTO>();

    @Input() entrega?: IEntregaDTO;
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() itemOrdenCompra!: ItemOrdenCompraDTO;
    @Input() cantidadPendiente: number = 0;

    mensajeError: string = '';
    cantidadOriginal: number = 0;
    titulo: string = '';

    tiposEstado = [
        { id: EstadoEntrega.EN_PREPARACION, nombre: 'En preparación' },
        { id: EstadoEntrega.EN_TRANSITO, nombre: 'En tránsito' }
    ];

    constructor(
        private readonly fb: FormBuilder,
        private readonly itemOrdenCompraService: ItemOrdenCompraService,
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.obtenerItemOrdenCompra();

        let fechaPorDefecto = this.fechaMaxima;

        this.form = this.fb.group({
            fechaComprometida: [fechaPorDefecto, [Validators.required, this.fechaRangoValidator()]],
            cantidadPrevista: [
                this.itemOrdenCompra?.cantidadPendienteAsignar,
                [
                    Validators.required,
                    Validators.pattern(/^\d+(\.\d{1,2})?$/),
                    this.validarCantidad.bind(this)
                ]
            ],
            estado: ['', Validators.required],
            personasResponsables: ['']
        });

        if (this.entrega) {
            this.cantidadOriginal = this.entrega.cantidad ?? 0;

            this.form.patchValue({
                fechaComprometida: this.entrega.fechaComprometida ?? '',
                cantidadPrevista: this.entrega.cantidad ?? this.entrega.cantidad,
                estado: this.entrega.estado,
                personasResponsables: this.entrega.responsable
            });

            this.titulo = "Modificar Entrega: ";
        }
        else {
            this.titulo = "Agregar Entrega";
        }
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const nuevaEntrega: IEntregaDTO = {
            ...this.entrega,
            itemOrdenCompra: this.itemOrdenCompra,
            cantidad: this.form.get('cantidadPrevista')?.value,
            fechaComprometida: this.form.get('fechaComprometida')?.value,
            estado: this.form.get('estado')?.value,
            responsable: this.form.get('personasResponsables')?.value,
            documentos: this.entrega?.documentos ?? []
        };

        this.guardarEvento.emit(nuevaEntrega);
    }


    get isFormValid(): boolean {
        return this.form.valid;
    }

    private validarCantidad(control: AbstractControl): ValidationErrors | null {
        const valor: number = control.value;

        if (valor === null || isNaN(valor)) {
            return null;
        }

        const pendiente = this.itemOrdenCompra?.cantidadPendienteAsignar ?? this.itemOrdenCompra?.cantidad ?? 0;
        const cantidadDisponible = pendiente + this.cantidadOriginal;
        if (valor > cantidadDisponible) {
            return { excedePendiente: true };
        }

        return null;
    }

    obtenerItemOrdenCompra() {
        this.itemOrdenCompraService.obtenerItemOrdenCompra(this.ordenCompra.idOC, this.itemOrdenCompra.idItem, this.itemOrdenCompra.idVariacion).subscribe({
            next: (item) => {
                this.itemOrdenCompra = item;
            },
            error: (err) => {
                Logger.logError('Error al obtener el item de orden de compra:', err);
            }
        });
    }

    private fechaRangoValidator() {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) {
                return null;
            }

            const fechaSeleccionada = new Date(control.value);
            const fechaMin = this.fechaMinima ? new Date(this.fechaMinima) : null;
            const fechaMax = this.fechaMaxima ? new Date(this.fechaMaxima) : null;
            if (fechaMin && fechaSeleccionada < fechaMin) {
                return { min: { value: control.value } };
            }
            if (fechaMax && fechaSeleccionada > fechaMax) {
                return { max: { value: control.value } };
            }

            return null;
        };
    }

    get fechaMinima(): string {
        if (!this.ordenCompra?.fechaOC) {
            return '';
        }
        const date = new Date(this.ordenCompra.fechaOC);
        return date.toISOString().split('T')[0];
    }

    get fechaMaxima(): string {
        const fechaMax = this.itemOrdenCompra?.fechaComprometida ?? this.ordenCompra?.fechaComprometida;
        if (!fechaMax) {
            return '';
        }
        const date = new Date(fechaMax);
        return date.toISOString().split('T')[0];
    }
}
