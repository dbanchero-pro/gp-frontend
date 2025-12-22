import { CompraDTO } from 'src/app/shared/models/compra.model';
import { UnidadCompraDTO } from 'src/app/shared/models/sice/unidad-compra.model';
import { AuditoriaTipoABMEnum } from '../../../shared/enum/auditoria-tipo-abm.enum';
import { IEntregableDTO } from './entregable.model';
import { ItemOrdenCompraDTO } from './item-orden-compra.model';

export interface IAuditoriaEntregaDTO {
    idEntidad: number;
    fechaOperacion: string;
    tipoOperacion: AuditoriaTipoABMEnum;
    id: number;
    nroDocumento: string;
    unidadCompra?: UnidadCompraDTO;
    correo: string;
    compra?: CompraDTO;
    itemOrdenCompra?: ItemOrdenCompraDTO;
    usuario: string;
    entregable?: IEntregableDTO;
    campo?: string;
    valorOriginal?: string;
    valorFinal?: string;
}
