import { Component, Input } from '@angular/core';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { IEntregaDTO } from '../../../models/entrega.model';
import { TipoArticuloServObra } from '../../../enum/tipo-articulo-serv-obra';


@Component({
    selector: 'app-entrega-detalle',
    templateUrl: './entrega-detalle.component.html',
    standalone: false
})

export class EntregaDetalleComponent  {
    @Input() entrega!: IEntregaDTO;

    constructor(private readonly documentosUtilService: DocumentosUtilService) { }
    
    get etiquetaCantidad(): string {
        return this.entrega.entregable ? 'Cantidad' : 'Cantidad prevista';
    };

    get mostrarFechaEntregado(): boolean {
        return this.entrega?.itemOrdenCompra?.tipoArticulo !== TipoArticuloServObra.ARTICULO && !!this.entrega?.fechaEntrega;
    };


    //Documentos
    descargarDocumento(documento: ArchivoDTO): void {
        this.documentosUtilService.descargarDocumento(documento, this.entrega?.idEntrega);
    }
}
