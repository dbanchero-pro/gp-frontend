import { IFiltroOrganismoDTO } from "../../../../shared/models/filtros/filtro-organismo.model";


export interface IFiltroPuntoRecepcionDTO extends IFiltroOrganismoDTO {
    idZona?: number;
    inhabilitados: boolean;
}
