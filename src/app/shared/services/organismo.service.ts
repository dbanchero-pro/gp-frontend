import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IIncisoDTO } from '../models/sice/inciso.model';
import { UnidadCompraDTO } from '../models/sice/unidad-compra.model';
import { UnidadEjecutoraDTO } from '../models/sice/unidad-ejecutora.model';
import { RestService } from './common/rest.service';

@Injectable({
    providedIn: 'root',
})
export class OrganismoService {
    constructor(private readonly gcRestService: RestService) {}

    obtenerIncisos(
        incluirAdministrativas: boolean,
        idUsuarioSeleccionado?: string,
    ): Observable<IIncisoDTO[]> {
        let param = this.obtenerParametros(
            incluirAdministrativas,
            idUsuarioSeleccionado,
        );
        return this.gcRestService.get<IIncisoDTO[]>(
            '/api/gestion-contratos/v1/incisos/all-sorted' + param,
        );
    }

    obtenerUE(
        id: number,
        incluirAdministrativas: boolean,
        idUsuarioSeleccionado?: string,
    ): Observable<UnidadEjecutoraDTO[]> {
        let param = this.obtenerParametros(
            incluirAdministrativas,
            idUsuarioSeleccionado,
        );
        return this.gcRestService.get<UnidadEjecutoraDTO[]>(
            `/api/gestion-contratos/v1/incisos/${id}/unidades-ejecutoras/all` +
                param,
        );
    }

    obtenerUC(
        id: number,
        idUnidadEjecutora: number,
        incluirAdministrativas: boolean,
        idUsuarioSeleccionado?: string,
    ): Observable<UnidadCompraDTO[]> {
        let param = this.obtenerParametros(
            incluirAdministrativas,
            idUsuarioSeleccionado,
        );
        return this.gcRestService.get<UnidadCompraDTO[]>(
            `/api/gestion-contratos/v1/unidades-ejecutoras/${id}/${idUnidadEjecutora}/unidades-compras/all` +
                param,
        );
    }

    obtenerIncisosOCProveedor(): Observable<IIncisoDTO[]> {
        return this.gcRestService.get<IIncisoDTO[]>(
            '/api/gestion-contratos/v1/incisos/all-incisos-oc-proveedor',
        );
    }

    obtenerUEOCProveedor(incisoId: number): Observable<UnidadEjecutoraDTO[]> {
        return this.gcRestService.get<UnidadEjecutoraDTO[]>(
            `/api/gestion-contratos/v1/incisos/${incisoId}/unidades-ejecutoras/all-oc-proveedor`,
        );
    }

    obtenerUCProveedor(
        incisoId: number,
        unidadEjecutoraId: number,
    ): Observable<UnidadCompraDTO[]> {
        return this.gcRestService.get<UnidadCompraDTO[]>(
            `/api/gestion-contratos/v1/unidades-ejecutoras/${incisoId}/${unidadEjecutoraId}/unidades-compras/all-oc-proveedor`,
        );
    }

    obtenerUCUsuarioOrganismo(
        idUsuario: string,
    ): Observable<UnidadCompraDTO[]> {
        return this.gcRestService.get<UnidadCompraDTO[]>(
            `/api/gestion-contratos/v1/unidades-compra/all?idUsuario=${idUsuario}`,
        );
    }
    obtenerParametros(
        incluirAdministrativas: boolean,
        idUsuarioSeleccionado: string | undefined,
    ): string {
        let param = '';
        if (incluirAdministrativas) {
            param = '?incluirAdministrativas=' + incluirAdministrativas;
        }
        if (param === '') {
            param = '?';
        } else {
            param += '&';
        }
        if (idUsuarioSeleccionado) {
            param += 'idUsuarioSeleccionado=' + idUsuarioSeleccionado;
        }
        return param;
    }
}
