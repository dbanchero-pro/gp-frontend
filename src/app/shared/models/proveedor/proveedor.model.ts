import { PaisDTO } from '../common/pais.model';

export interface ProveedorDTO {
    id?: string;
    nroDocumento: string;
    paisDocumento: PaisDTO;
    tipoDocumento: string;
    nombre?: string;
    plazoEntrega?: number;
}
