import { FechaStringNulo } from 'src/app/shared/types/fecha-string-nulo.type';
import { NumeroNulo } from 'src/app/shared/types/numero-nulo.type';

export interface FiltroClausula {
    incisoId: NumeroNulo;
    unidadEjecutoraId: NumeroNulo;
    tipoCompraId: NumeroNulo;
    subtipoCompraId: NumeroNulo;
    familiaId: NumeroNulo;
    subfamiliaId: NumeroNulo;
    claseId: NumeroNulo;
    subclaseId: NumeroNulo;
    articuloId: NumeroNulo;
    denominacion: string;
    fechaVigenciaDesde: FechaStringNulo;
    fechaVigenciaHasta: FechaStringNulo;
}
