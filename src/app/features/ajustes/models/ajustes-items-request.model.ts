import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { EstadoAjuste } from '../enum/estado-ajuste.enum';
import { TipoAjuste } from '../enum/tipo-ajuste.enum';
import { IAjusteDTO } from './ajuste.model';

export interface IAjustesItemsRequestDTO {
  idOC: number;
  ajusteDto: IAjusteDTO[];
  documento: IArchivoDTO | null;
  usuarioSolicitante: UsuarioDTO | null;
  tipoSolicitante: TipoUsuario;
  tipoAjuste: TipoAjuste;
  permitidoEnPliego: boolean;
  fuerzaMayor: boolean;
  estado: EstadoAjuste;
  comentario: string | null;
  listadoAjustesErrores: IAjusteDTO[];
}
