import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageModel } from '../models/common/page/page.model';
import { CompraDTO } from '../models/compra.model';
import { FiltroCompraDTO } from '../models/filtros/filtro-compra.model';
import { ItemCompraDto } from '../models/item-compra.model';
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
export class CompraSiceService {

    constructor(private readonly gcRestService: RestService) { }

    obtenerCompras(parametros: ObtenerParams): Observable<PageModel<CompraDTO>> {
        const params = this._buildHttpParams(parametros);


        return this.gcRestService.get<PageModel<CompraDTO>>(
            '/api/gestion-contratos/v1/compra-sice/all',
            params
        );
    }


    obtenerItemsCompra(parametros: ObtenerParams): Observable<PageModel<ItemCompraDto>> {
        const params = this._buildHttpParams(parametros);
      
        return this.gcRestService.get<PageModel<ItemCompraDto>>(
            '/api/gestion-contratos/v1/compra-sice/item/all',
            params
        );
    }

    obtenerListaItemsCompra(parametros: FiltroCompraDTO): Observable<ItemCompraDto[]> {
        const params = this._buildHttpParamsDesdeFiltro(parametros);
        return this.gcRestService.get<ItemCompraDto[]>(
            '/api/gestion-contratos/v1/compra-sice/item/all-unpaged',
            params
        );
    }

    obtenerCompraPorId(idCompra: number): Observable<CompraDTO> {
        return this.gcRestService.get<CompraDTO>(
            `/api/gestion-contratos/v1/compra-sice/${idCompra}`
        );
    }

    private _buildHttpParamsDesdeFiltro(filtro: Partial<FiltroCompraDTO>): HttpParams {
        const filtroMap: { [key in keyof FiltroCompraDTO]?: string } = {
            idInciso: 'idInciso',
            idUnidadEjecutora: 'idUnidadEjecutora',
            idUnidadCompra: 'idUnidadCompra',
            numCompra: 'numeroCompra',
            anioCompra: 'anioCompra',
            idTipoCompra: 'idTipoCompra',
            idCompra: 'idCompra',
            idUsuario: 'idUsuario',
        };
        const queryParams: { [param: string]: string | number | boolean } = {};
        if (filtro) {
            for (const key of Object.keys(filtro) as Array<keyof FiltroCompraDTO>) {
                const valor = filtro[key];
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
            idTipoCompra: 'idTipoCompra',
            idCompra: 'idCompra',
            idUsuario: 'idUsuario',
        };

        const queryParams: { [param: string]: string | number | boolean } = {
            page: options.page,
            size: options.size,
            sort: `${this.mapearColumnaOrdenamiento(options.sort)},${options.order === 'desc' ? 'desc' : 'asc'}`
        };

        if (options.filtro) {
            for (const key of Object.keys(options.filtro) as Array<keyof FiltroCompraDTO>) {
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


    private mapearColumnaOrdenamiento(columna: string): string {
        const mapeo: { [key: string]: string } = {
            'idInciso': 'unidadCompra.idInciso',
            'idUnidadEjecutora': 'unidadCompra.idUnidadEjecutora',
            'idUnidadCompra': 'unidadCompra.idUnidadCompra',
            'numeroCompra': 'numCompra',
            'nroItem': 'nroItem',
            'descArticulo': 'descArticulo',
            'tipoCompra': 'tipoCompra.id'
        };
        return mapeo[columna] || columna;
    }
}