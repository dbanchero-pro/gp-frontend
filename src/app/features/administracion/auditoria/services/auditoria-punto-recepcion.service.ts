import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { PageableModel } from 'src/app/shared/models/common/page/pageable.model';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { getISODate } from 'src/app/shared/utils/functions';
import { IAuditoriaPuntoRecepcionDTO } from '../models/auditoria-punto-recepcion.model';
import { IFiltroAuditoriaPuntoRecepcionDTO } from '../models/filtro-auditoria-punto-recepcion.model';

@Injectable({
    providedIn: 'root',
})
export class AuditoriaPuntoRecepcionService {
    constructor(private readonly restServ: RestService) { }

    getPageable(
        pageable: PageableModel,
        idEntity?: string,
        filtro?: Partial<IFiltroAuditoriaPuntoRecepcionDTO>
    ): Observable<PageModel<IAuditoriaPuntoRecepcionDTO>> {
        let params: HttpParams = this.obtenerParametros(idEntity, filtro);
        return this.restServ.get<PageModel<IAuditoriaPuntoRecepcionDTO>>(
            '/api/v1/auditoria-punto-recepcion?sort=' +
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

    obtenerParametros(
        idEntity?: string,
        filtro?: Partial<IFiltroAuditoriaPuntoRecepcionDTO>
    ) {
        let params: HttpParams = new HttpParams();
        params = params.append(
            'tipoOperacion',
            filtro?.tipoOperacion && filtro?.tipoOperacion !== 'null'
                ? filtro?.tipoOperacion + ''
                : ''
        );
        if (idEntity) {
            params = params.append('idEntidad', idEntity);
        }
        if (filtro?.valorOriginal) {
            params = params.append('valorOriginal', filtro.valorOriginal);
        }
        if (filtro?.fechaDesde) {
            params = params.append('fechaDesde', filtro.fechaDesde instanceof Date ? getISODate(filtro.fechaDesde) : filtro.fechaDesde);
        }
        if (filtro?.fechaHasta) {
            params = params.append('fechaHasta', filtro.fechaHasta instanceof Date ? getISODate(filtro.fechaHasta) : filtro.fechaHasta);
        }
        if (filtro?.idInciso) {
            params = params.append('idInciso', filtro.idInciso);
        }
        if (filtro?.idUE) {
            params = params.append('idUE', filtro.idUE);
        }
        if (filtro?.idUC) {
            params = params.append('idUC', filtro.idUC);
        }
        if (filtro?.nombre) {
            params = params.append('nombre', filtro.nombre);
        }
        if (filtro?.usuario) {
            params = params.append('usuario', filtro.usuario);
        }
        return params;
    }
}
