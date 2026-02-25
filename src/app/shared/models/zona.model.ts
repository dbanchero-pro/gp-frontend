export interface IZonaDTO {
    id?: number;
    descripcionZona?: string;
    dadoBaja?: boolean;
}

export class ZonaDto implements IZonaDTO {
    constructor(
        public id?: number,
        public descripcionZona?: string,
        public dadoBaja?: boolean) {
    }
}
