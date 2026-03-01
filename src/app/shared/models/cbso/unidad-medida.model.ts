export interface IUnidadMedidaDTO {
    id?: number;
    descUnidadMedida?: string;
    tipoUnidadMedida?: number;
}

export class UnidadMedidaDTO implements IUnidadMedidaDTO {
    constructor(
        public id?: number,
        public codUnidadMedida?: number,
        public descUnidadMedida?: string,
        public tipoUnidadMedida?: number,
    ) {}
}
