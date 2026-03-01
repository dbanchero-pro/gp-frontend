import { IArticuloServObraDTO } from './cbso/articulo-serv-obra.model';
import { IColorDTO } from './cbso/color.model';
import { IDetalleVarianteDTO } from './cbso/detalle-variante.model';
import { IFamiliaDTO } from './cbso/familia.model';
import { IMedidaPresentacionDTO } from './cbso/medida-presentacion.model';
import { IMedidaVarianteDTO } from './cbso/medida-variante.model';
import { IPresentacionDTO } from './cbso/presentacion.model';
import { ISubclaseDTO } from './cbso/subclase.model';
import { ISubfamiliaDTO } from './cbso/subfamilia.model';
import { IUnidadMedidaDTO } from './cbso/unidad-medida.model';
import { IClassCbsoDTO } from './class-cbso.model';
import { IProcedimientoCompraDTO } from './procedimiento-compra.model';
import { IZonaEntregaDTO } from './zona-entrega.model';

export interface IItemDTO {
    id?: number;
    procedimientoCompra?: IProcedimientoCompraDTO;
    idPlanificacion?: string;
    familia?: IFamiliaDTO;
    subfamilia?: ISubfamiliaDTO;
    clase?: IClassCbsoDTO;
    subclase?: ISubclaseDTO;
    articuloServObra?: IArticuloServObraDTO;
    medidaVariante?: IMedidaVarianteDTO;
    presentacion?: IPresentacionDTO;
    medidaPresentacion?: IMedidaPresentacionDTO;
    detalleVariante?: IDetalleVarianteDTO;
    color?: IColorDTO;
    unidadMedida?: IUnidadMedidaDTO;
    descNecesidad?: string;
    penalizable?: boolean;
    montoEstimado?: number;
    cantidadTotalEstimada?: number;
    zonaEntrega?: IZonaEntregaDTO;
    descFamilia?: string;
    descSubfamilia?: string;
    descClase?: string;
    descSubclase?: string;
    descArticuloServObra?: string;
    descTipoArticulo?: string;
    descMedidaVariante?: string;
    descUnidadMedidaVariante?: string;
    descPresentacion?: string;
    descMedidaPresentacion?: string;
    descUnidadMedidaPresentacion?: string;
    descDetalleVariante?: string;
    descMarca?: string;
    descColor?: string;
    descUnidadMedida?: string;
    descPropiedadVariante?: string;
    penalizableFechaIngreso?: boolean;
}

export class ItemDTO implements IItemDTO {
    constructor(
        public id?: number,
        public procedimientoCompra?: IProcedimientoCompraDTO,
        public idPlanificacion?: string,
        public familia?: IFamiliaDTO,
        public subfamilia?: ISubfamiliaDTO,
        public clase?: IClassCbsoDTO,
        public subclase?: ISubclaseDTO,
        public articuloServObra?: IArticuloServObraDTO,
        public medidaVariante?: IMedidaVarianteDTO,
        public presentacion?: IPresentacionDTO,
        public medidaPresentacion?: IMedidaPresentacionDTO,
        public detalleVariante?: IDetalleVarianteDTO,
        public color?: IColorDTO,
        public unidadMedida?: IUnidadMedidaDTO,
        public descNecesidad?: string,
        public penalizable?: boolean,
        public montoEstimado?: number,
        public cantidadTotalEstimada?: number,
        public zonaEntrega?: IZonaEntregaDTO,
        public descFamilia?: string,
        public descSubfamilia?: string,
        public descClase?: string,
        public descSubclase?: string,
        public descArticuloServObra?: string,
        public descTipoArticulo?: string,
        public descMedidaVariante?: string,
        public descUnidadMedidaVariante?: string,
        public descPresentacion?: string,
        public descMedidaPresentacion?: string,
        public descUnidadMedidaPresentacion?: string,
        public descDetalleVariante?: string,
        public descMarca?: string,
        public descColor?: string,
        public descUnidadMedida?: string,
        public descPropiedadVariante?: string,
        public penalizableFechaIngreso?: boolean,
    ) {}
}
