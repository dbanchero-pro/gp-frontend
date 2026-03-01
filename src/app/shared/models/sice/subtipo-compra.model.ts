export interface ISubtipoCompraDTO {
    idTipoCompra?: string;
    idSubtipoCompra?: string;
    descSubtipoCompra?: string;
    descTipoCompra?: string;
    indicadorComprasCentralizadas?: boolean;
    indicadorFondosRotatorios?: boolean;
}

export class SubtipoCompraDTO implements ISubtipoCompraDTO {
    constructor(
        public idTipoCompra?: string,
        public idSubtipoCompra?: string,
        public descSubtipoCompra?: string,
        public descTipoCompra?: string,
        public indicadorComprasCentralizadas?: boolean,
        public indicadorFondosRotatorios?: boolean,
    ) {}
}
