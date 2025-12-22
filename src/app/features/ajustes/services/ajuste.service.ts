import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { IDescargoDTO } from '../../entregas/models/descargo.model';
import { IAjusteDTO } from '../models/ajuste.model';
import { IAjustesItemsRequestDTO } from '../models/ajustes-items-request.model';
import { IAjustesItemsResponseDTO } from '../models/ajustes-items-response.model';
import { IAjusteFiltro } from '../models/filtros/ajuste-filtro.model';

@Injectable({ providedIn: 'root' })
export class AjusteService {

    private readonly url = '/api/gestion-contratos/v1/ajustes';

    constructor(private readonly gcRestService: RestService) { }

    buscarAjustes(
        tipoUsuario: TipoUsuario,
        idOC: number,
        filtros: IAjusteFiltro = {},
        page?: number,
        size?: number,
        sort?: string,
        order: 'asc' | 'desc' = 'desc'
    ): Observable<PageModel<IAjusteDTO>> {
        const segmento = tipoUsuario === TipoUsuario.ORGANISMO ? 'consulta-organismo' : 'consulta-proveedor';
        const endpoint = `${this.url}/${segmento}/${idOC}`;

        let params = new HttpParams();
        if (page !== undefined) params = params.set('page', String(page));
        if (size !== undefined) params = params.set('size', String(size));
        if (sort) params = params.set('sort', `${sort},${order}`);

        if (filtros.idItem !== undefined) params = params.set('idItem', filtros.idItem);
        if (filtros.idVariacion !== undefined) params = params.set('idVariacion', filtros.idVariacion);
        if (filtros.tipoAjuste !== undefined) params = params.set('tipoAjuste', String(filtros.tipoAjuste));
        if (filtros.estado !== undefined) params = params.set('estado', String(filtros.estado));
        if (filtros.fechaDesde) params = params.set('fechaDesde', filtros.fechaDesde);
        if (filtros.fechaHasta) params = params.set('fechaHasta', filtros.fechaHasta);
        if (typeof filtros.nroItem === 'number') params = params.set('nroItem', String(filtros.nroItem));
        if (typeof filtros.codArticulo === 'number') params = params.set('codArticulo', String(filtros.codArticulo));

        return this.gcRestService.get<PageModel<IAjusteDTO>>(endpoint, params);
    }

    rechazarAjuste(dto: IAjusteDTO): Observable<IAjusteDTO> {
        return this.gcRestService.put<IAjusteDTO, IAjusteDTO>(`${this.url}/${dto.idAjuste}/rechazar`, dto);
    }

    aprobarAjuste(dto: IAjusteDTO): Observable<IAjusteDTO> {
        return this.gcRestService.put<IAjusteDTO, IAjusteDTO>(`${this.url}/${dto.idAjuste}/aprobar`, dto);
    }

    eliminarAjuste(idAjuste: number, tipoUsuario: TipoUsuario): Observable<boolean> {
        const endpoint = tipoUsuario === TipoUsuario.ORGANISMO
            ? `${this.url}/${idAjuste}/eliminar-organismo`
            : `${this.url}/${idAjuste}/eliminar-proveedor`;
        return this.gcRestService.delete<boolean>(endpoint);
    }

    agregarDescargo(dto: IDescargoDTO): Observable<IDescargoDTO> {
        return this.gcRestService.post<IDescargoDTO, IDescargoDTO>(`${this.url}/agregar-descargo`, dto);
    }

    crearAjuste(dto: IAjusteDTO, tipoUsuario: TipoUsuario): Observable<IAjusteDTO> {
        const endpoint = tipoUsuario === TipoUsuario.ORGANISMO
            ? `${this.url}/crear-organismo`
            : `${this.url}/crear-proveedor`;
        return this.gcRestService.post<IAjusteDTO, IAjusteDTO>(endpoint, dto);
    }

    modificarAjuste(dto: IAjusteDTO, tipoUsuario: TipoUsuario): Observable<IAjusteDTO> {
        const endpoint = tipoUsuario === TipoUsuario.ORGANISMO
            ? `${this.url}/${dto.idAjuste}/modificar-organismo`
            : `${this.url}/${dto.idAjuste}/modificar-proveedor`;
        return this.gcRestService.put<IAjusteDTO, IAjusteDTO>(endpoint, dto);
    }

    crearAjustesItemsSeleccionados(
        request: IAjustesItemsRequestDTO,
        tipoUsuario: TipoUsuario
    ): Observable<IAjustesItemsResponseDTO> {
        const endpoint = tipoUsuario === TipoUsuario.ORGANISMO
            ? `${this.url}/crear-ajuste-seleccionadas-organismo`
            : `${this.url}/crear-ajuste-seleccionadas-proveedor`;
        return this.gcRestService.put<IAjustesItemsResponseDTO, IAjustesItemsRequestDTO>(endpoint, request);
    }

    validarAjustesItemsSeleccionados(
        request: IAjustesItemsRequestDTO,
        tipoUsuario: TipoUsuario
    ): Observable<IAjustesItemsResponseDTO> {
        const endpoint = tipoUsuario === TipoUsuario.ORGANISMO
            ? `${this.url}/validar-ajuste-seleccionadas-organismo`
            : `${this.url}/validar-ajuste-seleccionadas-proveedor`;
        return this.gcRestService.put<IAjustesItemsResponseDTO, IAjustesItemsRequestDTO>(endpoint, request);
    }


    descargarDocumento(idAjuste: number, idArchivo: number): Observable<ArchivoDTO> {
        const params = new HttpParams()
            .set('idAjuste', idAjuste.toString())
            .set('idArchivo', idArchivo.toString());

        return this.gcRestService.get<ArchivoDTO>(`${this.url}/descargar-documento`, params);
    }

    

    descargarDescargo(idAjuste: number, idArchivo: number): Observable<ArchivoDTO> {
        const params = new HttpParams()
            .set('idAjuste', idAjuste.toString())
            .set('idArchivo', idArchivo.toString());

        return this.gcRestService.get<ArchivoDTO>(`${this.url}/descargar-descargo`, params);
    }
}
