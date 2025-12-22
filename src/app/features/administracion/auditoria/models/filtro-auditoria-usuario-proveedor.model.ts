import { TipoUsuario } from "src/app/shared/enum/tipo-usuario.enum";

export interface IFiltroAuditoriaUsuarioProveedorDTO {
    tipoOperacion?: string;
    fechaDesde?: Date | string;
    fechaHasta?: Date | string;
    paisDocumentoUsuario?: string;
    tipoDocumentoUsuario?: string;
    nroDocumentoUsuario?: string;
    paisDocumentoGestionado?: string;
    tipoDocumentoGestionado?: string;
    nroDocumentoGestionado?: string;
    paisDocumentoProveedor?: string;
    tipoDocumentoProveedor?: string;
    nroDocumentoProveedor?: string;
    tipoUsuario?: TipoUsuario;
}
