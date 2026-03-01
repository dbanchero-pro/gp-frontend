export interface IPaisDTO {
    id?: string;
    descripcion?: string;
}

export class PaisDTO implements IPaisDTO {
    constructor(
        public id?: string,
        public descripcion?: string,
    ) {}
}
