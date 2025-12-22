export interface IReporteDTO {
    id?: number;
    nombre?: string;
    mimeType?: string;
    contenido?: string;
    tipoReporte?: string;
}


export class ReporteDTO implements IReporteDTO {
    constructor(public id?: number, public nombre?: string, public mimeType?: string, public contenido?: string, public tipoReporte?: string) {
    }
}