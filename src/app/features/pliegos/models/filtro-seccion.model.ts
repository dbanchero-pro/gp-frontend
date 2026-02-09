import { FechaStringNulo } from '../../../shared/types/fecha-string-nulo.type';

export interface FiltroSeccion {
  denominacion?: string;
  fechaVigenciaDesde?: FechaStringNulo;
  fechaVigenciaHasta?: FechaStringNulo;
}
