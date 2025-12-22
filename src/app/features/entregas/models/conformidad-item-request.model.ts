import { ArchivoDTO } from "src/app/shared/models/common/archivo.model";
import { TipoObservacion } from "../enum/tipo-observacion.enum";
import { IItemOrdenCompraDTO } from "./item-orden-compra.model";

export interface IConformidadItemsRequest {
  items: IItemOrdenCompraDTO[];
  fechaConformidad: string;
  aceptaConformidad: boolean;
  motivo?: string;
  documentos?: ArchivoDTO[];
  tipoObservacion?: TipoObservacion;
  observaciones?: string;
}
