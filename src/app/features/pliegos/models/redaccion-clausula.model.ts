import { FechaStringNulo } from '../../../shared/types/fecha-string-nulo.type';
import { NumeroNulo } from '../../../shared/types/numero-nulo.type';

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
