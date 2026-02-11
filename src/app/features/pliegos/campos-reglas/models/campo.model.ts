import { TipoFuenteCampo } from '../enum/tipo-fuente-campo.enum';
import { TipoDatoCampo } from '../enum/tipo-dato-campo.enum';
import { SiNoValor } from '../../../../shared/enum/si-no-valor.enum';
import { IReglaDTO } from './regla.model';

export interface ICampoDTO {
    id?: number;
    etiqueta?: string;
    descripcion?: string;
    fuente?: TipoFuenteCampo;
    tipoDato?: TipoDatoCampo;
    sePuedeEliminar?: SiNoValor;
    reglas?: IReglaDTO[];
    fechaCreacion?: Date;
    fechaModificacion?: Date;
    activo?: boolean;
}

export class CampoDTO implements ICampoDTO {
    constructor(
        public id?: number,
        public etiqueta?: string,
        public descripcion?: string,
        public fuente?: TipoFuenteCampo,
        public tipoDato?: TipoDatoCampo,
        public sePuedeEliminar?: SiNoValor,
        public reglas?: IReglaDTO[],
        public fechaCreacion?: Date,
        public fechaModificacion?: Date,
        public activo: boolean = true
    ) {}
}
