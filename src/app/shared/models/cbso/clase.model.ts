import { SubfamiliaDTO } from './subfamilia.model';

export interface IClaseDTO {
    id?: number;
    codClase?: number;
    descClase?: string;
    familiaId?: number;
    subfamiliaId?: number;
    subfamilia?: SubfamiliaDTO;
}

export class ClaseDTO implements IClaseDTO {
    constructor(
        public id?: number,
        public codClase?: number,
        public descClase?: string,
        public familiaId?: number,
        public subfamiliaId?: number,
        public subfamilia?: SubfamiliaDTO,
    ) {}
}
