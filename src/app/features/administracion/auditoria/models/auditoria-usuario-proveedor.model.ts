import { AuditoriaTipoABMEnum } from 'src/app/shared/enum/auditoria-tipo-abm.enum';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { UsuarioProveedorDTO } from 'src/app/shared/models/usuario/usuario-proveedor.model';

export interface IAuditoriaUsuarioProveedorDTO {
    fechaOperacion: string;
    tipoOperacion: AuditoriaTipoABMEnum;
    proveedor: ProveedorDTO;
    campo: string;
    valorOriginal: string;
    valorFinal: string;
    usuario: string;
    usuarioGestionado: UsuarioProveedorDTO;
}
