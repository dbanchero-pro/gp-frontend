export interface ITipoCompraDTO {
    id?: string;
    descTipoCompra?: string;
}

export class TipoCompraDTO implements ITipoCompraDTO {
    constructor(
        public id?: string,
        public descTipoCompra?: string,
    ) {}
}
