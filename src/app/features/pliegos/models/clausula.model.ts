import { FechaStringNulo } from '../../../shared/types/fecha-string-nulo.type';
import { NumeroNulo } from '../../../shared/types/numero-nulo.type';
import { EstadoClausula } from '../enum/estado-clausula.enum';
import { TipoApertura } from '../enum/tipo-apertura.enum';
import { RedaccionClausula } from './redaccion-clausula.model';

export interface Clausula {
  id: NumeroNulo;
  denominacion: string;
  esObligatoria?: boolean;
  aperturaElectronica: boolean;
  tiposCompra: TipoCompraClausula[];
  objetosCompra: ObjetoCompraClausula[];
  incisos: IncisoClausula[];
  fechaVigenciaDesde: FechaStringNulo;
  fechaVigenciaHasta: FechaStringNulo;
  estado: EstadoClausula;
  redacciones: RedaccionClausula[];
  versionada: boolean;
  version?: number;
  fechaCreacion: FechaStringNulo;
  usuarioCreacion: string | null;
  fechaModificacion: FechaStringNulo;
  usuarioModificacion: string | null;
}

export interface TipoCompraClausula {
  tipoCompraId: number | string;
  tipoCompraDescripcion: string;
  subtipos: SubtipoCompraClausula[];
}

export interface SubtipoCompraClausula {
  subtipoCompraId: number | string;
  subtipoCompraDescripcion: string;
}

export interface ObjetoCompraClausula {
  familiaId: number;
  familiaDescripcion: string;
  subfamiliaId: NumeroNulo;
  subfamiliaDescripcion: string | null;
  claseId: NumeroNulo;
  claseDescripcion: string | null;
  subclaseId: NumeroNulo;
  subclaseDescripcion: string | null;
  articuloId?: NumeroNulo;
  articulo?: ArticuloClausula | null;
}

export interface ArticuloClausula {
  articuloId?: number;
  articuloCodigo: string;
  articuloDescripcion: string;
}

export interface IncisoClausula {
  incisoId: number;
  incisoCodigo: string;
  incisoDescripcion: string;
  unidadEjecutora?: UnidadEjecutoraClausula | null;
}

export interface UnidadEjecutoraClausula {
  unidadEjecutoraId: number;
  unidadEjecutoraCodigo: string;
  unidadEjecutoraDescripcion: string;
}
