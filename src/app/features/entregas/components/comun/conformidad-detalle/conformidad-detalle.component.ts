import { Component, Input } from '@angular/core';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { IEntregaDTO } from '../../../models/entrega.model';


@Component({
    selector: 'app-conformidad-detalle',
    templateUrl: './conformidad-detalle.component.html',
    standalone: false
})

export class ConformidadDetalleComponent {
    @Input() entrega!: IEntregaDTO;

    constructor(private readonly documentosUtilService: DocumentosUtilService) { }

    get etiquetaFecha(): string {
        return this.entrega.entregable ? 'Fecha entrega' : 'Fecha entrega prevista';
    };

    get etiquetaCantidad(): string {
        return this.entrega.entregable ? 'Cantidad' : 'Cantidad prevista';
    };

    cantidadPendienteConformidad(entrega: IEntregaDTO): number {
        return parseFloat((entrega.cantidadRecepcionAceptada! - entrega.cantidadConformidadAceptada!).toFixed(2));
    }

    //Documentos
    descargarDocumento(documento: ArchivoDTO): void {
        this.documentosUtilService.descargarDocumento(documento, this.entrega?.idEntrega);
    }

}
