
import { EstadoEntrega } from "../../enum/estado-entrega.enum";
import { IEntregableDTO } from "../entregable.model";

export interface IFiltroEntregaEntregable {
    estadoServicioObra?: EstadoEntrega;
    estadoBienes?: EstadoEntrega;
    entregable?: IEntregableDTO
}
