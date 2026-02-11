import { EstadoProcesoPliego } from '../enum/estado-proceso-pliego.enum';

export interface FiltroBandejaEntrada {
  incisoId?: number | null;
  unidadEjecutoraId?: number | null;
  unidadCompraId?: number | null;
  numeroCompra?: number | null;
  anioCompra?: number | null;
  tipoCompraId?: string | null;
  estado?: EstadoProcesoPliego | null;
  soloPublicadosVigentes?: boolean | null;
}
