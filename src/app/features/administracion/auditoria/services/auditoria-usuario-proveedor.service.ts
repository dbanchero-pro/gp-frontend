import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { PageableModel } from 'src/app/shared/models/common/page/pageable.model';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { getISODate } from 'src/app/shared/utils/functions';
import { IAuditoriaUsuarioProveedorDTO } from '../models/auditoria-usuario-proveedor.model';
import { IFiltroAuditoriaUsuarioProveedorDTO } from '../models/filtro-auditoria-usuario-proveedor.model';

@Injectable({
    providedIn: 'root',
})
export class AuditoriaUsuarioProveedorService {
    constructor(private readonly restServ: RestService) { }

    getPageable(
        pageable: PageableModel,
        idEntity?: string,
        filtro?: Partial<IFiltroAuditoriaUsuarioProveedorDTO>
    ): Observable<PageModel<IAuditoriaUsuarioProveedorDTO>> {
        let params: HttpParams = this.obtenerParametros(idEntity, filtro);
        return this.restServ.get<PageModel<IAuditoriaUsuarioProveedorDTO>>(
            '/api/v1/auditoria-usuario-proveedor?sort=' +
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
        filtro?: Partial<IFiltroAuditoriaUsuarioProveedorDTO>
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
        if (filtro?.tipoUsuario) {
            params = params.append('tipoUsuario', filtro.tipoUsuario);
        }
        params = this.agregarFiltroUsuario(filtro, params);
        params = this.agregarFiltroUsuarioGestionado(filtro, params);
        params = this.agregarFiltroProveedor(filtro, params);
        return params;
    }

    private agregarFiltroProveedor(filtro: Partial<IFiltroAuditoriaUsuarioProveedorDTO> | undefined, params: HttpParams) {
        if (filtro?.paisDocumentoProveedor) {
            params = params.append('paisDocumentoProveedor', filtro.paisDocumentoProveedor);
        }
        if (filtro?.tipoDocumentoProveedor) {
            params = params.append('tipoDocumentoProveedor', filtro.tipoDocumentoProveedor);
        }
        if (filtro?.nroDocumentoProveedor) {
            params = params.append('nroDocumentoProveedor', filtro.nroDocumentoProveedor);
        }
        return params;
    }

    private agregarFiltroUsuarioGestionado(filtro: Partial<IFiltroAuditoriaUsuarioProveedorDTO> | undefined, params: HttpParams) {
        if (filtro?.paisDocumentoGestionado) {
            params = params.append('paisDocumentoGestionado', filtro.paisDocumentoGestionado);
        }
        if (filtro?.tipoDocumentoGestionado) {
            params = params.append('tipoDocumentoGestionado', filtro.tipoDocumentoGestionado);
        }
        if (filtro?.nroDocumentoGestionado) {
            params = params.append('nroDocumentoGestionado', filtro.nroDocumentoGestionado);
        }
        return params;
    }

    private agregarFiltroUsuario(filtro: Partial<IFiltroAuditoriaUsuarioProveedorDTO> | undefined, params: HttpParams) {
        if (filtro?.paisDocumentoUsuario) {
            params = params.append('paisDocumentoUsuario', filtro.paisDocumentoUsuario);
        }
        if (filtro?.tipoDocumentoUsuario) {
            params = params.append('tipoDocumentoUsuario', filtro.tipoDocumentoUsuario);
        }
        if (filtro?.nroDocumentoUsuario) {
            params = params.append('nroDocumentoUsuario', filtro.nroDocumentoUsuario);
        }
        return params;
    }
}
