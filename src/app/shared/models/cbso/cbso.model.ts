import { ClaseDTO } from './clase.model';

export interface ICbsoDTO {
    id?: number;
    familia?: number | string;
    subfamilia?: number | string;
    claseId?: number | string;
    subclaseId?: number | string;
    obligatorio?: boolean;
    anioDesde?: number;
}

export class CbsoDTO implements ICbsoDTO {
    constructor(
        public id?: number,
        public familia?: number | string,
        public subfamilia?: number | string,
        public claseId?: number | string,
        public subclaseId?: number | string,
        public obligatorio?: boolean,
        public anioDesde?: number,
        public clase?: ClaseDTO,
    ) {}
}
