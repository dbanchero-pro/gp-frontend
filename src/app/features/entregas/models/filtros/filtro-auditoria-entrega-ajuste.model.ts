import { TipoUsuario } from "src/app/shared/enum/tipo-usuario.enum";

export interface IFiltroAuditoriaEntregaAjusteDTO {
    tipoOperacion?: string;
    fechaDesde?: Date | string;
    fechaHasta?: Date | string;
    nroOC?: number;
    idIncisoCompra?: number;
    idUECompra?: number;
    idUCCompra?: number;
    anioCompra?: number;
    numCompra?: number;
    idEntidad?: number;
    nroItem?: number;
    descArticulo?: string;
    tipoUsuario?: TipoUsuario;

}