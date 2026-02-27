import { CampoDTO } from "src/app/shared/models/pliego/comun/campo.model";

export interface CampoPliegoDTO {
  id: number;
  valorString: string;
  campo: CampoDTO;
  bloqueado: string;
}
