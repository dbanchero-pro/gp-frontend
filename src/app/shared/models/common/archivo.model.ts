export interface IArchivoDTO {
    id?: number;
    nombre?: string;
    mimeType?: string;
    contenido?: string;
    modificado?: boolean;
    eliminado?: boolean;
    fecha?: Date;
}

export class ArchivoDTO implements IArchivoDTO {
    constructor(
        public id?: number,
        public nombre?: string,
        public mimeType?: string,
        public contenido?: string,
        public modificado?: boolean,
        public eliminado?: boolean,
        public fecha?: Date) {
        
    }
}
