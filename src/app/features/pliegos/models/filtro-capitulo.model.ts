import { FechaStringNulo } from '../../../shared/types/fecha-string-nulo.type';

export interface FiltroCapitulo {
  denominacion?: string;
  fechaVigenciaDesde?: FechaStringNulo;
  fechaVigenciaHasta?: FechaStringNulo;
}
