import { IFiltroOrganismoDTO } from "src/app/shared/models/filtros/filtro-organismo.model";
import { UnidadCompraDTO } from "../../../../shared/models/sice/unidad-compra.model";
import { IZonaDTO } from "./zona.model";
export interface IPuntoRecepcionDTO extends IFiltroOrganismoDTO {
    id: number | null;
    descInciso?: string;
    descUnidadEjecutora?: string;
    descUnidadCompra?: string;
    nombre: string;
    direccion: string;
    latitud?: number;
    longitud?: number;
    zona: IZonaDTO;
    localidad: string;
    fechaBaja?: Date;
    telefonos: string;
    correosElectronicos: string;
    horarios: string;
    observaciones?: string;
    unidadCompra?: UnidadCompraDTO;
    codigoPostal?: number;
}

