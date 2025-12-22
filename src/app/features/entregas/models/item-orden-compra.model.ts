import { EstadoItemOrdenCompra } from "../enum/estado-item-orden-compra";
import { TipoArticuloServObra } from "../enum/tipo-articulo-serv-obra";
import { TipoCantidad } from "../enum/tipo-cantidad.enum";
import { TipoUnidad } from "../enum/tipo-unidad.enum";
import { IOrdenCompraDTO } from "./orden-ompra.model";
import { SiceEntregableDTO } from "./sice-entregable";

export interface IItemOrdenCompraDTO {
    id?: any;
    idOC?: number;
    idCompra?: number;
    idItem?: number;
    idVariacion?: number;
    codArticulo?: number;
    descArticulo?: string;
    descUnidadMedida?: string;
    codUnidadMedida?: number;
    nroItem?: number;
    plazoEntrega?: number;
    fechaComprometida?: Date;
    fechaBaja?: Date;
    fechaModificacion?: Date;
    entregables?: SiceEntregableDTO[];
    proximoAVencerse?: boolean;
    estadoItem?: EstadoItemOrdenCompra;
    tipoArticulo?: TipoArticuloServObra;
    cantidad?: number;
    cantidadTotal?: number;
    cantidadTotalMostrar?: number;
    cantidadPendienteAsignar?: number | null;
    cantidadPendienteEntrega?: number;
    cantidadPendienteRecepcion?: number;
    cantidadPendienteConformidad?: number;
    cantidadTotalPendienteRecepcion?: number | null;
    cantidadTotalPendienteConformidad?: number | null;
    idItemCompra?: number;
    precioEstimado?: number;
    precioTotal?: number;
    porcImp?: number;
    fechaEntrega?: Date;
    tipoUnidad?: TipoUnidad;
    tipoCantidad?: TipoCantidad;
    tieneCaracteristicas?: boolean;
    puedeRecepcionEntregas?: boolean;
    puedeConformidadEntregas?: boolean;
    puedeAgregarAjusteFecha?: boolean;
    puedeAgregarAjusteCantidad?: boolean;
    puedeAgregarAjusteAnulacion?: boolean;
    seleccionado?: boolean;
    ordenCompra?: IOrdenCompraDTO,
    tieneAjustesBloqueantes?: boolean
};

export class ItemOrdenCompraDTO implements IItemOrdenCompraDTO {
    constructor(
        public idOC?: number,
        public idCompra?: number,
        public idItem?: number,
        public idVariacion?: number,
        public codArticulo?: number,
        public descArticulo?: string,
        public descUnidadMedida?: string,
        public codUnidadMedida?: number,
        public nroItem?: number,
        public plazoEntrega?: number,
        public fechaComprometida?: Date,
        public fechaBaja?: Date,
        public fechaModificacion?: Date,
        public entregables?: SiceEntregableDTO[],
        public proximoAVencerse?: boolean,
        public estadoItem?: EstadoItemOrdenCompra,
        public tipoArticulo?: TipoArticuloServObra,
        public idItemCompra?: number,
        public precioEstimado?: number,
        public precioTotal?: number,
        public fechaEntrega?: Date,
        public tipoUnidad?: TipoUnidad,
        public tipoCantidad?: TipoCantidad,
        public cantidad?: number,
        public cantidadTotal?: number,
        public cantidadTotalMostrar?: number,
        public cantidadPendienteEntrega?: number,
        public cantidadPendienteRecepcion?: number,
        public cantidadPendienteConformidad?: number,
        public cantidadPendienteAsignar?: number | null,
        public cantidadTotalPendienteRecepcion?: number | null,
        public cantidadTotalPendienteConformidad?: number | null,
        public tieneCaracteristicas?: boolean,
        public puedeRecepcionEntregas?: boolean,
        public puedeConformidadEntregas?: boolean,
        public puedeAgregarAjusteFecha?: boolean,
        public puedeAgregarAjusteCantidad?: boolean,
        public puedeAgregarAjusteAnulacion?: boolean,
        public seleccionado?: boolean,
        public ordenCompra?: IOrdenCompraDTO,
        public tieneAjustesBloqueantes?: boolean
    ) { }
}


