import { TipoDatoCampo } from "src/app/features/administracion/campos-reglas/enum/tipo-dato-campo.enum";
import { TipoFuenteCampo } from "src/app/features/administracion/campos-reglas/enum/tipo-fuente-campo.enum";
import { IReglaDTO } from "src/app/features/administracion/campos-reglas/models/regla.model";
import { SiNoValor } from "../../enum/si-no-valor.enum";


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
