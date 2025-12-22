import { IPropiedadDTO } from "../propiedad.model";
import { ISubclaseControlDTO } from "./cbso.model";
import { IUnidadMedidaDTO } from "./unidad-medida.model";

export interface IArticuloServObraDTO {
    id?: number;
    descArticuloServObra?: string;
    propiedadVariante?: IPropiedadDTO;
    unidadMedidaVariante?: IUnidadMedidaDTO;
    tipoArticulo?: string;
    subclase?: ISubclaseControlDTO;
}

export class ArticuloServObraDTO implements IArticuloServObraDTO {
    constructor(
        public id?: number,
        public descArticuloServObra?: string,
        public propiedadVariante?: IPropiedadDTO,
        public unidadMedidaVariante?: IUnidadMedidaDTO,
        public tipoArticulo?: string,
        public subclase?: ISubclaseControlDTO) {
    }
}
