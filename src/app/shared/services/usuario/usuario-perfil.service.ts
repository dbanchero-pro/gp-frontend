import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoPerfil } from '../../enum/tipo-perfil.enum';
import { ArchivoDTO, IArchivoDTO } from '../../models/common/archivo.model';
import { PageModel } from '../../models/common/page/page.model';
import { FiltroBusquedaArticulosDTO } from '../../models/filtros/filtro-busqueda-articulos.model';
import { ItemCompraFiltroDTO } from '../../models/item-compra-filtro.model';
import { UsuarioOrganismoPerfilDTO } from '../../models/usuario/usuario-organismo-perfil.model';
import { ArchivoService } from '../common/archivo.service';
import { RestService } from '../common/rest.service';

@Injectable({
    providedIn: 'root'
})
export class UsuarioOrganismoPerfilService {
    private readonly baseUrl = '/api/gestion-contratos/v1/usuarios-organismo-perfil';

    constructor(private readonly gcRestService: RestService,
        private readonly archivoService: ArchivoService
    ) { }

    obtenerTodos(
        filtros: {
            permisoTodas?: boolean;
            nroDocumento?: string;
            idInciso?: number;
            idUnidadEjecutora?: number;
            idUnidadCompra?: number;
            idTipoCompra?: string;
            nroCompra?: number;
            idEntregable?: number;
            nombrePuntoRecepcion?: string;
            idPuntoRecepcion?: number;
            anioCompra?: number;
            nroItem?: number;
            descArticulo?: string;
            idZona?: number;
            tipoPerfil?: string;
        } = {},
        page: number = 0,
        size: number = 10,
        sort: string = 'usuarioOrganismo.usuario.nroDocumento,asc'
    ): Observable<PageModel<UsuarioOrganismoPerfilDTO>> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('sort', sort);

        const agregarSiDefinido = (key: string, value: any) => {
            if (value !== undefined && value !== null) {
                params = params.set(key, value.toString());
            }
        };

        agregarSiDefinido('idZona', filtros.idZona);
        agregarSiDefinido('permisoTodas', filtros.permisoTodas);
        agregarSiDefinido('nroDocumento', filtros.nroDocumento);
        agregarSiDefinido('idInciso', filtros.idInciso);
        agregarSiDefinido('idUnidadEjecutora', filtros.idUnidadEjecutora);
        agregarSiDefinido('idUnidadCompra', filtros.idUnidadCompra);
        agregarSiDefinido('idTipoCompra', filtros.idTipoCompra);
        agregarSiDefinido('nroCompra', filtros.nroCompra);
        agregarSiDefinido('anioCompra', filtros.anioCompra);
        agregarSiDefinido('nroItem', filtros.nroItem);
        agregarSiDefinido('tipoPerfil', filtros.tipoPerfil);
        agregarSiDefinido('idEntregable', filtros.idEntregable);
        agregarSiDefinido('nombrePuntoRecepcion', filtros.nombrePuntoRecepcion);
        agregarSiDefinido('idPuntoRecepcion', filtros.idPuntoRecepcion);
        agregarSiDefinido('descripcionArticulo', filtros.descArticulo);

