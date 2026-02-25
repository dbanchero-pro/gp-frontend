import { IArchivoDTO } from '../../../shared/models/common/archivo.model';
import { TipoArchivoRepositorio } from '../../enum/tipo-archivo-repositorio.enum';
export interface IDocumentoRepositorioDTO {
    id?: number;
    idInciso?: number;
    nombreInciso?: string;
    idUnidadEjecutora?: number;
    nombreUnidadEjecutora?: string;
    nombreDocumento?: string;
    descripcionDocumento?: string;
    tipoArchivo?: TipoArchivoRepositorio;
    archivo?: IArchivoDTO;
    fechaCreacion?: Date;
    fechaModificacion?: Date;
}

export class DocumentoRepositorioDTO implements IDocumentoRepositorioDTO {
    constructor(
        public id?: number,
        public idInciso?: number,
        public nombreInciso?: string,
        public idUnidadEjecutora?: number,
        public nombreUnidadEjecutora?: string,
        public nombreDocumento?: string,
        public descripcionDocumento?: string,
        public tipoArchivo?: TipoArchivoRepositorio,
        public archivo?: IArchivoDTO,
        public fechaCreacion?: Date,
        public fechaModificacion?: Date
    ) {}
}
