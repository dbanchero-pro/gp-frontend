import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { EstadoEntrega } from '../enum/estado-entrega.enum';
import { TipoUnidad } from '../enum/tipo-unidad.enum';
import { ICodigoEntregableDTO } from '../models/codigo-entregable.model';
import { IEntregableDTO } from '../models/entregable.model';
import { ItemOrdenCompraDTO } from '../models/item-orden-compra.model';

@Injectable({
    providedIn: 'root'
})
export class EntregableService {
    private readonly url = '/api/gestion-contratos/v1/entregables';

    constructor(private readonly gcRestService: RestService) { }

    obtenerCodigoEntregablesPorItem(params: {
        idOC: number,
        idItem: number,
        idVariacion: number,

    }): Observable<ICodigoEntregableDTO[]> {
        let httpParams = new HttpParams()
            .set('idOC', params.idOC.toString())
            .set('idItem', params.idItem.toString())
            .set('idVariacion', params.idVariacion.toString());


        return this.gcRestService.get(`${this.url}/codigos`, httpParams);
    }
    obtenerEntregablesPorItem(params: {
        idOC: number,
        idItem: number,
        idVariacion: number,
        codigo?: string,
        estado: EstadoEntrega,
        page?: number,
        size?: number,
        sort?: string,
        order?: string
    }): Observable<PageModel<IEntregableDTO>> {
        let httpParams = new HttpParams()
            .set('idOC', params.idOC.toString())
            .set('idItem', params.idItem.toString())
            .set('idVariacion', params.idVariacion.toString());

        // Solo agregar el parámetro estadoEntrega si existe en el objeto params
        if (params.estado !== undefined && params.estado !== null) {
            httpParams = httpParams.set('estado', params.estado);
        }

        if (params.codigo !== undefined && params.codigo !== null) {
            httpParams = httpParams.set('codigo', params.codigo);
        }
        if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
        if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());

        if (params.sort) {
            const sortValue = params.order
                ? `${params.sort},${params.order}`
                : params.sort;
            httpParams = httpParams.set('sort', sortValue);
        }

        return this.gcRestService.get(`${this.url}/all`, httpParams);
    }

    obtenerEntregable(idEntregable: number): Observable<IEntregableDTO> {
        return this.gcRestService.get<IEntregableDTO>(`${this.url}/${idEntregable}`);
    }

    crearEntregable(dto: IEntregableDTO): Observable<IEntregableDTO> {
        return this.gcRestService.post<IEntregableDTO, IEntregableDTO>(this.url, dto);
    }

    modificarEntregable(id: number, dto: IEntregableDTO): Observable<IEntregableDTO> {
        return this.gcRestService.put<IEntregableDTO, IEntregableDTO>(`${this.url}/${id}`, dto);
    }

    eliminarEntregable(id: number): Observable<boolean> {
        return this.gcRestService.delete<boolean>(`${this.url}/${id}`);
    }

    descargarDocumento(idEntrega: number, idArchivo: number): Observable<ArchivoDTO> {
        const params = new HttpParams()
            .set('idEntregable', idEntrega.toString())
            .set('idArchivo', idArchivo.toString());

        return this.gcRestService.get<ArchivoDTO>(`${this.url}/descargar-documento`, params);
    }


    cantidadesPendienteEntrega(entregable: IEntregableDTO, item: ItemOrdenCompraDTO): string {
        const pendiente = entregable.cantidadPendienteEntrega ?? entregable.cantidad;
        const total = entregable.cantidadTotalMostrar ?? entregable.cantidad;

        const textoPendiente = pendiente?.toLocaleString('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

        const textoTotal = total?.toLocaleString('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });

        return `${textoPendiente} de ${textoTotal} ${this.obtenerUnidadesEntrega(entregable, item)}`.trim();
    }

    obtenerCantidadEntregable(entregable: IEntregableDTO, item?: ItemOrdenCompraDTO): string {
        const cantidad = entregable.cantidad;

        const textoCantidad = cantidad?.toLocaleString('es-UY', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        });
        item ??= entregable.itemOrdenCompra!;
        return `${(textoCantidad ?? '0')} ${this.obtenerUnidades(entregable, item)}`.trim();
    }

    entregableTieneCantidadSinAsignar(entregable: IEntregableDTO) {
        const pendienteEntrega = entregable.cantidadPendienteEntrega ?? entregable.cantidad;
        const pendienteAsignar = entregable.cantidadPendienteAsignar ?? entregable.cantidad;
        return (pendienteEntrega! > 0 && pendienteAsignar! > 0);
    }

    obtenerUnidades(entregable: IEntregableDTO, item: ItemOrdenCompraDTO): string {
        let unidad = item?.descUnidadMedida;
        if (entregable.tipoUnidad === TipoUnidad.PORCENTAJE) {
            return `%`;
        }
        else {
            return `(${unidad})`;
        }
    }

    obtenerUnidadesEntrega(entregable: IEntregableDTO, item: ItemOrdenCompraDTO): string {
        let unidad = item?.descUnidadMedida;
        if (entregable.tipoUnidadEntregas === TipoUnidad.PORCENTAJE) {
            return `%`;
        }
        else {
            return `(${unidad})`;
        }
    }
}
