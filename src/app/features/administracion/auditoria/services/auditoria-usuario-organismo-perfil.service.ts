import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { PageableModel } from 'src/app/shared/models/common/page/pageable.model';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { getISODate } from 'src/app/shared/utils/functions';
import { IAuditoriaUsuarioOrganismoPerfilDTO } from '../models/auditoria-usuario-organismo-perfil.model';
import { IFiltroAuditoriaUsuarioOrganismoPerfil } from '../models/filtro-auditoria-usuario-organismo-perfil.model';

@Injectable({
    providedIn: 'root',
})
export class AuditoriaUsuarioOrganismoPerfilService {
    constructor(private readonly restServ: RestService) { }

    getPageable(
        pageable: PageableModel,
        idEntity?: string,
        filtro?: Partial<IFiltroAuditoriaUsuarioOrganismoPerfil>
    ): Observable<PageModel<IAuditoriaUsuarioOrganismoPerfilDTO>> {
        let params: HttpParams = this.obtenerParametros(idEntity, filtro);
        return this.restServ.get<PageModel<IAuditoriaUsuarioOrganismoPerfilDTO>>(
            '/api/v1/auditoria-usuario-organismo-perfil?sort=' +
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
        filtro?: Partial<IFiltroAuditoriaUsuarioOrganismoPerfil>
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
        if (filtro?.fechaDesde) {
            params = params.append('fechaDesde', filtro.fechaDesde instanceof Date ? getISODate(filtro.fechaDesde) : filtro.fechaDesde);
        }
        if (filtro?.fechaHasta) {
            params = params.append('fechaHasta', filtro.fechaHasta instanceof Date ? getISODate(filtro.fechaHasta) : filtro.fechaHasta);
        }
        params = obtenerParametrosUC(filtro, params);
        if (filtro?.usuario) {
            params = params.append('usuario', filtro.usuario);
        }
        if (filtro?.perfil) {
            params = params.append('perfil', filtro.perfil);
        }
        if (filtro?.nombrePunto) {
            params = params.append('nombrePunto', filtro.nombrePunto);
        }

        params = obtenerParametrosCompra(filtro, params);
        return params;
    }
}
function obtenerParametrosUC(filtro: Partial<IFiltroAuditoriaUsuarioOrganismoPerfil> | undefined, params: HttpParams) {
    if (filtro?.idInciso) {
        params = params.append('idInciso', filtro.idInciso);
    }
    if (filtro?.idUE) {
        params = params.append('idUE', filtro.idUE);
    }
    if (filtro?.idUC) {
        params = params.append('idUC', filtro.idUC);
    }
    return params;
}

function obtenerParametrosCompra(filtro: Partial<IFiltroAuditoriaUsuarioOrganismoPerfil> | undefined, params: HttpParams) {
    if (filtro?.tipoCompra) {
        params = params.append('tipoCompra', filtro.tipoCompra);
    }
    if (filtro?.nroCompra) {
        params = params.append('nroCompra', filtro.nroCompra);
    }
    if (filtro?.nroItem) {
        params = params.append('nroItem', filtro.nroItem);
    }
    if (filtro?.descripcionArticulo) {
        params = params.append('descripcionArticulo', filtro.descripcionArticulo);
    }
    return params;
}

