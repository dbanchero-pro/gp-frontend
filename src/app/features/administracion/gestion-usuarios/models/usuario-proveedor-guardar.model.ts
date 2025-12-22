import { ProveedorDTO } from "src/app/shared/models/proveedor/proveedor.model";
import { UsuarioProveedorDTO } from "src/app/shared/models/usuario/usuario-proveedor.model";

export interface UsuarioProveedorGuardarDTO extends UsuarioProveedorDTO {
    id: string;
    nombre: string;
    correo: string;
    proveedor: ProveedorDTO;
}
