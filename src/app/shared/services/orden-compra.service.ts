import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IFiltroOrdenCompra } from 'src/app/features/entregas/models/filtros/filtro-seguimiento-entrega.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { TipoUsuario } from '../enum/tipo-usuario.enum';
import { ArchivoDTO, IArchivoDTO } from '../models/common/archivo.model';
import { PageModel } from '../models/common/page/page.model';
import { ArchivoService } from './common/archivo.service';
import { RestService } from './common/rest.service';
import { SeguridadService } from './common/seguridad.service';

@Injectable({ providedIn: 'root' })
export class OrdenCompraService {

    private readonly url = '/api/gestion-contratos/v1/ordenes-compra';

    constructor(private readonly gcRest: RestService,
        private readonly archivoService: ArchivoService,
        private readonly seguridad: SeguridadService
    ) { }

    usuarioLogueadoTienePermisosRecepcion(idOC: number | undefined): Observable<boolean> {
        if (this.seguridad.tieneAlgunPermiso(['GC_GESTION_RECEP.ALTA', 'GC_GESTION_RECEP.MODIFICACION',
           'GC_GESTION_RECEP.BAJA'])) {
            return this.gcRest.get<boolean>(`${this.url}/${idOC}/usuario-logueado-tiene-permisos-recepcion`);
        } else {
            return of(false);
        }
    }


    buscarOrganismo(params: {
        filtro: Partial<IFiltroOrdenCompra> | null;
        pagina: number;
        tamanoPagina: number;
        sort: string;
        order: 'asc' | 'desc';
    }): Observable<PageModel<IOrdenCompraDTO>> {

        let httpParams = this.paramBase(params);
        httpParams = httpParams.set(
            'sort',
            `${params.sort},${params.order}`
        );

        const f = params.filtro;
        if (f) {
            httpParams = this.setSiNoEsNull(httpParams, 'idInciso', f.idInciso);
            httpParams = this.setSiNoEsNull(httpParams, 'idUnidadEjecutora', f.idUnidadEjecutora);
            httpParams = this.setSiNoEsNull(httpParams, 'idUnidadCompra', f.idUnidadCompra);
            httpParams = this.setSiNoEsNull(httpParams, 'idIncisoOC', f.idIncisoOc);
            httpParams = this.setSiNoEsNull(httpParams, 'idUnidadEjecutoraOC', f.idUnidadEjecutoraOc);
            httpParams = this.setSiNoEsNull(httpParams, 'idUnidadCompraOC', f.idUnidadCompraOc);
            httpParams = this.setSiNoEsNull(httpParams, 'nroOc', f.nroOC);
            httpParams = this.setSiNoEsNull(httpParams, 'tipoCompra', f.tipoCompra);
            httpParams = this.setSiNoEsNull(httpParams, 'numCompra', f.numCompra);
            httpParams = this.setSiNoEsNull(httpParams, 'anioCompra', f.anioCompra);
            httpParams = this.setSiNoEsNull(httpParams, 'idZona', f.idZona);
            httpParams = this.setSiNoEsNull(httpParams, 'soloOCAjustesPendientes', f.soloOCAjustesPendientes);
            httpParams = this.setSiNoEsNull(httpParams, 'idPais', f.idPais);
            httpParams = this.setSiNoEsNull(httpParams, 'idTipoDocumento', f.idTipoDocumento);
            httpParams = this.setSiNoEsNull(httpParams, 'nroDocumento', f.nroDocumento);
            httpParams = this.setSiNoEsNull(httpParams, 'estadoOrdenCompra', f.estadoOrdenCompra ? String(f.estadoOrdenCompra).toUpperCase() : undefined);
            httpParams = this.setSiNoEsNull(httpParams, 'fechaDesde', f.fechaDesde ? f.fechaDesde.toISOString().split('T')[0] : undefined);
            httpParams = this.setSiNoEsNull(httpParams, 'fechaHasta', f.fechaHasta ? f.fechaHasta.toISOString().split('T')[0] : undefined);
        }

        return this.gcRest.get<PageModel<IOrdenCompraDTO>>(
            `${this.url}/all-organismo`,
            httpParams
        );
    }

