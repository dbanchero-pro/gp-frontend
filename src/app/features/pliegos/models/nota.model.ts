import { CapituloDTO } from "src/app/shared/models/pliego/capitulo/capitulo.model";
import { ClausulaDTO } from "src/app/shared/models/pliego/clausula/clausula.model";
import { SeccionDTO } from "src/app/shared/models/pliego/seccion/seccion.model";
import { FechaStringNulo } from "src/app/shared/types/fecha-string-nulo.type";
import { NumeroNulo } from "src/app/shared/types/numero-nulo.type";

export interface NotaDTO {
  id: NumeroNulo;
  contenido: string;
  fechaCreación: FechaStringNulo;
  usuarioCreacion: string;
}
