
export interface ITipoDocumentoUsuarioDTO {
    id?: number;
    idPais?: string;
    idTipoDocumento?: string;
    descripcion?: string;
}

export class TipoDocumentoUsuarioDTO implements ITipoDocumentoUsuarioDTO {
    constructor(public id?: number, public idPais?: string, public idTipoDocumento?: string, public descripcion?: string) {
    }
}