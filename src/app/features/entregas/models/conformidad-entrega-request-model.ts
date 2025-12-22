import { ArchivoDTO } from "src/app/shared/models/common/archivo.model";
import { TipoObservacion } from "../enum/tipo-observacion.enum";
import { IEntregaDTO } from "./entrega.model";

export interface IConformidadEntregasRequest {
  
  idOC?: number;
  idItem?: number;
  idVariacion?: number;  
  entregas: IEntregaDTO[];
  fechaConformidad: string;
  aceptaConformidad: boolean;
  motivo?: string;
  documentos?: ArchivoDTO[];
  tipoObservacion?: TipoObservacion;
  observaciones?: string;
}
