import { UsuarioProveedorDTO } from 'src/app/shared/models/usuario/usuario-proveedor.model';

export interface UsuarioAgrupadoDTO {
    idUsuario: string;
    documentoFormateado: string;
    paisDoc: string | undefined;
    tipoDoc: string | undefined;
    nombre: string;
    usuarioProveedores: UsuarioProveedorDTO[];
    fechaNombreConfirmado?: Date;
}
