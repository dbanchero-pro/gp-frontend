import { IItemDTO } from './item.model';
import { IZonaDTO } from './zona.model';

export interface IZonaEntregaDTO {
    id?: number;
    item?: IItemDTO;
    zona?: IZonaDTO;
    cantidadComprarContratar?: number;
    periodoRecepcionIni?: Date;
    periodoRecepcionFin?: Date;
    observacion?: string;
    descZona?: string;
    penalizableFechaIngreso?: boolean;
}

export class ZonaEntregaDTO implements IZonaEntregaDTO {
    constructor(
        public id?: number,
        public item?: IItemDTO,
        public zona?: IZonaDTO,
        public cantidadComprarContratar?: number,
        public periodoRecepcionIni?: Date,
        public periodoRecepcionFin?: Date,
        public observacion?: string,
        public descZona?: string,
        public penalizableFechaIngreso?: boolean,
    ) {}
}