        return this.gcRestService.get<PageModel<UsuarioOrganismoPerfilDTO>>(`${this.baseUrl}/all`, params);
    }

    guardar(dto: UsuarioOrganismoPerfilDTO): Observable<UsuarioOrganismoPerfilDTO> {
        return this.gcRestService.post<UsuarioOrganismoPerfilDTO, UsuarioOrganismoPerfilDTO>(this.baseUrl, dto);
    }

    agregarConformidadUC(
        idInciso: number,
        idUnidadEjecutora: number,
        idUnidadCompra: number,
        idUsuario: string
    ): Observable<boolean> {
        const params = new HttpParams()
            .set('idInciso', idInciso.toString())
            .set('idUnidadEjecutora', idUnidadEjecutora.toString())
            .set('idUnidadCompra', idUnidadCompra.toString())
            .set('idUsuario', idUsuario);

        return this.gcRestService.post<boolean, null>(
            `${this.baseUrl}/agregar-conformidad-uc`,
            null,
            params
        );
    }

    agregarConformidadTodasUc(idUsuario: string): Observable<boolean> {
        const params = new HttpParams().set('idUsuario', idUsuario);

        return this.gcRestService.post<boolean, null>(
            `${this.baseUrl}/agregar-conformidad-uc-todas`,
            null,
            params
        );
    }

    agregarConformidadPorCompra(
        idCompra: number,
        idUsuario: string): Observable<boolean> {
        const params = new HttpParams()
            .set('idCompra', idCompra.toString())
            .set('idUsuario', idUsuario);

        return this.gcRestService.post<boolean, null>(`${this.baseUrl}/agregar-conformidad-compra`, null, params);
    }

    agregarConformidadPorItem(
        idCompra: number,
        idItem: number,
        idUsuario: string): Observable<boolean> {
        const params = new HttpParams()
            .set('idCompra', idCompra.toString())
            .set('idItem', idItem.toString())
            .set('idUsuario', idUsuario);

        return this.gcRestService.post<boolean, null>(`${this.baseUrl}/agregar-conformidad-item`, null, params
        );
    }

    agregarResponsablePuntoRecepcion(
        idPuntoRecepcion: number,
        idUsuario: string): Observable<boolean> {
        const params = new HttpParams()
            .set('idPuntoRecepcion', idPuntoRecepcion.toString())
            .set('idUsuario', idUsuario);

        return this.gcRestService.post<boolean, null>(
            `${this.baseUrl}/agregar-resonsable-punto-recepcion`,
            null,
            params
        );
    }

    agregarResponsableRecepcionUC(
        idInciso: number,
        idUnidadEjecutora: number,
        idUnidadCompra: number,
        idUsuario: string): Observable<boolean> {
        const params = new HttpParams()
            .set('idInciso', idInciso.toString())
            .set('idUnidadEjecutora', idUnidadEjecutora.toString())
            .set('idUnidadCompra', idUnidadCompra.toString())
            .set('idUsuario', idUsuario);

        return this.gcRestService.post<boolean, null>(
            `${this.baseUrl}/agregar-resonsable-recepcion-uc`,
            null,
            params
        );
    }

    agregarResponsableRecepcionUCTodas(
        idUsuario: string): Observable<boolean> {
        const params = new HttpParams()
            .set('idUsuario', idUsuario);

        return this.gcRestService.post<boolean, null>(
            `${this.baseUrl}/agregar-resonsable-recepcion-uc-todas`,
            null,
            params
        );
    }

    eliminarPerfil(idUsuarioOrganismoPerfil: number): Observable<boolean> {
        return this.gcRestService.delete<boolean>(`${this.baseUrl}/${idUsuarioOrganismoPerfil}`);
    }

    exportarUsuariosPerfil(filtros: any): void {
        this.gcRestService.post<IArchivoDTO, any>(
            `${this.baseUrl}/excel`,
            filtros
        ).subscribe((res: ArchivoDTO) => this.archivoService.descargar(res));
    }


    buscarArticulos(
        tipoPerfil: string = TipoPerfil.Conformidad, filtros?: FiltroBusquedaArticulosDTO): Observable<ItemCompraFiltroDTO[]> {

        let params = new HttpParams().set('tipoPerfil', tipoPerfil);

        if (filtros?.idIncisoCompra !== undefined) params = params.set('idInciso', filtros.idIncisoCompra.toString());
        if (filtros?.idUECompra !== undefined) params = params.set('idUnidadEjecutora', filtros.idUECompra.toString());
        if (filtros?.idUCCompra !== undefined) params = params.set('idUnidadCompra', filtros.idUCCompra.toString());
        if (filtros?.anioCompra !== undefined) params = params.set('anioCompra', filtros.anioCompra.toString());
        if (filtros?.numCompra !== undefined) params = params.set('numCompra', filtros.numCompra.toString());
        if (filtros?.nroItem !== undefined) params = params.set('nroItem', filtros.nroItem.toString());
        if (filtros?.descripcionArticulo !== undefined) params = params.set('descripcionArticulo', filtros.descripcionArticulo);
        if (filtros?.filtrarPorArticulo !== undefined) params = params.set('filtrarPorArticulo', filtros.filtrarPorArticulo.toString());

        return this.gcRestService.get<ItemCompraFiltroDTO[]>(
            `${this.baseUrl}/obtener-articulos`,
            params
        );
    }

}
