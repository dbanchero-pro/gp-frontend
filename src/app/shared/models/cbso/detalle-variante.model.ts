import { IMarcaDTO } from "./marca.model";

export interface IDetalleVarianteDTO {
    descDetalleVariante?: string;
    id?: number;
    marca?: IMarcaDTO;
}

export class DetalleVarianteDTO {
    constructor(public descDetalleVariante?: string, public id?: number, public marca?: IMarcaDTO) {
    }
}