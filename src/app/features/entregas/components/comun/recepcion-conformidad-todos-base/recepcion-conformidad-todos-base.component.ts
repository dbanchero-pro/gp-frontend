import { Directive, EventEmitter, Input, Output } from "@angular/core";
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { PopupBaseComponent } from "src/app/shared/components/popup-base/popup-base.component";
import { ArchivoDTO } from "src/app/shared/models/common/archivo.model";
import { DocumentosUtilService } from "src/app/shared/services/common/documentos-util.service";
import { obtenerCantidadEntregable, obtenerUnidadEntregable } from "src/app/shared/utils/functions";
import { IEntregaDTO } from "../../../models/entrega.model";
import { IEntregableDTO } from "../../../models/entregable.model";
import { IItemOrdenCompraDTO, ItemOrdenCompraDTO } from "../../../models/item-orden-compra.model";
import { IOrdenCompraDTO } from "../../../models/orden-ompra.model";
import { AgregarDocumentoPopupComponent } from "../../seguimiento/agregar-documento-popup/agregar-documento-popup.component";

@Directive()
export abstract class RecepcionConformidadTodosBaseComponent extends PopupBaseComponent {
    @Input() public ordenCompra!: IOrdenCompraDTO;
    @Input() entrega!: IEntregaDTO;
    @Input() entregable!: IEntregableDTO;
    @Input() itemOrdenCompra: IItemOrdenCompraDTO | null = null;
    @Input() itemsOrdenCompra: ItemOrdenCompraDTO[] | null = null;
    @Input() entregas!: IEntregaDTO[];
    @Input() titulo = 'Entregas Seleccionadas';
    @Output() guardarEvento = new EventEmitter<any>();


    protected labelAceptadaCantidad = 'Cantidad aceptada';
    protected labelAceptadaPorcentaje = 'Porcentaje aceptado';

    public documentos: ArchivoDTO[] = [];

    constructor(
        protected readonly documentosUtilService: DocumentosUtilService
    ) {
        super();

    }

    get fechaMinima(): string {
        if (!this.ordenCompra?.fechaOC) return '';
        const d = new Date(this.ordenCompra.fechaOC);
        return d.toISOString().split('T')[0];
    }

    get fechaMaxima(): string {
        const fechaMax = new Date();
        if (!fechaMax) return '';
        const d = new Date(fechaMax);
        return d.toISOString().split('T')[0];
    }

    protected fechaRangoValidator() {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!control.value) return null;
            const seleccionada = new Date(control.value);
            const min = this.fechaMinima ? new Date(this.fechaMinima) : null;
            const max = this.fechaMaxima ? new Date(this.fechaMaxima) : null;
            if (min && seleccionada < min) return { min: { value: control.value } };
            if (max && seleccionada > max) return { max: { value: control.value } };
            return null;
        };
    }
    
    //Cabezal
    getCantidad(entregable: IEntregableDTO): string {
        return obtenerCantidadEntregable(entregable);
    }

    getUnidad(entregable: IEntregableDTO): string {
        return obtenerUnidadEntregable(entregable);
    }


    protected eliminarDocumento(documento: ArchivoDTO): void {
        this.documentos = this.documentosUtilService.eliminarDocumento(this.documentos, documento);
    }

    protected getDocumentDate(index: number): Date {
        return this.documentosUtilService.getDocumentDate(this.documentos, index);
    }

    protected agregarDocumento(): void {
        const modalRef = this.abrirPopup(AgregarDocumentoPopupComponent, undefined, {
            backdrop: 'static',
            keyboard: false
        });

        modalRef.documentoAgregado.subscribe((documento: ArchivoDTO) => {
            this.documentos.push(documento);
        });

    }

    protected descargarDocumento(documento: ArchivoDTO): void {
        const idEntrega = this.entregas && this.entregas.length === 1 ? this.entregas[0].idEntrega : undefined;
        this.documentosUtilService.descargarDocumento(documento, idEntrega);
    }

    

    protected motivoRequeridoSiRechazo(): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (!this.form) return null;

            const acepta = this.form.get('aceptaOperacion')?.value;
            const motivo = control.value;
            if (acepta === false && (!motivo || motivo.trim() === '')) {
                return { required: true };
            }
            return null;
        };
    }
}
