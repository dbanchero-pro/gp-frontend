import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoBusqueda } from '../enum/tipo-busqueda-item.enum';
import { ItemCompraFiltroDTO } from '../models/item-compra-filtro.model';
import { ItemCompraDto } from '../models/item-compra.model';
import { RestService } from './common/rest.service';
@Injectable({
    providedIn: 'root',
})
export class ItemsCompraService {
    url = '/api/gestion-contratos/v1/items-compra';
    constructor(private readonly gcRestService: RestService) {}

    modificar(
        idCompra: number,
        idItem: number,
        data: Partial<ItemCompraDto>,
    ): Observable<ItemCompraDto> {
        return this.gcRestService.put(
            `${this.url}/${idCompra}/${idItem}`,
            data,
        );
    }

    eliminar(idCompra: number, idItem: number): Observable<void> {
        return this.gcRestService.delete(
            `${this.url}/eliminar/${idCompra}/${idItem}`,
        );
    }

    obtenerItemsPorId(
        idCompra: number,
        idItem: number,
    ): Observable<ItemCompraDto> {
        return this.gcRestService.get<ItemCompraDto>(
            `${this.url}/${idCompra}/${idItem}`,
        );
    }

    copiar(idCompra: number, idItem: number): Observable<void> {
        return this.gcRestService.put(
            `${this.url}/copiarItem/${idCompra}/${idItem}`,
            null,
        );
    }

    buscarPorArticulo(
        idCompra: number,
        texto: string,
        tipoBusqueda: TipoBusqueda,
    ): Observable<ItemCompraFiltroDTO[]> {
        let filtro = 'filtrar-articulos';
        if (tipoBusqueda === TipoBusqueda.NROITEM) {
            filtro = 'filtrar-nroitem';
        }
        return this.gcRestService.get<ItemCompraFiltroDTO[]>(
            `${this.url}/${filtro}/${idCompra}/${texto}`,
        );
    }
}
