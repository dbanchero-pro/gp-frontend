export interface FiltroModelo {
    incisoId: number | null;
    unidadEjecutoraId: number | null;
    tipoCompraId: string | null;
    subtipoCompraId: string | null;
    denominacion?: string;
    fechaVigenciaDesde: string | null;
    fechaVigenciaHasta: string | null;
}
