import { Directive, Input } from "@angular/core";
import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { PopupBaseComponent } from "src/app/shared/components/popup-base/popup-base.component";
import { ArchivoDTO } from "src/app/shared/models/common/archivo.model";
import { DocumentosUtilService } from "src/app/shared/services/common/documentos-util.service";
import { obtenerCantidadEntregable, obtenerUnidadEntregable } from "src/app/shared/utils/functions";
import { TipoUnidad } from "../../../enum/tipo-unidad.enum";
import { IEntregaDTO } from "../../../models/entrega.model";
import { IEntregableDTO } from "../../../models/entregable.model";
import { IItemOrdenCompraDTO } from "../../../models/item-orden-compra.model";
import { IOrdenCompraDTO } from "../../../models/orden-ompra.model";
import { EntregableService } from "../../../services/entregable.service";
import { ItemOrdenCompraService } from "../../../services/item-orden-compra.service";
import { AgregarDocumentoPopupComponent } from "../../seguimiento/agregar-documento-popup/agregar-documento-popup.component";

@Directive()
export abstract class RecepcionConformidadBaseComponent extends PopupBaseComponent {
    @Input() ordenCompra?: IOrdenCompraDTO | null;
    @Input() entrega?: IEntregaDTO | null;
    @Input() entregable?: IEntregableDTO | null;
    @Input() itemOrdenCompra?: IItemOrdenCompraDTO | null;

    protected labelAceptadaCantidad = 'Cantidad aceptada';
    protected labelAceptadaPorcentaje = 'Porcentaje aceptado';

    public documentos: ArchivoDTO[] = [];

    constructor(
        protected readonly documentosUtilService: DocumentosUtilService,
        protected readonly itemOrdenCompraService: ItemOrdenCompraService,
        protected readonly entregableService: EntregableService) {
        super();

    }


    get esPorcentaje(): boolean { return this.tipoUnidadRecepcion === TipoUnidad.PORCENTAJE; }

    get labelAceptada(): string { return this.esPorcentaje ? this.labelAceptadaPorcentaje : this.labelAceptadaCantidad; }

    get labelRechazada(): string { return this.esPorcentaje ? 'Porcentaje rechazado' : 'Cantidad rechazada'; }

    get labelPendiente(): string { return this.esPorcentaje ? 'Porcentaje pendiente' : 'Cantidad pendiente'; }

    get stepNumerico(): string { return this.esPorcentaje ? '0.01' : '1'; }

    get fechaMinimaRecepcion(): string {
        let d;
        if (this.ordenCompra && this.entrega) {
            if (this.entrega.fechaEntrega) {
                d = new Date(this.entrega.fechaEntrega);    
            }
            else {
                d = new Date(this.ordenCompra.fechaOC!);
            }

            return d.toISOString().split('T')[0];
        }
        
        return '';
       
    }

    get fechaMinimaConformidad(): string {
         if (!this.entrega?.fechaRecepcion) return '';
        const d = new Date(this.entrega?.fechaRecepcion);
        return d.toISOString().split('T')[0];
    }

    get fechaMaxima(): string {
        const fechaMax = new Date();
        if (!fechaMax) return '';
        const d = new Date(fechaMax);
        return d.toISOString().split('T')[0];
    }

    get tipoUnidadRecepcion(): TipoUnidad | null {
        return this.entrega?.tipoUnidad
            ?? this.entregable?.tipoUnidadEntregas
            ?? this.itemOrdenCompra?.tipoUnidad
            ?? null;
    }

    validarFormatoDecimal(esPorcentaje: boolean): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const raw = control.value;
            if (raw === null || raw === undefined || raw === '') return null;

            const str = String(raw).trim().replace(',', '.');
            const n = Number(str);

            if (isNaN(n)) return { formatoDecimalInvalido: true };

            if (esPorcentaje) {
                // porcentaje solo enteros entre 0 y 100
                if (!Number.isInteger(n)) return { porcentajeEntero: true };
                if (n < 0 || n > 100) return { porcentajeFueraDeRango: true };
                return null;
            }

