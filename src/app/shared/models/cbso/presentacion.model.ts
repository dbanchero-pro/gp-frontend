import { IUnidadMedidaDTO } from './unidad-medida.model';

export interface IPresentacionDTO {
    id?: number;
    descPresentacion?: string;
    unidadMedida?: IUnidadMedidaDTO;
}

export class PresentacionDTO implements IPresentacionDTO {
    constructor(
        public id?: number,
        public descPresentacion?: string,
        public unidadMedida?: IUnidadMedidaDTO,
    ) {}
}
