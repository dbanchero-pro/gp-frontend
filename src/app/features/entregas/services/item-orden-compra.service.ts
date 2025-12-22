import { DecimalPipe } from '@angular/common';
import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { EstadoItemOrdenCompra } from 'src/app/features/entregas/enum/estado-item-orden-compra';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoDTO, IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { ItemCompraFiltroDTO } from 'src/app/shared/models/item-compra-filtro.model';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { unidadMedidaFormateada } from 'src/app/shared/utils/functions';
import { TipoCantidad } from '../enum/tipo-cantidad.enum';
import { TipoUnidad } from '../enum/tipo-unidad.enum';
import { IItemOrdenCompraAtributoDTO } from '../models/item-orden-compra-atributo.model';

@Injectable({
    providedIn: 'root'
})

export class ItemOrdenCompraService {
    private readonly url = '/api/gestion-contratos/v1/items-orden-compra';

    constructor(private readonly gcRestService: RestService,
        private readonly archivoService: ArchivoService
    ) { }

    obtenerUnidades(item: IItemOrdenCompraDTO, cuentaEntregas: boolean = false): string {
        if (item.tipoCantidad === TipoCantidad.ENTREGA || cuentaEntregas) {
            return '(entregas)';
        } else if (item.tipoCantidad === TipoCantidad.ENTREGABLE) {
            return '(entregables)'
        }

        return unidadMedidaFormateada(item.descUnidadMedida, item.cantidadTotalMostrar ?? item.cantidad, item.tipoUnidad);
    }

    cantidadesPendienteEntregaYTotal(item: IItemOrdenCompraDTO): string {
        const decimalPipe = new DecimalPipe('es');
        const pendiente = decimalPipe.transform(item.cantidadPendienteEntrega ?? item.cantidad, '1.0-20', 'es');
        const total = decimalPipe.transform(item.cantidadTotal ?? item.cantidad, '1.0-20', 'es');
        return `${pendiente} de ${total} ${this.obtenerUnidades(item)}`.trim();
    }

    cantidadesPendienteRecepcionYTotal(item: IItemOrdenCompraDTO): string {
        const decimalPipe = new DecimalPipe('es');
        const pendiente = decimalPipe.transform(item.cantidadPendienteRecepcion, '1.0-20', 'es');
        const total = decimalPipe.transform(item.cantidadTotalPendienteRecepcion, '1.0-20', 'es');
        return `${pendiente} de ${total} ${this.obtenerUnidades(item, item.tipoCantidad == TipoCantidad.ENTREGABLE)}`.trim();
    }

    cantidadesPendienteConformidadYTotal(item: IItemOrdenCompraDTO): string {
        const decimalPipe = new DecimalPipe('es');
        const pendiente = decimalPipe.transform(item.cantidadPendienteConformidad, '1.0-20', 'es');
        const total = decimalPipe.transform(item.cantidadTotalPendienteConformidad, '1.0-20', 'es');
        return `${pendiente} de ${total} ${this.obtenerUnidades(item, item.tipoCantidad == TipoCantidad.ENTREGABLE)}`.trim();
    }

    cantidadesPendienteAsignarEntregaYTotal(item: IItemOrdenCompraDTO): string {
        const decimalPipe = new DecimalPipe('es');
        const pendiente = decimalPipe.transform(item.cantidadPendienteAsignar ?? item.cantidad, '1.0-20', 'es');
        const total = decimalPipe.transform(item.cantidadTotalMostrar ?? item.cantidad, '1.0-20', 'es');
        let unidad = "(" + item?.descUnidadMedida + ")";
        if (item.tipoUnidad === TipoUnidad.PORCENTAJE) {
            unidad = '%';
        }
 
        return `${pendiente} de ${total} ${unidad}`.trim();
    }


