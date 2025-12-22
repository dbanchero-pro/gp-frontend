import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';

export interface ConfiguracionPlazoDTO {
    idProveedor: string;
    proveedor?: ProveedorDTO;
    cantidadDias: number;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
}

export interface ConfiguracionPlazoGuardarDTO {
    idProveedor: string;
    cantidadDias: number;
}