    buscarProveedor(params: {
        filtro: Partial<IFiltroOrdenCompra> | null;
        pagina: number;
        tamanoPagina: number;
        sort: string;
        order: 'asc' | 'desc';
    }): Observable<PageModel<IOrdenCompraDTO>> {

        let httpParams = this.paramBase(params);
        httpParams = httpParams.set(
            'sort',
            `${params.sort},${params.order}`
        );

        const f = params.filtro;
        if (f) {
            httpParams = this.setSiNoEsNull(httpParams, 'idPais', f.proveedor?.paisDocumento?.id ?? f.idPais);
            httpParams = this.setSiNoEsNull(httpParams, 'idTipoDocumento', f.proveedor?.tipoDocumento ?? f.idTipoDocumento);
            httpParams = this.setSiNoEsNull(httpParams, 'nroDocumento', f.proveedor?.nroDocumento ?? f.nroDocumento);
            httpParams = this.setSiNoEsNull(httpParams, 'nroOc', f.nroOC);
            httpParams = this.setSiNoEsNull(httpParams, 'idZona', f.idZona);
            httpParams = this.setSiNoEsNull(httpParams, 'soloOCAjustesPendientes', f.soloOCAjustesPendientes);
            httpParams = this.setSiNoEsNull(httpParams, 'estadoOrdenCompra', f.estadoOrdenCompra ? String(f.estadoOrdenCompra).toUpperCase() : undefined);
            httpParams = this.setSiNoEsNull(httpParams, 'idIncisoOC', f.idIncisoOc);
            httpParams = this.setSiNoEsNull(httpParams, 'idUnidadEjecutoraOC', f.idUnidadEjecutoraOc);
            httpParams = this.setSiNoEsNull(httpParams, 'idUnidadCompraOC', f.idUnidadCompraOc);
            httpParams = this.setSiNoEsNull(httpParams, 'fechaDesde', f.fechaDesde ? f.fechaDesde.toISOString().split('T')[0] : undefined);
            httpParams = this.setSiNoEsNull(httpParams, 'fechaHasta', f.fechaHasta ? f.fechaHasta.toISOString().split('T')[0] : undefined);
        }

        return this.gcRest.get<PageModel<IOrdenCompraDTO>>(
            `${this.url}/all-proveedor`,
            httpParams
        );
    }

    exportarExcelProveedor(parms: any) 
    : void {
        this.excel(parms, 'excel-proveedor');
    }

    exportarExcelOrganismo(parms: any 
    ): void {
        this.excel(parms, 'excel-organismo');
    }

    excel(params: any, metodo: string): void {
      //Convierte el estadoOrdenCompra a mayúsculas antes de enviarlo
        let filtroAux= params.filtro;
        filtroAux.estadoOrdenCompra = filtroAux.estadoOrdenCompra?.toUpperCase();
         this.gcRest.post<IArchivoDTO, any>(
            `${this.url}/${metodo}`,
            filtroAux
        ).subscribe((res: ArchivoDTO) => this.archivoService.descargar(res));
    
    }

    obtenerPorId(idOC: number, tipoUsuario?: TipoUsuario): Observable<IOrdenCompraDTO> {
        let url = `${this.url}/${idOC}`
        if (tipoUsuario) {
            url = `${this.url}/${idOC}?tipoUsuario=${tipoUsuario===TipoUsuario.PROVEEDOR?'PROVEEDOR':'ORGANISMO'}`
        }
        return this.gcRest.get<IOrdenCompraDTO>(url);
    }

    obtenerPorNroOC(idIncisoCompra: number, idUECompra: number, idUCCompra: number, anioCompra: number,
        nroCompra: number, nroOC: number): Observable<IOrdenCompraDTO> {
        return this.gcRest.get<IOrdenCompraDTO>(`${this.url}/por-nro-oc/${idIncisoCompra}/${idUECompra}/${idUCCompra}/${anioCompra}/${nroCompra}/${nroOC}`);
    }


    private paramBase(p: { pagina: number; tamanoPagina: number }): HttpParams {
        return new HttpParams()
            .set('page', p.pagina.toString())
            .set('size', p.tamanoPagina.toString());
    }


    private setSiNoEsNull(
        params: HttpParams,
        key: string,
        value: string | number | boolean | undefined | null
    ): HttpParams {
        return value === undefined || value === null
            ? params
            : params.set(key, value.toString());
    }
}
