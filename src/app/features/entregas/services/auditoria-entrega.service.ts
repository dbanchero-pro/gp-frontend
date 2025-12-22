import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { PageableModel } from 'src/app/shared/models/common/page/pageable.model';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { getISODate } from 'src/app/shared/utils/functions';
import { IAuditoriaEntregaDTO } from '../models/auditoria-entrega.model';
import { IFiltroAuditoriaEntregaAjusteDTO } from '../models/filtros/filtro-auditoria-entrega-ajuste.model';

@Injectable({
    providedIn: 'root',
})
export class AuditoriaEntregaService {
    constructor(private readonly restServ: RestService) { }

    getPageable(
        pageable: PageableModel,
        filtro?: Partial<IFiltroAuditoriaEntregaAjusteDTO>
    ): Observable<PageModel<IAuditoriaEntregaDTO>> {
        let params: HttpParams = this.obtenerParametros(filtro);
        return this.restServ.get<PageModel<IAuditoriaEntregaDTO>>(
            '/api/v1/auditoria-entrega?sort=' +
            pageable.sort +
            ',' +
            pageable.order +
            '&page=' +
            pageable.pageNumber +
            '&size=' +
            pageable.pageSize +
            '&' +
            params
        );
    }

    
     obtenerParametros(filtro?: Partial<IFiltroAuditoriaEntregaAjusteDTO>) {
        let params: HttpParams = new HttpParams();
        params = params.append(
            'tipoOperacion',
            filtro?.tipoOperacion && filtro?.tipoOperacion !== 'null'
                ? filtro?.tipoOperacion + ''
                : ''
        );
        if (filtro?.tipoUsuario) {
            params = params.append('tipoUsuario', filtro.tipoUsuario);
        }
        if (filtro?.fechaDesde) {
            params = params.append('fechaDesde', filtro.fechaDesde instanceof Date ? getISODate(filtro.fechaDesde) : filtro.fechaDesde);
        }
        if (filtro?.fechaHasta) {
            params = params.append('fechaHasta', filtro.fechaHasta instanceof Date ? getISODate(filtro.fechaHasta) : filtro.fechaHasta);
        }
        
        if (filtro?.idEntidad) {
            params = params.append('idEntidad', filtro.idEntidad);

        }
        params = this.obtenerParametrosOC(params, filtro);
        params = this.obtenerParametrosCompra(params, filtro);
        params = this.obtenerParametrosItem(params, filtro);
        return params;
    }

    obtenerParametrosItem(params: HttpParams,filtro?: Partial<IFiltroAuditoriaEntregaAjusteDTO>): HttpParams {
        
        if (filtro?.nroItem) {
            params = params.append('nroItem', filtro.nroItem);
        }
        if (filtro?.descArticulo) {
            params = params.append('descArticulo', filtro.descArticulo);
        }
        return params;
    }

     obtenerParametrosOC(params: HttpParams,filtro?: Partial<IFiltroAuditoriaEntregaAjusteDTO>): HttpParams {
        
       
        if (filtro?.nroOC) {
            params = params.append('nroOC', filtro.nroOC);
        }
        return params;
    }
    
     obtenerParametrosCompra(params: HttpParams,filtro?: Partial<IFiltroAuditoriaEntregaAjusteDTO>): HttpParams {
        
        if (filtro?.idIncisoCompra) {
            params = params.append('idIncisoCompra', filtro.idIncisoCompra);
        }
        if (filtro?.idUECompra) {
            params = params.append('idUECompra', filtro.idUECompra);
        }
        if (filtro?.idUCCompra) {
            params = params.append('idUCCompra', filtro.idUCCompra);
        }
        if (filtro?.anioCompra) {
            params = params.append('anioCompra', filtro.anioCompra);
        }
        if (filtro?.numCompra) {
            params = params.append('numCompra', filtro.numCompra);
        }
        return params;
    }

}
