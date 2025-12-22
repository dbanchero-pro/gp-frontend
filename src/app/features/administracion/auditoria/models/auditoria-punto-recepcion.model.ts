import { AuditoriaTipoABMEnum } from 'src/app/shared/enum/auditoria-tipo-abm.enum';
import { IUnidadCompraDTO, UnidadCompraDTO } from 'src/app/shared/models/sice/unidad-compra.model';


export interface IAuditoriaPuntoRecepcionDTO {
    idEntidad: number;
    fechaOperacion: string;
    tipoOperacion: AuditoriaTipoABMEnum;
    campo: string;
    valorOriginal: string;
    valorFinal: string;
    usuario: string;
    unidadCompra: UnidadCompraDTO;
    nombre: string;
}

export interface IAuditoriaPuntoRecepcion {
    fechaOperacion: string;
    unidadCompra: IUnidadCompraDTO;
    nombrePunto: string;
    tipoOperacion: string;
    usuario: string;
}

export class AuditoriaPuntoRecepcionDTO implements IAuditoriaPuntoRecepcionDTO {
    constructor(
        public idEntidad: number,
        public fechaOperacion: string,
        public tipoOperacion: AuditoriaTipoABMEnum,
        public campo: string,
        public valorOriginal: string,
        public valorFinal: string,
        public usuario: string,
        public unidadCompra: UnidadCompraDTO,
        public nombre: string
    ) { }
}
