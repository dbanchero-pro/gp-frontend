import { TipoPerfil } from "src/app/shared/enum/tipo-perfil.enum";

export interface IFiltroAuditoriaUsuarioOrganismoPerfil {
    tipoOperacion?: string;
    perfil?: TipoPerfil;
    item?: string;
    usuario?: string;
    fechaDesde?: Date | string;
    fechaHasta?: Date | string;
    idInciso?: number;
    idUE?: number;
    idUC?: number;
    tipoCompra?: string;
    nroCompra?: number;
    anioCompra?: number;
    nroItem?: number;
    descripcionArticulo?: string;
    nombrePunto?: string;
}