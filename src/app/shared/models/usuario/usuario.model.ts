import { IPaisDTO } from '../common/pais.model';
import { TipoDocumentoUsuarioDTO } from './tipo-documento-usuario.model';

export interface UsuarioDTO {
  id: string;
  nombre: string;
  pais: IPaisDTO;
  tipoDocumento: TipoDocumentoUsuarioDTO;
  nroDocumento: string;
  fechaNombreConfirmado?: Date;
}
