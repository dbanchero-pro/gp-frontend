import { IBusquedaItemDTO } from "src/app/shared/models/busqueda-item.model";
import { PageFilterBase } from "src/app/shared/models/common/page/page.model";
import { SortBase } from "src/app/shared/models/common/page/sort.model";

export interface IParametroItemOrdenCompraDTO extends PageFilterBase, SortBase {
    filtro?: Partial<IBusquedaItemDTO> | null;
}