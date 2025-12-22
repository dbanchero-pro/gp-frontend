import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { PageableModel } from 'src/app/shared/models/common/page/pageable.model';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { IAuditoriaAjusteDTO } from '../models/auditoria-ajuste.model';
import { IFiltroAuditoriaEntregaAjusteDTO } from '../models/filtros/filtro-auditoria-entrega-ajuste.model';
import { AuditoriaEntregaService } from './auditoria-entrega.service';

@Injectable({
    providedIn: 'root',
})
export class AuditoriaAjusteService {
    constructor(private readonly restServ: RestService, private readonly auditoriaEntregaService: AuditoriaEntregaService) { }

    getPageable(
        pageable: PageableModel,
        filtro?: Partial<IFiltroAuditoriaEntregaAjusteDTO>
    ): Observable<PageModel<IAuditoriaAjusteDTO>> {
        let params: HttpParams = this.auditoriaEntregaService.obtenerParametros(filtro);
        return this.restServ.get<PageModel<IAuditoriaAjusteDTO>>(
            '/api/v1/auditoria-ajuste?sort=' +
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

}
