import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CompraDTO } from '../models/compra.model';
import { FiltroCompraDTO } from '../models/filtros/filtro-compra.model';
import { RestService } from './common/rest.service';

interface ObtenerParams {
    filtro: Partial<FiltroCompraDTO> | null;
    page: number;
    size: number;
    sort: string;
    order: string;
}

@Injectable({
    providedIn: 'root',
})
export class CompraService {
    constructor(private readonly gcRestService: RestService) {}

    obtenerCompras(parametros: {
        filtro: Partial<FiltroCompraDTO> | null;
        pagina: number;
        tamanoPagina: number;
        sort: string;
        order: string;
    }): Observable<{ contenido: CompraDTO[]; totalElementos: number }> {
        const params = this._buildHttpParams({
            filtro: parametros.filtro,
            page: parametros.pagina,
            size: parametros.tamanoPagina,
            sort: parametros.sort,
            order: parametros.order,
        });

        return this.gcRestService
            .get<any>('/api/gestion-contratos/v1/compra/all', params)
            .pipe(
                map((response) => ({
                    contenido: response.content,
                    totalElementos: response.totalElements,
                })),
            );
    }

    obtenerCompraPorId(idCompra: number): Observable<CompraDTO> {
        return this.gcRestService.get<CompraDTO>(
            `/api/gestion-contratos/v1/compra/${idCompra}`,
        );
    }

    private _buildHttpParams(options: ObtenerParams): HttpParams {
        const filtroMap: { [key in keyof FiltroCompraDTO]?: string } = {
            idInciso: 'idInciso',
            idUnidadEjecutora: 'idUnidadEjecutora',
            idUnidadCompra: 'idUnidadCompra',
            numCompra: 'numeroCompra',
            anioCompra: 'anioCompra',
            nroItem: 'numeroItem',
            codArticulo: 'codArticulo',
            descripcionArticulo: 'descripcionArticulo',
            idTipoCompra: 'tipoCompra',
        };

        const queryParams: { [param: string]: string | number | boolean } = {
            page: options.page,
            size: options.size,
            sort: `${this.mapearColumnaOrdenamiento(options.sort)},${options.order === 'desc' ? 'desc' : 'asc'}`,
        };

        if (options.filtro) {
            for (const key of Object.keys(options.filtro) as Array<
                keyof FiltroCompraDTO
            >) {
                const valor = options.filtro[key];
                if (valor !== undefined && valor !== null && valor !== '') {
                    const paramName = filtroMap[key];
                    if (paramName) {
                        queryParams[paramName] = valor.toString();
                    }
                }
            }
        }

        return new HttpParams({ fromObject: queryParams });
    }

    mapearColumnaOrdenamiento(columna: string): string {
        const mapeo: { [key: string]: string } = {
            idInciso: 'unidadCompra.id.unidadEjecutora.id.inciso.id',
            idUnidadEjecutora:
                'unidadCompra.id.unidadEjecutora.id.idUnidadEjecutora',
            idUnidadCompra: 'unidadCompra.id.idUnidadCompra',
            numeroCompra: 'numCompra',
        };
        return mapeo[columna] || mapeo['idInciso'];
    }
}
