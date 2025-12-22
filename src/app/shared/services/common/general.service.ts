import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CompraDTO } from '../../models/compra.model';
import { SubtipoCompraDTO } from '../../models/sice/subtipo-compra.model';
import { TipoCompraDTO } from '../../models/sice/tipo-compra.model';
import { RestService } from './rest.service';
@Injectable({
    providedIn: 'root',
})
export class GeneralService {
    public tiposCompras$: BehaviorSubject<TipoCompraDTO[]> =
        new BehaviorSubject<TipoCompraDTO[]>([]);
    public subtiposCompras$: BehaviorSubject<SubtipoCompraDTO[]> =
        new BehaviorSubject<SubtipoCompraDTO[]>([]);
    constructor(
        private readonly gcRestService: RestService,
        private readonly location: Location
    ) { }

    volver() {
        this.location.back();
    }
    getTiposCompra(): Observable<TipoCompraDTO[]> {
        return this.gcRestService.get<TipoCompraDTO[]>(
            '/api/restricciones/v1/tipos-compras/todos'
        );
    }

    getCompra(): Observable<CompraDTO> {
        return this.gcRestService.get<CompraDTO>(
            '/api/gestion-compra/v1/compras/{id}'
        );
    }

    getTiposCompraSinRelacionar(): Observable<TipoCompraDTO[]> {
        return this.gcRestService.get<TipoCompraDTO[]>(
            '/api/restricciones/v1/tipos-compras/todos-sin-relacionar'
        );
    }

    getSubTipoCompra(
        tipo: string,
        subtipo: string
    ): Observable<SubtipoCompraDTO> {
        return this.gcRestService.get<SubtipoCompraDTO>(
            '/api/restricciones/v1/subtipos-compras/' + tipo + '/' + subtipo
        );
    }

    getSubTiposCompraPorTipoCompra(id: string): Observable<SubtipoCompraDTO[]> {
        return this.gcRestService.get<SubtipoCompraDTO[]>(
            '/api/restricciones/v1/tipos-compras/' +
            id +
            '/subtipos-compras/todos'
        );
    }

    getSubTiposCompraPorTipoCompraSinRelacionar(
        id: string
    ): Observable<SubtipoCompraDTO[]> {
        return this.gcRestService.get<SubtipoCompraDTO[]>(
            '/api/restricciones/v1/tipos-compras/' +
            id +
            '/subtipos-compras/todos-sin-relacionar'
        );
    }

    getTiposCompraRelacionar(
        idTipoCompraRelacionar: string,
        idSubtipoCompraRelacionar: string
    ): Observable<TipoCompraDTO[]> {
        return this.gcRestService.get<TipoCompraDTO[]>(
            `/api/restricciones/v1/tipos-compras/relacionar/${idTipoCompraRelacionar}/${idSubtipoCompraRelacionar}`
        );
    }

    getSubTiposCompraRelacionar(
        idTipoCompraRelacionar: string,
        idSubtipoCompraRelacionar: string,
        idTipoCompra: string
    ): Observable<SubtipoCompraDTO[]> {
        return this.gcRestService.get<SubtipoCompraDTO[]>(
            `/api/restricciones/v1/subtipos-compras/relacionar/${idTipoCompraRelacionar}/${idSubtipoCompraRelacionar}/${idTipoCompra}`
        );
    }

    getTiposCompraRelacionarNomina(
        idNomina: number,
        idTipoCompraRelacionar: string,
        idSubtipoCompraRelacionar: string
    ): Observable<TipoCompraDTO[]> {
        return this.gcRestService.get<TipoCompraDTO[]>(
            `/api/restricciones/v1/tipos-compras/relacionar/${idNomina}/${idTipoCompraRelacionar}/${idSubtipoCompraRelacionar}`
        );
    }

    getSubTiposCompraRelacionarNomina(
        idNomina: number,
        idTipoCompraRelacionar: string,
        idSubtipoCompraRelacionar: string,
        idTipoCompra: string
    ): Observable<SubtipoCompraDTO[]> {
        return this.gcRestService.get<SubtipoCompraDTO[]>(
            `/api/restricciones/v1/subtipos-compras/relacionar/${idNomina}/${idTipoCompraRelacionar}/${idSubtipoCompraRelacionar}/${idTipoCompra}`
        );
    }
}
