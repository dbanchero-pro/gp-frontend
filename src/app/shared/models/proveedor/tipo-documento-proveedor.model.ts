export interface ITipoDocumentoProveedorDTO {
    tipoDocumento?: string;
    descripcion?: string;
}

export class TipoDocumentoProveedorDTO implements ITipoDocumentoProveedorDTO {
    constructor(
        public tipoDocumento?: string,
        public descripcion?: string,
    ) {}
}
