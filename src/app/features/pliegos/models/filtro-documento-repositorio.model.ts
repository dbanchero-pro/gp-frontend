import { TipoArchivoRepositorio } from '../enum/tipo-archivo-repositorio.enum';

export interface IFiltroDocumentoRepositorioDTO {
    idInciso?: number;
    idUnidadEjecutora?: number;
    nombreDocumento?: string;
    descripcionDocumento?: string;
    tipoArchivo?: TipoArchivoRepositorio;
}

export class FiltroDocumentoRepositorioDTO implements IFiltroDocumentoRepositorioDTO {
    constructor(
        public idInciso?: number,
        public idUnidadEjecutora?: number,
        public nombreDocumento?: string,
        public descripcionDocumento?: string,
        public tipoArchivo?: TipoArchivoRepositorio
    ) {}
}
