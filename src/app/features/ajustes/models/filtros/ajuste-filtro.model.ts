import { EstadoAjuste } from "../../enum/estado-ajuste.enum";
import { TipoAjuste } from "../../enum/tipo-ajuste.enum";

export interface IAjusteFiltro {
  tipoAjuste?: TipoAjuste;
  idItem?: number;
  idVariacion?: number;
  estado?: EstadoAjuste;
  fechaDesde?: string | null; // ISO yyyy-MM-dd
  fechaHasta?: string | null; // ISO yyyy-MM-dd
  nroItem?: number;
  codArticulo?: number;
}
