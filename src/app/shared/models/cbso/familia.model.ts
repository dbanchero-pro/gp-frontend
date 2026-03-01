export interface IFamiliaDTO {
    id?: number;
    codFamilia?: string;
    descFamilia?: string;
}

export class FamiliaDTO implements IFamiliaDTO {
    constructor(
        public id?: number,
        public codFamilia?: string,
        public descFamilia?: string,
    ) {}
}
