import { FechaStringNulo } from "src/app/shared/types/fecha-string-nulo.type";
import { NumeroNulo } from "src/app/shared/types/numero-nulo.type";


export interface RedaccionClausula {
  id?: NumeroNulo;
  clausulaId?: number;
  prioridad: number;
  redaccion: string;
  fechaCreacion?: FechaStringNulo;
  usuarioCreacion?: string | null;
  fechaModificacion?: FechaStringNulo;
  usuarioModificacion?: string | null;
}
