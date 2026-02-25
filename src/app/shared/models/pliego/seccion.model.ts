import { FechaStringNulo } from '../../../shared/types/fecha-string-nulo.type';
import { NumeroNulo } from '../../../shared/types/numero-nulo.type';
import { EstadoElemento } from '../../enum/estado-elemento.enum';

export interface Seccion {
  id: NumeroNulo;
  denominacion: string;
  fechaVigenciaDesde: FechaStringNulo;
  fechaVigenciaHasta: FechaStringNulo;
  estado: EstadoElemento;
  capitulos: CapituloSeccion[];
  clausulas: ClausulaSeccion[];
  versionada: boolean;
  version?: number;
  fechaCreacion: FechaStringNulo;
  usuarioCreacion: string | null;
  fechaModificacion: FechaStringNulo;
  usuarioModificacion: string | null;
}

export interface CapituloSeccion {
  capituloId: number;
  orden: number;
  denominacion: string;
  version: number;
  clausulas: ClausulaCapitulo[];
}

export interface ClausulaCapitulo {
  clausulaId: number;
  orden: number;
  denominacion: string;
  version: number;
}

export interface ClausulaSeccion {
  clausulaId: number;
  orden: number;
  denominacion: string;
  version: number;
}
