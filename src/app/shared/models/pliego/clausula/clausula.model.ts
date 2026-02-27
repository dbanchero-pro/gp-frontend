
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { FechaStringNulo } from 'src/app/shared/types/fecha-string-nulo.type';
import { NumeroNulo } from 'src/app/shared/types/numero-nulo.type';
import { OrganismoClausulaModeloDTO } from '../comun/organismo-clausula-modelo.model';
import { RedaccionDTO } from './redaccion.model';
import { TipoCompraClausulaModeloDTO } from '../comun/tipo-compra-clausula-modelo.model';
import { ObjetoCompraDTO } from './objeto-compra.model';

export interface ClausulaDTO {
  id: NumeroNulo;
  denominacion: string;
  obligatoria: boolean;
  editable: boolean;
  aperturaElectronica?: boolean;
  tiposCompra: TipoCompraClausulaModeloDTO[];
  objetosCompra: ObjetoCompraDTO[];
  organismo?: OrganismoClausulaModeloDTO;
  fechaVigenciaDesde?: FechaStringNulo;
  fechaVigenciaHasta?: FechaStringNulo;
  estado: EstadoElemento;
  redacciones: RedaccionDTO[];
  version?: number;
  fechaCreacion?: FechaStringNulo;
  usuarioCreacion?: string | null;
  fechaModificacion?: FechaStringNulo;
  usuarioModificacion?: string | null;
}


