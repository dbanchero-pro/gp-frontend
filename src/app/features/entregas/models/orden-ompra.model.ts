import { EstadoOrdenCompra } from "src/app/shared/enum/estado-orden-compra.enum";
import { CompraDTO } from "src/app/shared/models/compra.model";
import { UnidadCompraDTO } from "src/app/shared/models/sice/unidad-compra.model";
import { ProveedorDTO } from "../../../shared/models/proveedor/proveedor.model";
import { IPuntoRecepcionDTO } from "../../administracion/puntos-recepcion/models/punto-recepcion.model";
import { ItemOrdenCompraDTO } from "./item-orden-compra.model";

export interface IOrdenCompraDTO {
    idOC?: number;
    nroOC: string;
    nroAmpliacionOC?: number;
    items?: ItemOrdenCompraDTO[];
    fechaOC?: Date;
    fechaBaja?: Date;
    fechaModificacion?: Date;
    fechaComprometida?: Date;
    unidadCompra?: UnidadCompraDTO;
    proveedor?: ProveedorDTO;
    puntoRecepcion?: IPuntoRecepcionDTO;
    compra?: CompraDTO;
    plazoEntrega?: string;
    observacion?: string;
    totalItems?: number;
    estadoOC?: EstadoOrdenCompra;
    proximoAVencerse?: boolean;
    puedeAgregarAjusteFecha?: boolean;
    puedeAgregarAjustePuntoRecepcion?: boolean;
    puedeAgregarAjusteAnulacion?: boolean;
}

