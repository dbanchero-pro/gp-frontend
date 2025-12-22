import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoDTO, IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { EstadoEntregaCodigo } from '../enum/estado-entrega.enum';
import { IConformidadEntregasRequest } from '../models/conformidad-entrega-request-model';
import { IConformidadItemsRequest } from '../models/conformidad-item-request.model';
import { IDescargoDTO } from '../models/descargo.model';
import { IEntregaDTO } from '../models/entrega.model';
import { IRecepcionEntregasRequest } from '../models/recepcion-entrega-request-model';
import { IRecepcionItemsRequest } from '../models/recepcion-item-request.model';

@Injectable({
    providedIn: 'root'
})
export class EntregaService {
    private readonly url = '/api/gestion-contratos/v1/entregas';

    constructor(private readonly gcRestService: RestService,
        private readonly seguridadService: SeguridadService,
        private readonly archivoService: ArchivoService
    ) { }

    obtenerEntregas(params: {
        idOC: number,
        idCompra: number,
        idItemCompra: number,
        idVariacion: number,
        estadoEntrega?: EstadoEntregaCodigo,
        page?: number,
        size?: number,
        sort?: string,
        order?: string
    }): Observable<PageModel<IEntregaDTO>> {
        let httpParams = new HttpParams()
            .set('idOC', params.idOC.toString())
            .set('idCompra', params.idCompra.toString())
            .set('idItemCompra', params.idItemCompra.toString())
            .set('idVariacion', params.idVariacion.toString());

        if (params.estadoEntrega !== undefined) {
            httpParams = httpParams.set('estadoEntrega', params.estadoEntrega);
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

    obtenerEntrega(idEntrega: number): Observable<IEntregaDTO> {
        return this.gcRestService.get<IEntregaDTO>(`${this.url}/${idEntrega}`);
    }

    crearEntrega(dto: IEntregaDTO, tipoUsuario: TipoUsuario): Observable<IEntregaDTO> {
        const endpoint = tipoUsuario === TipoUsuario.ORGANISMO
            ? `${this.url}/crear-organismo`
            : `${this.url}/crear-proveedor`;
        return this.gcRestService.post<IEntregaDTO, IEntregaDTO>(endpoint, dto);
    }

    modificarEntrega(id: number, dto: IEntregaDTO, tipoUsuario: TipoUsuario): Observable<IEntregaDTO> {
        const endpoint = tipoUsuario === TipoUsuario.ORGANISMO
            ? `${this.url}/${id}/modificar-organismo`
            : `${this.url}/${id}/modificar-proveedor`;
        return this.gcRestService.put<IEntregaDTO, IEntregaDTO>(endpoint, dto);
    }


    recepcionEntrega(id: number, dto: IEntregaDTO): Observable<IEntregaDTO> {
        return this.gcRestService.put<IEntregaDTO, IEntregaDTO>(`${this.url}/${id}/recepcion`, dto);
    }

    darConformidadEntrega(id: number, dto: IEntregaDTO): Observable<IEntregaDTO> {
        return this.gcRestService.put<IEntregaDTO, IEntregaDTO>(`${this.url}/${id}/dar-conformidad`, dto);
    }

    modificarRecepcion(id: number, dto: IEntregaDTO): Observable<IEntregaDTO> {
        return this.gcRestService.put<IEntregaDTO, IEntregaDTO>(`${this.url}/${id}/modificar-recepcion`, dto);
    }

    modificarConformidad(id: number, dto: IEntregaDTO): Observable<IEntregaDTO> {
        return this.gcRestService.put<IEntregaDTO, IEntregaDTO>(`${this.url}/${id}/modificar-conformidad`, dto);
    }

    eliminarEntrega(id: number, tipoUsuario: TipoUsuario): Observable<boolean> {
        const endpoint = tipoUsuario === TipoUsuario.ORGANISMO
            ? `${this.url}/${id}/eliminar-organismo`
            : `${this.url}/${id}/eliminar-proveedor`;
        return this.gcRestService.delete<boolean>(endpoint);
    }

    eliminarRecepcion(id: number): Observable<IEntregaDTO> {
        return this.gcRestService.delete<IEntregaDTO>(`${this.url}/${id}/eliminar-recepcion`);
    }

    eliminarConformidad(id: number): Observable<IEntregaDTO> {
        return this.gcRestService.delete<IEntregaDTO>(`${this.url}/${id}/eliminar-conformidad`);
    }

    descargarDocumento(idEntrega: number, idArchivo: number): Observable<ArchivoDTO> {
        const params = new HttpParams()
            .set('idEntrega', idEntrega.toString())
            .set('idArchivo', idArchivo.toString());

        return this.gcRestService.get<ArchivoDTO>(`${this.url}/descargar-documento`, params);
    }

    tieneConformidad(entrega: IEntregaDTO): boolean {
        return entrega.cantidadConformidadAceptada != undefined && entrega.cantidadConformidadAceptada != null;
    }

    tieneRecepcion(entrega: IEntregaDTO): boolean {
        return entrega.cantidadRecepcionAceptada != undefined && entrega.cantidadRecepcionAceptada != null;
    }

    tieneSoloEntrega(entrega: IEntregaDTO): boolean {
        return entrega.cantidadRecepcionAceptada == undefined || entrega.cantidadRecepcionAceptada == null;
    }

    tieneSoloRecepcion(entrega: IEntregaDTO): boolean {
        return (entrega.cantidadRecepcionAceptada != undefined && entrega.cantidadRecepcionAceptada != null)
            && (entrega.cantidadConformidadAceptada == undefined || entrega.cantidadConformidadAceptada == null);
    }

    tieneRechazosUObservaciones(entrega: IEntregaDTO): boolean {
        return ((entrega.cantidadRecepcionRechazada && entrega.cantidadRecepcionRechazada != 0)
            || (entrega.cantidadConformidadRechazada && entrega.cantidadConformidadRechazada != 0)
            || (entrega.observaciones !== undefined && entrega.observaciones !== ''))
    }

    mostrarCheck(entrega: IEntregaDTO): boolean {
        const esOrganismo = this.seguridadService.obtenerTipoUsuario() === TipoUsuario.ORGANISMO;
        return esOrganismo && (
            (this.seguridadService.tienePermiso('GC_GESTION_RECEP.ALTA') && this.puedeRecepcionarMasivo(entrega))
            || (this.seguridadService.tienePermiso('GC_GESTION_CONF.ALTA') && this.puedeDarConformidadMasivo(entrega))
        );
    }

    puedeRecepcionarMasivo(entrega: IEntregaDTO): boolean {
        return entrega.puedeRecepcionEntregas! && this.tieneSoloEntrega(entrega);
    }

    puedeDarConformidadMasivo(entrega: IEntregaDTO): boolean {
        return entrega.puedeConformidadEntregas! && this.tieneSoloRecepcion(entrega) && !entrega?.recepcionFueraFecha;
    }

    recepcionarEntregasSeleccionadas(request: IRecepcionEntregasRequest): Observable<IEntregaDTO[]> {
        const url = `${this.url}/recepcionar-entregas-seleccionadas`;
        return this.gcRestService.put<IEntregaDTO[], IRecepcionEntregasRequest>(url, request);
    }

    darConformidadEntregasSeleccionadas(request: IConformidadEntregasRequest): Observable<IEntregaDTO[]> {
        const url = `${this.url}/dar-conformidad-entregas-seleccionadas`;
        return this.gcRestService.put<IEntregaDTO[], IConformidadEntregasRequest>(url, request);
    }

    recepcionarItemsSeleccionados(request: IRecepcionItemsRequest): Observable<IEntregaDTO[]> {
        const url = `${this.url}/recepcionar-items-seleccionados`;
        return this.gcRestService.put<IEntregaDTO[], IRecepcionItemsRequest>(url, request);
    }

    darConformidadItemsSeleccionados(request: IConformidadItemsRequest): Observable<IEntregaDTO[]> {
        const url = `${this.url}/dar-conformidad-items-seleccionados`;
        return this.gcRestService.put<IEntregaDTO[], IConformidadItemsRequest>(url, request);
    }

    agregarDescargo(dto: IDescargoDTO): Observable<IDescargoDTO> {
        return this.gcRestService.post<IDescargoDTO, IDescargoDTO>(`${this.url}/agregar-descargo`, dto);
    }
    exportarExcel(params: any): void {
        //Convierte el estadoOrdenCompra a mayúsculas antes de enviarlo
        let filtroAux = params;
        filtroAux.estadoEntrega = filtroAux.estadoEntrega?.toUpperCase();
        this.gcRestService.post<IArchivoDTO, any>(
            `${this.url}/excel`,
            filtroAux
        ).subscribe((res: IArchivoDTO) => this.archivoService.descargar(res));

    }

    tipoUnidadPorcentaje(valor: number | null, pendiente: number): ValidationErrors | null {
        if (valor == null || isNaN(valor)) return { porcentajeRequerido: true };
        if (valor < 1 || valor > 100) return { porcentajeRango: true };

        if (valor > pendiente) {
            return { excedePendientePorcentaje: true };
        }

        return null;
    }

    tipoUnidadCantidad(valor: number | null, pendiente: number): ValidationErrors | null {
        if (valor == null || isNaN(valor)) return { cantidadRequerida: true };
        if (valor !== 1) return { cantidadDebeSerUno: true };
        if (valor > pendiente) return { excedePendienteCantidad: true };
        return null;
    }



}
