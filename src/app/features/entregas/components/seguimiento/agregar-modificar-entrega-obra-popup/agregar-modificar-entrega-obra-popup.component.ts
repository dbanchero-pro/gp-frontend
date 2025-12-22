import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { AppConfig } from 'src/app/app.config';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { IAppConfig } from 'src/app/shared/models/common/app-config.model';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregaDTO } from '../../../models/entrega.model';
import { IEntregableDTO } from '../../../models/entregable.model';
import { IOrdenCompraDTO } from '../../../models/orden-ompra.model';
import { EntregaService } from '../../../services/entrega.service';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { fechaRangoValidator, tipoUnidadCantidad, tipoUnidadPorcentaje } from '../../../utils/utils';
import { AgregarDocumentoPopupComponent } from '../agregar-documento-popup/agregar-documento-popup.component';

@Component({
    selector: 'app-agregar-modificar-entrega-obra-popup',
    templateUrl: './agregar-modificar-entrega-obra-popup.component.html',
    standalone: false
})
export class AgregarModificarEntregaObraPopupComponent extends PopupBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<IEntregaDTO>();

    @Input() titulo: string = 'Agregar entrega';
    @Input() itemOrdenCompra!: IItemOrdenCompraDTO;
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() entregaModificar!: IEntregaDTO;
    @Input() esModificacion: boolean = false;
    @Input() entregable!: IEntregableDTO;

    documentos: ArchivoDTO[] = [];
    newDate = new Date();
    TipoUnidad = TipoUnidad;
    settings: IAppConfig = AppConfig.settings;
    entregasExistentes: IEntregaDTO[] = [];
    tiposEstado = [
        { id: 'EN_CURSO', nombre: 'En curso' },
        { id: 'ENTREGADO', nombre: 'Entregado' }
    ];


    cantidadOriginal: number | null = null;
    cantidadPendiente: number | null = null;

    constructor(
        private readonly fb: FormBuilder,
        private readonly entregaService: EntregaService,
        private readonly itemOrdenCompraService: ItemOrdenCompraService,
        private readonly entregableService: EntregableService,
        private readonly documentosUtilService: DocumentosUtilService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.settings = AppConfig.settings;
        this.obtenerItemOrdenCompra();
        this.obtenerEntregable();
        this.obtenerEntregasExistentes();

        this.form = this.fb.group({
            fechaComprometida: ['', [Validators.required, fechaRangoValidator(this)]],
            estado: ['', Validators.required],
            personasResponsables: [''],
            cantidadPorcentaje: this.fb.control({ tipo: null, valor: null }, [this.validarCantidad.bind(this)]),
        });

        if (this.entregaModificar) {
            this.cargarDatosEntrega();
        } else {
            this.cargarTipoUnidad();
            const fechaPorDefecto = this.fechaMaxima;
            if (fechaPorDefecto) {
                this.form.get('fechaComprometida')?.setValue(fechaPorDefecto);
            }

        }
    }

    private cargarCantidadPendienteDefecto(): void {
        if (this.entregable) {
            if (this.entregable.cantidadPendienteAsignar) {
                this.cantidadPendiente = this.entregable.cantidadPendienteAsignar;
            } else if (this.entregable.tipoUnidadEntregas === TipoUnidad.PORCENTAJE) {
                this.cantidadPendiente = 100;
            } else if (this.entregable.tipoUnidadEntregas === TipoUnidad.CANTIDAD) {
                this.cantidadPendiente = this.entregable.cantidad ?? 1;
            }
        }
        else if (this.itemOrdenCompra) {
            if (this.itemOrdenCompra.cantidadPendienteAsignar) {
                this.cantidadPendiente = this.itemOrdenCompra.cantidadPendienteAsignar;
            } else {
                this.cantidadPendiente = this.itemOrdenCompra.cantidad ?? 1;
            }
        }
    }

    private cargarTipoUnidad(): void {
        const tipoUnidadACargar = this.entregable?.tipoUnidadEntregas ?? this.itemOrdenCompra?.tipoUnidad;
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

    private cargarDatosEntrega(): void {
        if (this.entregaModificar) {
            this.cantidadOriginal = this.entregaModificar.cantidad ?? null;

            this.form.patchValue({
                fechaComprometida: this.entregaModificar.fechaComprometida ?? '',
                estado: this.entregaModificar.estado ?? '',
                personasResponsables: this.entregaModificar.responsable,
                cantidadPorcentaje: {
                    tipo: this.entregaModificar.tipoUnidad,
                    valor: this.entregaModificar.cantidad
                }
            });
            this.documentos = this.entregaModificar.documentos ?? [];

            const fechaControl = this.form.get('fechaComprometida');

            if (fechaControl?.value) {
                const fechaModificar = new Date(fechaControl.value);
                const fechaMin = this.fechaMinima ? new Date(this.fechaMinima) : null;
                const fechaMax = this.fechaMaxima ? new Date(this.fechaMaxima) : null;

                if ((fechaMin && fechaModificar < fechaMin) || (fechaMax && fechaModificar > fechaMax)) {
                    fechaControl.setValue(this.fechaMaxima);
                }
            }

            this.titulo = "Modificar Entrega: ";
        }
    }

    descargarDocumento(documento: ArchivoDTO): void {
        this.documentosUtilService.descargarDocumento(documento, this.entregaModificar?.idEntrega);
    }

    agregarDocumento(): void {
        const modalRef = this.abrirPopup(AgregarDocumentoPopupComponent, undefined, {
            backdrop: 'static',
            keyboard: false
        });

        modalRef.documentoAgregado.subscribe((documento: ArchivoDTO) => {
            this.documentos.push(documento);
        });

    }


    obtenerCantidadEntregasPendientes(entregable: IEntregableDTO): number {
        return entregable.entregas!.filter(e => e.cantidadRecepcionAceptada != e.cantidad).length;
    }

    eliminarDocumento(documento: ArchivoDTO): void {
        this.documentos = this.documentosUtilService.eliminarDocumento(this.documentos, documento);
    }

    obtenerDocumentosAMostrar(): ArchivoDTO[] {
        return this.documentosUtilService.obtenerDocumentosAMostrar(this.documentos);
    }

    getDocumentDate(index: number): Date {
        return this.documentosUtilService.getDocumentDate(this.documentos, index);
    }

    private validarCantidad(control: AbstractControl): ValidationErrors | null {
        const tipo: TipoUnidad | undefined | null = control.value?.tipo;
        const valor: number | null = control.value?.valor;
        
        //probar cuando entregable.cantidad es 1 porque le puse 1 en el front
        const cantidadPendienteAsignar = this.entregable ? this.entregable.cantidadPendienteAsignar : this.itemOrdenCompra?.cantidadPendienteAsignar;
        const tipoUnidadItem = this.itemOrdenCompra.tipoUnidad ?? undefined;
        const total = this.entregable ? this.entregable.cantidad ?? 0 : this.itemOrdenCompra?.cantidad ?? 0;
        
        const entregasCount = this.entregasExistentes?.length ?? 0;
        let esUnicaEntrega = this.esUnicaEntrega(entregasCount, total, this.esModificacion);
        
        //Checkeo necesario para porcentaje, cuando no viene cantidadPendienteAsignar
        if (tipo === TipoUnidad.PORCENTAJE && ((tipoUnidadItem == undefined) || (cantidadPendienteAsignar == undefined))) {
            return this.validarPorcentajeSinCantidadPendiente(valor, control);
        }
        
        const pendienteBase = this.entregable?.cantidadPendienteAsignar ?? this.entregable?.cantidad ?? this.itemOrdenCompra?.cantidadPendienteAsignar ?? this.itemOrdenCompra?.cantidad ?? 0;
        const pendiente = this.esModificacion ? pendienteBase + (this.cantidadOriginal ?? 0) : pendienteBase;
        
        if (total === 1) {
            if (tipo === TipoUnidad.PORCENTAJE) {
                if (esUnicaEntrega) {
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
            return this.totalMayorAUno(tipo ?? undefined, valor, pendiente);
        }
        
        return null;
    }


    private totalMayorAUno(tipo: TipoUnidad | undefined, valor: number | null, pendiente: number): ValidationErrors | null {
        if (tipo === TipoUnidad.CANTIDAD) {
            if (valor == null || isNaN(valor)) return { cantidadRequerida: true };
            if (valor > pendiente) return { excedePendienteCantidad: true };
            return null;
        }
        if (tipo === TipoUnidad.PORCENTAJE) {
            return this.entregaService.tipoUnidadPorcentaje(valor, pendiente);
        }
        return null
    }

    private validarPorcentajeSinCantidadPendiente(valor: number | null, control: AbstractControl): ValidationErrors | null {
        if (valor === null || isNaN(valor)) {
            setTimeout(() => control.markAsTouched(), 0);
            return { porcentajeRequerido: true };
        }

        if (valor < 1) {
            setTimeout(() => control.markAsTouched(), 0);
            return { porcentajeRango: true };
        }
        if (valor > 100) {
            setTimeout(() => control.markAsTouched(), 0);
            return { excedePendientePorcentaje: true };
        }

        return null;
    }

    private esUnicaEntrega(entregasCount: number, total: number, esModificacion: boolean): boolean {
        return (entregasCount === 1 || entregasCount === 0) && total === 1 && esModificacion;
    }

    guardar(): void {

        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;

        const entrega: IEntregaDTO = {
            idEntrega: this.entregaModificar?.idEntrega,
            fechaComprometida: formValues.fechaComprometida,
            cantidad: formValues.cantidadPorcentaje?.valor,
            tipoUnidad: formValues.cantidadPorcentaje?.tipo,
            estado: formValues.estado,
            responsable: formValues.personasResponsables,
            documentos: this.documentos.filter(d => d.eliminado === true || d.modificado === true),
            itemOrdenCompra: this.itemOrdenCompra,
            entregable: this.entregable,
        };

        this.guardarEvento.emit(entrega);
    }

    get porcentajeHabilitado(): boolean {
        const ref: any = this.entregable ?? this.itemOrdenCompra;
        const total = ref?.cantidad ?? 0;

        const entregasCount = this.entregasExistentes?.length ?? 0;
        const hayEntregas = entregasCount > 0;
        let esUnicaEntrega = entregasCount === 1 && total === 1;

        if (esUnicaEntrega && !this.esModificacion) esUnicaEntrega = false;

        const tipoBase: TipoUnidad | null = (this.entregable?.tipoUnidadEntregas ?? this.itemOrdenCompra?.tipoUnidad) ?? null;

        if (total === 1) {
            if (!hayEntregas && !this.esModificacion) return true;
            if (this.esModificacion && esUnicaEntrega) return true;
            return tipoBase === null || tipoBase === TipoUnidad.PORCENTAJE;
        }
        else if (total > 1 && !this.entregable) {
            return false;
        }

        if (esUnicaEntrega) return true;
        if (this.esModificacion) return this.esTipoUnidadPorcentaje();
        if (hayEntregas) return tipoBase === TipoUnidad.PORCENTAJE;
        return tipoBase === null || tipoBase === TipoUnidad.PORCENTAJE;
    }

    get cantidadHabilitada(): boolean {
        const ref: any = this.entregable ?? this.itemOrdenCompra;
        const total = ref?.cantidad ?? 0;

        const entregasCount = this.entregasExistentes?.length ?? 0;
        const hayEntregas = entregasCount > 0;
        let esUnicaEntrega = entregasCount === 1 && total === 1;

        if (esUnicaEntrega && !this.esModificacion) esUnicaEntrega = false;

        const tipoBase: TipoUnidad | null = (this.entregable?.tipoUnidadEntregas ?? this.itemOrdenCompra?.tipoUnidad) ?? null;

        //Para cantidad hay checkeos extra porque no puede haber tipo cantidad cuando cantidad es 1%, pero sí en porcentaje
        if (total === 1) {
            if (!hayEntregas && !this.esModificacion && !this.esTipoUnidadPorcentaje()) return true;
            if (this.esModificacion && esUnicaEntrega && (!this.esTipoUnidadPorcentaje() || this.entregable.tipoUnidad === TipoUnidad.CANTIDAD)) return true;
            return tipoBase === null || tipoBase === TipoUnidad.CANTIDAD;
        }

        if (esUnicaEntrega) return true;
        if (this.esModificacion) return this.esTipoUnidadCantidad();
        if (hayEntregas) return tipoBase === TipoUnidad.CANTIDAD;
        return tipoBase === null || tipoBase === TipoUnidad.CANTIDAD;
    }

    get cantidadFijaEnCantidad(): number | null {
        const ref: any = this.entregable ?? this.itemOrdenCompra;
        const total = ref?.cantidad ?? 0;
        return total === 1 ? 1 : null;
    }

    esTipoUnidadPorcentaje(): boolean {
        if (this.entregable) {
            return this.entregable.tipoUnidadEntregas === TipoUnidad.PORCENTAJE;
        }
        return false;
    }

    esTipoUnidadCantidad(): boolean {
        if (this.entregable) {
            return this.entregable.tipoUnidadEntregas === TipoUnidad.CANTIDAD;
        }
        return this.itemOrdenCompra.tipoUnidad === TipoUnidad.CANTIDAD;
    }

    get fechaMinima(): string {
        if (!this.ordenCompra?.fechaOC) {
            return '';
        }
        const date = new Date(this.ordenCompra.fechaOC);
        return date.toISOString().split('T')[0];
    }

    get fechaMaxima(): string {
        if (this.entregable) {
            if (!this.entregable?.fechaComprometida) {
                return '';
            }
            if (typeof this.entregable.fechaComprometida === 'string') {
                const date = new Date(this.entregable.fechaComprometida);
                return date.toISOString().split('T')[0];
            }
            return '';
        } else {
            const fechaMax = this.itemOrdenCompra?.fechaComprometida ?? this.ordenCompra?.fechaComprometida;
            if (!fechaMax) {
                return '';
            }
            const date = new Date(fechaMax);
            return date.toISOString().split('T')[0];
        }
    }

    obtenerItemOrdenCompra(): void {
        if (this.ordenCompra?.idOC && this.itemOrdenCompra?.idItem) {
            this.itemOrdenCompraService.obtenerItemOrdenCompra(this.ordenCompra.idOC, this.itemOrdenCompra.idItem, this.itemOrdenCompra.idVariacion)
                .subscribe(item => {
                    this.itemOrdenCompra = item;
                    if (this.entregable) {
                        this.entregable.itemOrdenCompra ??= this.itemOrdenCompra;
                    }
                });
        }
    }

    obtenerEntregable(): void {
        if (this.entregable?.idEntregable) {
            this.entregableService.obtenerEntregable(this.entregable.idEntregable)
                .subscribe(ent => {
                    this.entregable = ent;
                    this.entregable.itemOrdenCompra ??= this.itemOrdenCompra;
                });
        }
    }

    obtenerEntregasExistentes(): void {
        if (!this.entregable) {
            if (!this.ordenCompra?.idOC || !this.itemOrdenCompra?.idItem) {
                this.entregasExistentes = [];
                return;
            }
            const params: any = {
                idOC: this.ordenCompra.idOC,
                idCompra: this.ordenCompra?.compra?.idCompra ?? 0,
                idItemCompra: this.itemOrdenCompra.idItem,
                idVariacion: this.itemOrdenCompra.idVariacion,
                page: 0,
                size: 100
            };
            this.entregaService.obtenerEntregas(params)
                .subscribe(entregasPage => {
                    this.entregasExistentes = entregasPage.content ?? [];
                });
        } else {
            this.entregasExistentes = this.entregable.entregas ?? [];
        }
    }
}


