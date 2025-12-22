import { EstadoEntregable } from '../../enum/estado-entregable.enum';

export interface IFiltroEntregable {
    estado?: EstadoEntregable;
    entregable?: string;
}
