
export interface IFiltroAuditoriaPuntoRecepcionDTO {
    valorOriginal?: string;
    tipoOperacion?: string;
    fechaDesde?: Date | string;
    fechaHasta?: Date | string;
    idInciso?: number;
    idUE?: number;
    idUC?: number;
    nombre: string;
    usuario: string;
}