    cantidadesPendienteEntregaYTotalEntregable(item: IItemOrdenCompraDTO): string {
        const decimalPipe = new DecimalPipe('es');
        const pendiente = decimalPipe.transform(item.cantidadPendienteEntrega ?? item.cantidad, '1.0-20', 'es');
        const total = decimalPipe.transform(item.cantidadTotal ?? item.cantidad, '1.0-20', 'es');
        let unidad = "(" + item?.descUnidadMedida + ")";
        if (item.tipoUnidad === TipoUnidad.PORCENTAJE) {
            unidad = '%';
        }

        return `${pendiente} de ${total} ${unidad}`.trim();
    }

    obtenerItemsDeOrdenCompra(params: {
        idOC: number,
        tipoUsuario: TipoUsuario,
        nroItem?: number,
        descArticulo?: string,
        estadoItem?: EstadoItemOrdenCompra,
        page?: number,
        size?: number,
        sort?: string
    }): Observable<any> {
        let httpParams = new HttpParams();
        if (params.nroItem !== undefined) httpParams = httpParams.set('nroItem', params.nroItem.toString());
        if (params.descArticulo) httpParams = httpParams.set('descArticulo', params.descArticulo);
        if (params.estadoItem) httpParams = httpParams.set('estadoItem', params.estadoItem);
        if (params.tipoUsuario) httpParams = httpParams.set('tipoUsuario', params.tipoUsuario==TipoUsuario.ORGANISMO? 'ORGANISMO': 'PROVEEDOR' );
        if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
        if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
        if (params.sort) httpParams = httpParams.set('sort', params.sort);
        return this.gcRestService.get(`${this.url}/${params.idOC}`, httpParams);
    }

    obtenerItemOrdenCompra(idOC?: number, idItem?: number, idVariacion?: number, tipoUsuario?: TipoUsuario): Observable<IItemOrdenCompraDTO> {
        let httpParam = new HttpParams();
        if (tipoUsuario) httpParam = httpParam.set('tipoUsuario', tipoUsuario==TipoUsuario.ORGANISMO? 'ORGANISMO': 'PROVEEDOR' );
        return this.gcRestService.get<IItemOrdenCompraDTO>(`${this.url}/${idOC}/${idItem}/${idVariacion}`, httpParam);
    }

    obtenerAtributos(idOC: number, idItem: number, idVariacion: number): Observable<IItemOrdenCompraAtributoDTO[]> {
        return this.gcRestService.get<IItemOrdenCompraAtributoDTO[]>(`${this.url}/${idOC}/${idItem}/${idVariacion}/atributos/all`);
    }

     buscarPorArticuloCualquierOC(
        texto: string
    ): Observable<ItemCompraFiltroDTO[]> {
        return this.gcRestService.get<ItemCompraFiltroDTO[]>(
            `${this.url}/filtrar-articulos/0/${texto}`
        );
    }

    buscarPorArticulo(
        idOrdenCompra: number,
        texto: string,
        tipoBusqueda: TipoBusqueda
    ): Observable<ItemCompraFiltroDTO[]> {
        let filtro = 'filtrar-articulos';
        if (tipoBusqueda === TipoBusqueda.NROITEM) {
            filtro = 'filtrar-nroitem';
        }
        return this.gcRestService.get<ItemCompraFiltroDTO[]>(
            `${this.url}/${filtro}/${idOrdenCompra}/${texto}`
        );
    }

    exportarSeguimientoItemExcel(params: any): void {
        //Convierte el estadoOrdenCompra a mayúsculas antes de enviarlo
        const filtro = {
            nroItem: params.filtro.nroItem,
            descArticulo: params.filtro.descripcionArticulo,
            estadoItem: params.filtro.estado ? (params.filtro.estado).toUpperCase() : undefined
        };
        this.gcRestService.post<IArchivoDTO, any>(
            `${this.url}/${params.idOC}/excel`, filtro

        ).subscribe((res: ArchivoDTO) => this.archivoService.descargar(res));

    }
}


