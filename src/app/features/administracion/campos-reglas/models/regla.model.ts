import { TipoRegla } from '../enum/tipo-regla.enum';
import { OperadorRegla } from '../enum/operador-regla.enum';

export interface IReglaDTO {
    id?: number;
    codigo?: string;
    nombre?: string;
    tipoRegla?: TipoRegla;
    operador?: OperadorRegla;
    valor?: any;
    idCampoComparar?: number;
    etiquetaCampoComparar?: string;
    mensajeError?: string;
}

export class ReglaDTO implements IReglaDTO {
    constructor(
        public id?: number,
        public codigo?: string,
        public nombre?: string,
        public tipoRegla?: TipoRegla,
        public operador?: OperadorRegla,
        public valor?: any,
        public idCampoComparar?: number,
        public etiquetaCampoComparar?: string,
        public mensajeError?: string
    ) {}
}
