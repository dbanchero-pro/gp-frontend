import { CapituloDTO } from "src/app/shared/models/pliego/capitulo/capitulo.model";
import { SeccionDTO } from "src/app/shared/models/pliego/seccion/seccion.model";
import { ClausulaDTO } from "src/app/shared/models/pliego/clausula/clausula.model";
import { NotaDTO } from "./nota.model";
import { NumeroNulo } from "src/app/shared/types/numero-nulo.type";
import { CampoPliegoDTO } from "./campo-pliego.model";

export interface ClausulaPliego {
  id: number;
  nombre?: string;
  bloqueada: boolean;
  obligatoria?: boolean;
  editable?: boolean;
  idClausula?: number;
  idRedaccion?: NumeroNulo;
  redaccion?: string;
  campos?: CampoPliegoDTO[];
  notas?: NotaDTO[];
  orden?: number;
  seccion?: SeccionDTO;
  capitulo?: CapituloDTO;
  clausula?: ClausulaDTO;
}
