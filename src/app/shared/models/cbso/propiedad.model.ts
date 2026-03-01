export interface IPropiedadDTO {
    id?: number;
    descPropiedad?: string;
}

export class PropiedadDTO implements IPropiedadDTO {
    constructor(
        public id?: number,
        public descPropiedad?: string,
    ) {}
}
