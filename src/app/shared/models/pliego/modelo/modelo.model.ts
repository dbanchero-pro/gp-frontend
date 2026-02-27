import { EstadoElemento } from "../../../enum/estado-elemento.enum";
import { NumeroNulo } from "../../../types/numero-nulo.type";
import { OrganismoClausulaModeloDTO } from "../comun/organismo-clausula-modelo.model";
import { TipoCompraClausulaModeloDTO } from "../comun/tipo-compra-clausula-modelo.model";
import { ModeloSeccionDTO } from "./modelo-seccion.model";


export interface ModeloDTO {
  id: NumeroNulo;
  denominacion: string;
  fechaVigenciaDesde: string | null;
  fechaVigenciaHasta: string | null;
  estado: EstadoElemento;
  version: NumeroNulo;
  secciones: ModeloSeccionDTO[];
  tiposCompra: TipoCompraClausulaModeloDTO[];
  organismo?: OrganismoClausulaModeloDTO;
  fechaCreacion: string | null;
  usuarioCreacion: string | null;
  fechaModificacion: string | null;
  usuarioModificacion: string | null;
}
