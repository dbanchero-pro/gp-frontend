import { AuditoriaAjusteTipoOperacion } from '../enum/auditoria-ajuste-tipo-operacion.enum';
import { ItemOrdenCompraDTO } from './item-orden-compra.model';
import { IOrdenCompraDTO } from './orden-ompra.model';

export interface IAuditoriaAjusteDTO {
    idEntidad: number;
    fechaOperacion: string;
    tipoOperacion: AuditoriaAjusteTipoOperacion;
    id: number;
    nroDocumento: string;
    correo: string;
    itemOrdenCompra?: ItemOrdenCompraDTO;
    ordenCompra: IOrdenCompraDTO;
    usuario: string;
    campo?: string;
    valorOriginal?: string;
    valorFinal?: string;
}
