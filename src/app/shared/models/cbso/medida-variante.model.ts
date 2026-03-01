export interface IMedidaVarianteDTO {
    id?: number;
    descMedida?: string;
}

export class MedidaVarianteDTO implements IMedidaVarianteDTO {
    constructor(
        public id?: number,
        public descMedida?: string,
    ) {}
}
