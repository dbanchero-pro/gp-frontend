export interface IMarcaDTO {
    descMarca?: string;
    id?: number;
}

export class MarcaDTO {
    constructor(
        public descMarca?: string,
        public id?: number,
    ) {}
}
