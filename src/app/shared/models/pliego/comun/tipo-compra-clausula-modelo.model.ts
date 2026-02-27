import { SubtipoCompraDTO } from "../../sice/subtipo-compra.model";
import { TipoCompraDTO } from "../../sice/tipo-compra.model";


export interface TipoCompraClausulaModeloDTO {
  tipoCompra: TipoCompraDTO;
  subtipoCompra?: SubtipoCompraDTO;
}
