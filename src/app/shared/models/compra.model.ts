import { ItemCompraDto as ItemCompraDTO } from './item-compra.model';
import { GrupoDTO } from './sice/grupo.model';
import { SubtipoCompraDTO } from './sice/subtipo-compra.model';
import { UnidadCompraDTO } from './sice/unidad-compra.model';

export interface CompraDTO {
    idCompra?: number;
    numCompra?: number;
    unidadCompra?: UnidadCompraDTO;
    estado?: any;
    anioCompra?: number;
    totalItems?: number;
    items?: ItemCompraDTO[];
    subtipoCompra: SubtipoCompraDTO;
    grupo?: GrupoDTO;
    nroAmpliacion?: number;
}