            return null;
        };
    }

    motivoRequeridoSiRechazo(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const parent = control?.parent as FormGroup | null;
            if (!parent) return null;

            const cantRech = this.parseDecimal(parent.get('cantidadRechazada')?.value) || 0;

            const tieneTexto = String(control.value ?? '').trim().length > 0;

            return cantRech > 0 && !tieneTexto ? { required: true } : null;
        };
    }

    parseDecimal(v: any): number {
        if (v === null || v === undefined) return NaN;
        if (typeof v === 'number') return v;
        const s = String(v).trim().replace(/\./g, '.').replace(',', '.');
        return Number(s);
    }


    //Calculos
    protected configurarRecalculoAutomatico(): void {
        this.form.get('cantidadAceptada')?.valueChanges.subscribe(() => {
            this.recalcularCantidadPendiente();
            this.form.get('cantidadRechazada')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });

        this.form.get('cantidadRechazada')?.valueChanges.subscribe(() => {
            this.form.get('cantidadAceptada')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            this.form.get('motivo')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        });

        this.recalcularCantidadPendiente();
    }

    private recalcularCantidadPendiente(): void {
        const cantidadAceptada = this.parseDecimal(this.form.get('cantidadAceptada')?.value) ?? 0;
        const cantidadTotal = this.obtenerCantidadTotal();
        let cantidadPendiente = cantidadTotal - cantidadAceptada;

        if (cantidadPendiente < 0) {
            cantidadPendiente = cantidadTotal;
        }
        cantidadPendiente = Math.round((cantidadPendiente + Number.EPSILON) * 100) / 100;
        this.form.get('cantidadPendiente')?.setValue(cantidadPendiente);
    }

    protected abstract obtenerCantidadTotal(): number;

    //Validators
    protected fechaRangoValidatorRecepcion() {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;

            const seleccionada = new Date(control.value);
            const min = this.fechaMinimaRecepcion ? new Date(this.fechaMinimaRecepcion) : null;
            const max = this.fechaMaxima ? new Date(this.fechaMaxima) : null;

            if (min && seleccionada < min) return { min: { value: control.value } };
            if (max && seleccionada > max) return { max: { value: control.value } };
            return null;
        };
    }

    protected fechaRangoValidatorConformidad() {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;

            const seleccionada = new Date(control.value);
            const min = this.fechaMinimaConformidad ? new Date(this.fechaMinimaConformidad) : null;
            const max = this.fechaMaxima ? new Date(this.fechaMaxima) : null;

            if (min && seleccionada < min) return { min: { value: control.value } };
            if (max && seleccionada > max) return { max: { value: control.value } };
            return null;
        };
    }

    protected validarCantidadAceptada(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) {
                return null;
            }
          
            const cantidadAceptada = this.parseDecimal(control.value) ?? 0;
            const cantidadTotal = this.obtenerCantidadTotal();

            if (this.entregable && this.entregable.cantidad === 1 && this.entregable.tipoUnidadEntregas === TipoUnidad.CANTIDAD
                && cantidadAceptada !== 1 && cantidadAceptada !== 0) {     
                return { 'cantidadInvalidaEntregable': { actual: cantidadAceptada } };
            }
            if (cantidadAceptada > cantidadTotal) {
                return { 'excedeCantidadTotal': { actual: cantidadAceptada, maximo: cantidadTotal } };
            }

            const cantidadRechazada = this.parseDecimal(this.form?.get('cantidadRechazada')?.value) ?? 0;

            if (cantidadAceptada + cantidadRechazada > cantidadTotal) {
                return {
                    'sumaTotalExcedida': {
                        aceptada: cantidadAceptada,
                        rechazada: cantidadRechazada,
                        total: cantidadTotal
                    }
                };
            }

            if (cantidadAceptada === 0 && cantidadRechazada === 0) {
                return { 'ambosCero': true };
            }

            return null;
        };
    }

    protected validarCantidadRechazada(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) {
                return null;
            }
            const cantidadRechazada = this.parseDecimal(control.value) ?? 0;
            const cantidadTotal = this.obtenerCantidadTotal();
            
            if (this.entregable && this.entregable.cantidad === 1 && this.entregable.tipoUnidadEntregas === TipoUnidad.CANTIDAD
                && cantidadRechazada !== 1 && cantidadRechazada !== 0) {     
                return { 'cantidadInvalidaEntregable': { actual: cantidadRechazada } };
            }
            if (cantidadRechazada > cantidadTotal) {
                return { 'excedeCantidadTotal': { actual: cantidadRechazada, maximo: cantidadTotal } };
            }

            const cantidadAceptada = this.parseDecimal(this.form?.get('cantidadAceptada')?.value) ?? 0;
            if (cantidadAceptada + cantidadRechazada > cantidadTotal) {
                return {
                    'sumaTotalExcedida': {
                        aceptada: cantidadAceptada,
                        rechazada: cantidadRechazada,
                        total: cantidadTotal
                    }
                };
            }

            if (cantidadAceptada === 0 && cantidadRechazada === 0) {
                return { 'ambosCero': true };
            }

            return null;
        };
    }

    override campoVacio(controlName: string): boolean {
        const control = this.form.get(controlName);
        return !!control && control.touched && !control.value;
    }


    //Documentos
    descargarDocumento(documento: ArchivoDTO): void {
        this.documentosUtilService.descargarDocumento(documento, this.entrega?.idEntrega);
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

    agregarDocumento(): void {
        const modalRef = this.abrirPopup(AgregarDocumentoPopupComponent, undefined, {
            backdrop: 'static',
            keyboard: false
        });

        modalRef.documentoAgregado.subscribe((documento: ArchivoDTO) => {
            this.documentos.push(documento);
        });
    }

    //Servicios
    obtenerItemOrdenCompra(): void {
        if (this.ordenCompra?.idOC && this.itemOrdenCompra?.idItem) {
            this.itemOrdenCompraService
                .obtenerItemOrdenCompra(this.ordenCompra.idOC, this.itemOrdenCompra.idItem, this.itemOrdenCompra.idVariacion)
                .subscribe(item => {
                    this.itemOrdenCompra = item;
                    if (this.entregable) {
                        this.entregable.itemOrdenCompra = item;
                    }
                });
        }
    }

    obtenerEntregable(): void {
        if (this.entregable?.idEntregable) {
            this.entregableService.obtenerEntregable(this.entregable.idEntregable)
                .subscribe(ent => {
                    this.entregable = ent;
                    if (this.itemOrdenCompra != null) {
                        this.entregable.itemOrdenCompra ??= this.itemOrdenCompra;
                    }
                });
        }
    }

    //Cabezal entregable
    getCantidad(entregable: IEntregableDTO): string {
        return obtenerCantidadEntregable(entregable);
    }


    //Cabezal
    getUnidad(entregable: IEntregableDTO): string {
        return obtenerUnidadEntregable(entregable);
    }
}
