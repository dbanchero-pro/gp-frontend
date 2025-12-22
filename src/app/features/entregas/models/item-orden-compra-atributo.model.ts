import { TipoMedida } from "../enum/tipo-medida";
import { ItemOrdenCompraDTO } from "./item-orden-compra.model";

export interface IItemOrdenCompraAtributoDTO {
    itemOrdenCompra: Partial<ItemOrdenCompraDTO>;
    codPropiedad: number;
    descPropiedad: string;
    codMedidaPropiedad: number;
    descMedidaPropiedad: string;
    tipoMedida: number;
    valorTexto: string;
    valorNumero: number;
    valorFecha: string;
    fechaBaja?: Date;
    fechaModificacion?: Date;
}

export class ItemOrdenCompraAtributoDTO implements IItemOrdenCompraAtributoDTO {
    constructor(
        public itemOrdenCompra: Partial<ItemOrdenCompraDTO>,
        public codPropiedad: number,
        public descPropiedad: string,
        public codMedidaPropiedad: number,
        public descMedidaPropiedad: string,
        public tipoMedida: TipoMedida,
        public valorTexto: string,
        public valorNumero: number,
        public valorFecha: string,
        public fechaBaja?: Date,
        public fechaModificacion?: Date
    ) {}
}
