import { EstadoOrdenCompra } from 'src/app/shared/enum/estado-orden-compra.enum';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';

export interface IFiltroOrdenCompra {
    nroOC?: string;
    estadoOrdenCompra?: EstadoOrdenCompra;
    idZona?: number;
    idPais?: string;
    idTipoDocumento?: string;
    nroDocumento?: string;
    proveedor?: ProveedorDTO;
    idIncisoOc?: number;
    idUnidadEjecutoraOc?: number;
    idUnidadCompraOc?: number;
    idInciso?: number;
    idUnidadEjecutora?: number;
    idUnidadCompra?: number;
    tipoCompra?: string;
    numCompra?: number;
    anioCompra?: number;
    fechaDesde?: Date;
    fechaHasta?: Date;
    soloOCAjustesPendientes?: boolean;
}

export interface IFiltroSeguimientoEntrega extends IFiltroOrdenCompra {}
