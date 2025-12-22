import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ArchivoDTO, IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { UsuarioOrganismoPerfilDTO } from 'src/app/shared/models/usuario/usuario-organismo-perfil.model';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { IPuntoRecepcionDTO } from '../models/punto-recepcion.model';
import { ZonaDto } from '../models/zona.model';

@Injectable({
    providedIn: 'root',
})
export class PuntosRecepcionService {
    url = '/api/gestion-contratos/v1/puntos-recepcion';

    constructor(private readonly gcRestService: RestService,
                private readonly archivoService: ArchivoService
    ) {}

    obtenerPuntosRecepcion(params: {
        page?: number;
        size?: number;
        sort?: string;
        order?: string;
        idInciso?: number;
        idUnidadEjecutora?: number;
        idUnidadCompra?: number;
        nombre?: string;
        direccion?: string;
        inhabilitados?: boolean;
        idZona?: number;
    }) {
        let httpParams = new HttpParams();

        if (params.page !== undefined)
            httpParams = httpParams.set('page', params.page.toString());
        if (params.size !== undefined)
            httpParams = httpParams.set('size', params.size.toString());
        if (params.sort) {
            const sortValue = params.order
                ? `${params.sort},${params.order}`
                : params.sort;
            httpParams = httpParams.set('sort', sortValue);
        }
        if (params.idInciso !== undefined)
            httpParams = httpParams.set('idInciso', params.idInciso.toString());
        if (params.idUnidadEjecutora !== undefined)
            httpParams = httpParams.set(
                'idUnidadEjecutora',
                params.idUnidadEjecutora.toString()
            );
        if (params.idUnidadCompra !== undefined)
            httpParams = httpParams.set(
                'idUnidadCompra',
                params.idUnidadCompra.toString()
            );
        if (params.nombre) httpParams = httpParams.set('nombre', params.nombre);
        if (params.direccion)
            httpParams = httpParams.set('direccion', params.direccion);
        if (params.inhabilitados !== undefined)
            httpParams = httpParams.set(
                'inhabilitados',
                params.inhabilitados.toString()
            );
        if (params.idZona !== undefined)
            httpParams = httpParams.set('idZona', params.idZona.toString());

        return this.gcRestService.get(this.url + '/all', httpParams);
    }

    obtenerPuntoRecepcion(idPC: number) {
        return this.gcRestService.get(`${this.url}/${idPC}`);
    }

    altaPuntoRecepcion(puntoRecepcion: IPuntoRecepcionDTO) {
        return this.gcRestService.post(this.url, puntoRecepcion);
    }

    modificarPuntoRecepcion(idPC: number, puntoRecepcion: IPuntoRecepcionDTO) {
        return this.gcRestService.put(`${this.url}/${idPC}`, puntoRecepcion);
    }

    inhabilitarPuntoRecepcion(idPC: number) {
        return this.gcRestService.patch(`${this.url}/${idPC}/inhabilitar`);
    }

    habilitarPuntoRecepcion(idPC: number) {
        return this.gcRestService.patch(`${this.url}/${idPC}/habilitar`);
    }

    exportarExcelPuntosRecepcion(filtro: any): void {
        this.gcRestService
            .post<IArchivoDTO, any>(`${this.url}/excel`, filtro)
            .subscribe((res: ArchivoDTO) => this.archivoService.descargar(res));
    }

    obtenerPuntosRecepcionSinPermisoUsuario(
        params: {
            page?: number;
            size?: number;
            sort?: string;
            order?: string;
            idInciso?: number;
            idUnidadEjecutora?: number;
            idUnidadCompra?: number;
            nombrePuntoRecepcion?: string;
            direccion?: string;
            inhabilitados?: boolean;
            idZona?: number;
        },
        idUsuario?: string
    ) {
        let httpParams = new HttpParams();

        if (params.page !== undefined)
            httpParams = httpParams.set('page', params.page.toString());
        if (params.size !== undefined)
            httpParams = httpParams.set('size', params.size.toString());
        if (params.sort) {
            const sortValue = params.order
                ? `${params.sort},${params.order}`
                : params.sort;
            httpParams = httpParams.set('sort', sortValue);
        }
        if (params.idUnidadEjecutora !== undefined)
            httpParams = httpParams.set(
                'idUnidadEjecutora',
                params.idUnidadEjecutora.toString()
            );
        if (params.idInciso !== undefined)
            httpParams = httpParams.set('idInciso', params.idInciso.toString());
        
        if (params.nombrePuntoRecepcion !== undefined)
            httpParams = httpParams.set('nombre', params.nombrePuntoRecepcion);
        
        if (params.idUnidadCompra !== undefined)
            httpParams = httpParams.set(
                'idUnidadCompra',
                params.idUnidadCompra.toString()
            );
        if (params.inhabilitados !== undefined)
            httpParams = httpParams.set(
                'inhabilitados',
                params.inhabilitados.toString()
            );
        if (params.direccion)
            httpParams = httpParams.set('direccion', params.direccion);
        if (params.idZona !== undefined)
            httpParams = httpParams.set('idZona', params.idZona.toString());
        if (idUsuario !== undefined)
            httpParams = httpParams.set('idUsuario', idUsuario);

        return this.gcRestService.get(
            this.url + '/all-sin-permiso-usuario',
            httpParams
        );
    }

    obtenerZonasPorOrdenCompra(idOC: number) {
        const params = new HttpParams().set('idOC', idOC.toString());
        return this.gcRestService.get<ZonaDto[]>(`${this.url}/obtener-zonas-puntos-uc-orden-compra`, params);
    }

    obtenerPuntosPorOrdenCompraYZona(idOC: number, idZona: number) {
        const params = new HttpParams()
            .set('idOC', idOC.toString())
            .set('idZona', idZona.toString());
        return this.gcRestService.get<IPuntoRecepcionDTO[]>(`${this.url}/obtener-puntos-uc-orden-compra-zona`, params);
    }

    obtenerResponsablesPuntoRecepcion(idPC: number, page: number = 0, size: number = 10, sort: string = 'usuarioOrganismo.usuario.nroDocumento,asc') {
        const params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString())
            .set('sort', sort);
            
        return this.gcRestService.get<PageModel<UsuarioOrganismoPerfilDTO>>(`${this.url}/${idPC}/responsables`, params);
    }
}
