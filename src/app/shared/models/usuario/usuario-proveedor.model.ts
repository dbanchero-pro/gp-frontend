import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { IPaisDTO } from '../common/pais.model';
import { TipoDocumentoUsuarioDTO } from './tipo-documento-usuario.model';

export interface UsuarioProveedorDTO {
    id?: string;
    idUsuario?: string;
    nombre?: string;
    pais?: IPaisDTO;
    tipoDocumento?: TipoDocumentoUsuarioDTO;
    nroDocumento?: string;
    proveedor?: ProveedorDTO;
    correo: string;
    fechaNombreConfirmado?: Date;
}
