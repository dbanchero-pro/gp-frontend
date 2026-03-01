import { ProveedorDTO } from '../proveedor/proveedor.model';
import { IUnidadCompraDTO } from '../sice/unidad-compra.model';

export interface IUsuarioInfoDTO {
    nombre?: string;
    usuario?: string;
    permisos?: string[];
    unidadesCompra?: IUnidadCompraDTO[];
    proveedores?: ProveedorDTO[];
}

export class UsuarioInfoDTO implements IUsuarioInfoDTO {
    constructor(
        public nombre?: string,
        public usuario?: string,
        public permisos?: string[],
        public unidadesCompra?: IUnidadCompraDTO[],
        public proveedores?: ProveedorDTO[],
    ) {}
}
