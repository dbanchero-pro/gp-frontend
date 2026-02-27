import { NumeroNulo } from "src/app/shared/types/numero-nulo.type";
import { ClausulaDTO } from "../clausula/clausula.model";

export interface SeccionClausulaDTO {
  id: NumeroNulo;
  clausula: ClausulaDTO;
  orden: number;
}
