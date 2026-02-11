import { TipoFuenteCampo } from '../enum/tipo-fuente-campo.enum';

export interface IFiltroCampoDTO {
    etiqueta?: string;
    descripcion?: string;
    fuente?: TipoFuenteCampo;
}

export class FiltroCampoDTO implements IFiltroCampoDTO {
    constructor(
        public etiqueta?: string,
        public descripcion?: string,
        public fuente?: TipoFuenteCampo
    ) {}
}
