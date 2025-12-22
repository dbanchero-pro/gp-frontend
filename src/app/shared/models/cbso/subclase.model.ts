import { IClaseDTO } from "./clase.model";

export interface ISubclaseDTO {
    id?: number;
    codSubClase?: string;
    descSubclase?: string;
    familiaId?: string;
    subfamiliaId?: string;
    claseId?: string;
    clase?: IClaseDTO;
}

export class SubclaseDTO implements ISubclaseDTO {
    constructor(public id?: number, public codClase?: string, public descSubclase?: string,
        public familiaId?: string, public subfamiliaId?: string, public claseId?: string, public clase?: IClaseDTO) {
    }
}
