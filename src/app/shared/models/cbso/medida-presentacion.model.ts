export interface IMedidaPresentacionDTO {
    id?: number;
    codMedida?: number;
    descMedida?: string;
}

export class MedidaPresentacionDTO implements IMedidaPresentacionDTO {
    constructor(
        public id?: number,
        public codMedida?: number,
        public descMedida?: string,
    ) {}
}
