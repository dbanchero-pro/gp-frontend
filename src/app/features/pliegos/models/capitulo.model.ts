import { FechaStringNulo } from '../../../shared/types/fecha-string-nulo.type';
import { NumeroNulo } from '../../../shared/types/numero-nulo.type';
import { EstadoClausula } from '../enum/estado-clausula.enum';

export interface Capitulo {
  id: NumeroNulo;
  denominacion: string;
  fechaVigenciaDesde: FechaStringNulo;
  fechaVigenciaHasta: FechaStringNulo;
  estado: EstadoClausula;
  clausulas: ClausulaCapitulo[];
  versionada: boolean;
  version?: number;
  fechaCreacion: FechaStringNulo;
  usuarioCreacion: string | null;
  fechaModificacion: FechaStringNulo;
  usuarioModificacion: string | null;
}

export interface ClausulaCapitulo {
  clausulaId: number;
  orden: number;
  denominacion: string;
  version: number;
}
