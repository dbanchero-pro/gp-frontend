import { IUnidadEjecutoraDTO } from './unidad-ejecutora.model';

export interface IUnidadCompraDTO {
    id?: number;
    idInciso?: number;
    descInciso?: string;
    idUnidadEjecutora?: number;
    descUnidadEjecutora?: string;
    idUnidadCompra?: number;
    unidadEjecutora?: IUnidadEjecutoraDTO;
    descUnidadCompra?: string;
    indicadorInterrelacionSIIF?: boolean;
}

export class UnidadCompraDTO implements IUnidadCompraDTO {
    constructor(
        public id?: number,
        public unidadEjecutora?: IUnidadEjecutoraDTO,
        public descUnidadCompra?: string,
        public idInciso?: number,
        public descInciso?: string,
        public idUnidadEjecutora?: number,
        public descUnidadEjecutora?: string,
        public idUnidadCompra?: number,
        public indicadorInterrelacionSIIF?: boolean
    ) { }
}
