import { FamiliaDTO } from "./familia.model";

export interface ISubfamiliaDTO {
    id?: number;
    codSubfamilia?: string;
    descSubfamilia?: string;
    familiaId?: string;
    familia?: FamiliaDTO;
}

export class SubfamiliaDTO implements ISubfamiliaDTO {
    constructor(public id?: number, public codSubfamilia?: string, public descSubfamilia?: string,
        public familiaId?: string, public familia?: FamiliaDTO) {
    }
}
