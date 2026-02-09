export interface FiltroModelo {
  incisoId: number | null;
  unidadEjecutoraId: number | null;
  tipoCompraId: number | null;
  subtipoCompraId: number | null;
  denominacion?: string;
  fechaVigenciaDesde: string | null;
  fechaVigenciaHasta: string | null;
}
