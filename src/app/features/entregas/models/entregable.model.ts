import { ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { EstadoEntregable } from '../enum/estado-entregable.enum';
import { TipoUnidad } from '../enum/tipo-unidad.enum';
import { ICodigoEntregableDTO } from './codigo-entregable.model';
import { IEntregaDTO } from './entrega.model';

export interface IEntregableDTO extends ICodigoEntregableDTO {
    idEntregable?: number;
    idItem?: number;
    idOc?: number;
    idCompra?: number;
    idVariacion?: number;
    plazoEntrega?: number;
    cantidad?: number;
    fechaComprometida?: string;
    fechaAnulacion?: string;
    fechaModificacion?: string;
    // Campos adicionales para el seguimiento
    itemOrdenCompra?: ItemOrdenCompraDTO;
    estado?: EstadoEntregable;
    fechaEntrega?: string;
    fechaRecepcion?: string;
    fechaConformidad?: string;
    responsables?: string[];
    cantidadAceptada?: number;
    cantidadRechazada?: number;
    motivoRechazo?: string;
    documentos?: ArchivoDTO[];
    entregas?: IEntregaDTO[];
    tipoUnidad?: TipoUnidad;
    cantidadTotalMostrar?: number;
    cantidadPendienteEntrega?: number;
    cantidadPendienteAsignar?: number;
    codEntregable?: string;
    descEntregable?: string;
    tipoUnidadEntregas?: TipoUnidad;
    puedeRecepcionEntregas?: boolean;
    puedeConformidadEntregas?: boolean;
    proximoAVencerse?: boolean;
}
