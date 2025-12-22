import { ArchivoDTO } from "src/app/shared/models/common/archivo.model";
import { IEntregaDTO } from "./entrega.model";

export interface IRecepcionEntregasRequest {
  entregas: IEntregaDTO[];
  fechaRecepcion: string;
  aceptaRecepcion: boolean;
  motivo?: string;
  documentos?: ArchivoDTO[];
}
