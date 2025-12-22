import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { EstadoEntregable } from '../../../enum/estado-entregable.enum';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregableDTO } from '../../../models/entregable.model';
import { IOrdenCompraDTO } from '../../../models/orden-ompra.model';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { fechaRangoValidator, tipoUnidadCantidad, tipoUnidadPorcentaje } from '../../../utils/utils';

@Component({
    selector: 'app-agregar-modificar-entregable-popup',
    templateUrl: './agregar-modificar-entregable-popup.component.html',
    standalone: false
})
export class AgregarModificarEntregablePopupComponent extends PopupBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<IEntregableDTO>();

    @Input() titulo: string = 'Agregar entregable';
    @Input() itemOrdenCompra!: IItemOrdenCompraDTO;
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() entregableModificar: IEntregableDTO | null = null;
    @Input() esModificacion: boolean = false;

    entregablesExistentes: IEntregableDTO[] = [];
    cantidadPendiente: number | null = null;

    constructor(
        private readonly fb: FormBuilder,
        private readonly itemOrdenCompraService: ItemOrdenCompraService,
        private readonly entregableService: EntregableService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.obtenerItemOrdenCompra();
        this.obtenerEntregables();

        this.form = this.fb.group({
            fechaComprometida: ['', [Validators.required, fechaRangoValidator(this)]],
            cantidadPorcentaje: this.fb.control({ tipo: TipoUnidad.CANTIDAD, valor: null }, [this.validarCantidad.bind(this)]),
            codigoEntregable: ['', [Validators.required, this.validarCodigoUnico.bind(this)]],
            nombreEntregable: ['', Validators.required]
        });

        if (this.entregableModificar) {
            this.cargarDatosEntregable();
        } else {
            this.cargarTipoUnidad();
            const fechaPorDefecto = this.fechaMaxima;
            if (fechaPorDefecto) {
                this.form.get('fechaComprometida')?.setValue(fechaPorDefecto);
            }
        }
    }

    private cargarDatosEntregable(): void {
        if (this.entregableModificar) {
            this.form.patchValue({
                fechaComprometida: this.entregableModificar.fechaComprometida ?? '',
                cantidadPorcentaje: {
                    tipo: this.entregableModificar.tipoUnidad ?? TipoUnidad.CANTIDAD,
                    valor: this.entregableModificar.cantidad ?? 1
                },
                codigoEntregable: this.entregableModificar.codEntregable ?? '',
                nombreEntregable: this.entregableModificar.descEntregable ?? ''
            });

            const fechaControl = this.form.get('fechaComprometida');
            if (fechaControl?.value) {
                const fechaModificar = new Date(fechaControl.value);
                const fechaMin = this.fechaMinima ? new Date(this.fechaMinima) : null;
                const fechaMax = this.fechaMaxima ? new Date(this.fechaMaxima) : null;

                if ((fechaMin && fechaModificar < fechaMin) || (fechaMax && fechaModificar > fechaMax)) {
                    fechaControl.setValue(this.fechaMaxima);
                }
            }
        }
    }

    private cargarCantidadPendienteDefecto(): void {
        this.cantidadPendiente = this.itemOrdenCompra?.cantidadPendienteAsignar ?? this.itemOrdenCompra?.cantidad ?? 1;
    }

    private cargarTipoUnidad(): void {
        const tipoUnidadACargar = this.itemOrdenCompra?.tipoUnidad;
        this.cargarCantidadPendienteDefecto();
        if (tipoUnidadACargar) {
            this.form.patchValue({
                cantidadPorcentaje: {
                    tipo: tipoUnidadACargar,
                    valor: this.cantidadPendiente
                }
            });
        } else {
            this.form.patchValue({
                cantidadPorcentaje: {
                    tipo: null,
                    valor: this.cantidadPendiente
                }
            });
        }
    }

    override cerrarPopup(): void {
        super.cerrarPopup();
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;
        const entregable: IEntregableDTO = {
            idEntregable: this.esModificacion ? this.entregableModificar?.idEntregable : undefined,
            idItem: this.itemOrdenCompra.idItem,
            idOc: this.ordenCompra.idOC,
            idCompra: this.ordenCompra.compra?.idCompra,
            idVariacion: this.itemOrdenCompra.idVariacion,
            itemOrdenCompra: this.itemOrdenCompra,
            cantidad: formValues.cantidadPorcentaje?.valor,
            fechaComprometida: formValues.fechaComprometida,
            codEntregable: formValues.codigoEntregable,
            documentos: this.esModificacion ? this.entregableModificar?.documentos ?? [] : [],
            descEntregable: formValues.nombreEntregable,
            tipoUnidad: formValues.cantidadPorcentaje?.tipo,
            estado: this.esModificacion ? this.entregableModificar?.estado : EstadoEntregable.PENDIENTE
        };

        this.guardarEvento.emit(entregable);
    }

    private validarCantidad(control: AbstractControl): ValidationErrors | null {
        const tipo: TipoUnidad | undefined = control.value?.tipo;
        const valor: number | null = control.value?.valor;

        const total = this.itemOrdenCompra?.cantidad ?? 0;
        const cantidadEntregables = this.entregablesExistentes?.length;

        const pendienteBase = this.itemOrdenCompra?.cantidadPendienteAsignar ?? total;
        const pendiente = this.esModificacion ? pendienteBase + (this.entregableModificar?.cantidad ?? 0) : pendienteBase;

        const esUnicoEntregable = cantidadEntregables <= 1 && (this.esModificacion || cantidadEntregables === 0);

        if (total === 1) {
            if (tipo === TipoUnidad.PORCENTAJE) {
                if (esUnicoEntregable) {
                    return tipoUnidadPorcentaje(valor, 100);
                } else {
                    return tipoUnidadPorcentaje(valor, pendiente);
                }
            }
            if (tipo === TipoUnidad.CANTIDAD) {
                return tipoUnidadCantidad(valor, pendiente);
            }
        }

        if (total > 1) {
            return this.totalMayorAUno(tipo, valor, pendiente);
        }

        return null;
    }

    private totalMayorAUno(tipo: TipoUnidad | undefined, valor: number | null, pendiente: number): ValidationErrors | null {
        if (tipo === TipoUnidad.CANTIDAD) {
            if (valor == null) return { cantidadRequerida: true };
            if (valor > pendiente) return { excedePendienteCantidad: true };
            return null;
        }
        return null
    }


    private validarCodigoUnico(control: AbstractControl): ValidationErrors | null {
        const codigo = control.value;
        const lista = this.entregablesExistentes || [];
        const repetido = lista.some(e => e.codEntregable === codigo && e.idEntregable !== this.entregableModificar?.idEntregable);
        return repetido ? { codigoRepetido: true } : null;
    }

    get porcentajeHabilitado(): boolean {
        const total = this.itemOrdenCompra?.cantidad;
        const entregablesCount = this.entregablesExistentes?.length ?? 0;
        const esUnicoEntregable = entregablesCount === 1 && total === 1;
        const hayEntregables = entregablesCount > 0;

        if (total && total > 1) return false

        if (this.esModificacion && esUnicoEntregable) return true;

        if (this.esModificacion && this.entregableModificar?.tipoUnidad === TipoUnidad.PORCENTAJE) return true;

        if (!hayEntregables && !this.esModificacion) return true;

        return total === 1 || this.itemOrdenCompra?.tipoUnidad === TipoUnidad.PORCENTAJE;
    }

    get cantidadFijaEnCantidad(): number | null {
        return this.itemOrdenCompra?.cantidad === 1 ? 1 : null;
    }

    get cantidadHabilitada(): boolean {
        const total = this.itemOrdenCompra?.cantidad ?? 0;
        const entregablesCount = this.entregablesExistentes?.length ?? 0;
        const hayEntregables = entregablesCount > 0;
        let esUnicoEntregable = entregablesCount === 1;

        if (esUnicoEntregable && !this.esModificacion) {
            esUnicoEntregable = false;
        }

        if (this.esModificacion && this.entregableModificar?.tipoUnidad === TipoUnidad.CANTIDAD) {
            return true;
        }

        if (total > 1 && this.itemOrdenCompra.tipoUnidad === TipoUnidad.CANTIDAD) return true;

        if (!hayEntregables && !this.esModificacion) return true;

        const itemEsPorcentaje = this.itemOrdenCompra?.tipoUnidad === TipoUnidad.PORCENTAJE;
        if (itemEsPorcentaje && !esUnicoEntregable) return false;

        return true;
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


    obtenerItemOrdenCompra(): void {
        if (this.ordenCompra?.idOC && this.itemOrdenCompra?.idItem) {
            this.itemOrdenCompraService.obtenerItemOrdenCompra(this.ordenCompra.idOC, this.itemOrdenCompra.idItem, this.itemOrdenCompra.idVariacion)
                .subscribe(item => {
                    this.itemOrdenCompra = item;
                });
        }
    }

    obtenerEntregables(): void {
        if (this.itemOrdenCompra?.idItem && this.itemOrdenCompra?.idVariacion && this.ordenCompra?.idOC) {
            this.entregableService.obtenerEntregablesPorItem({
                idOC: this.ordenCompra.idOC,
                idItem: this.itemOrdenCompra.idItem,
                idVariacion: this.itemOrdenCompra.idVariacion,
                estado: null as any
            }).subscribe(result => {
                if (result?.content) {
                    this.entregablesExistentes = result.content || [];
                }
            });
        }
    }
}
