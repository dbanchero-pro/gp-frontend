import { FechaStringNulo } from "src/app/shared/types/fecha-string-nulo.type";

export interface FiltroSeccion {
  denominacion?: string;
  fechaVigenciaDesde?: FechaStringNulo;
  fechaVigenciaHasta?: FechaStringNulo;
}
