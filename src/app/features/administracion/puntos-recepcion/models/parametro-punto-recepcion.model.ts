import { PageFilterBase } from "../../../../shared/models/common/page/page.model";
import { SortBase } from "../../../../shared/models/common/page/sort.model";
import { IPuntoRecepcionDTO } from "./punto-recepcion.model";
export interface IParametrosPuntoRecepcion extends PageFilterBase, SortBase {
    filtro: Partial<IPuntoRecepcionDTO> | null;
}
