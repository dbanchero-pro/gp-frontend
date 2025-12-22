import { ArchivoDTO } from "src/app/shared/models/common/archivo.model";
import { IItemOrdenCompraDTO } from "./item-orden-compra.model";

export interface IRecepcionItemsRequest {
  items: IItemOrdenCompraDTO[];
  fechaRecepcion: string;
  aceptaRecepcion: boolean;
  motivo?: string;
  documentos?: ArchivoDTO[];
}
