import { EstadoClausula } from '../enum/estado-clausula.enum';

export interface RedaccionClausula {
  redaccionId: number;
  prioridad: number;
  redaccion: string;
}

export interface ClausulaModelo {
  clausulaId: number;
  orden: number;
  denominacion: string;
  version: number;
  redacciones: RedaccionClausula[];
}

export interface CapituloModelo {
  capituloId: number;
  orden: number;
  denominacion: string;
  version: number;
  clausulas: ClausulaModelo[];
}

export interface SeccionModelo {
  seccionId: number;
  orden: number;
  denominacion: string;
  version: number;
  capitulos: CapituloModelo[];
  clausulas: ClausulaModelo[];
}

export interface SubtipoCompraModelo {
  subtipoCompraId: number;
  descripcion: string;
}

export interface TipoCompraModelo {
  tipoCompraId: number;
  descripcion: string;
  subtipos: SubtipoCompraModelo[];
}

export interface OrganismoModelo {
  incisoId: number;
  incisoDescripcion: string;
  unidadEjecutoraId: number;
  unidadEjecutoraDescripcion: string;
}

export interface Modelo {
  id: number | null;
  denominacion: string;
  fechaVigenciaDesde: string | null;
  fechaVigenciaHasta: string | null;
  estado: EstadoClausula | string;
  versionada: boolean;
  version: number | undefined;
  secciones: SeccionModelo[];
  tiposCompra: TipoCompraModelo[];
  organismos: OrganismoModelo[];
  fechaCreacion: string | null;
  usuarioCreacion: string | null;
  fechaModificacion: string | null;
  usuarioModificacion: string | null;
}
