import { IIncisoDTO } from "./inciso.model";

export interface IUnidadEjecutoraDTO {
    id?: number;
    inciso?: IIncisoDTO;
    idUnidadEjecutora?: number;
    descUnidadEjecutora?: string;
}

export class UnidadEjecutoraDTO implements IUnidadEjecutoraDTO {
    constructor(public id?: number, public inciso?: IIncisoDTO, public idUnidadEjecutora?: number, public descUnidadEjecutora?: string) {
    }
}