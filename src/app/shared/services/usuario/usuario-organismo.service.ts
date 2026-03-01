import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TipoPerfil } from '../../enum/tipo-perfil.enum';
import { UsuarioOrganismoDTO } from '../../models/usuario/usuario-organismo.model';
import { RestService } from '../common/rest.service';

@Injectable({
    providedIn: 'root',
})
export class UsuarioOrganismoService {
    private readonly baseUrlUsuarioOrganismo =
        '/api/gestion-contratos/v1/usuarios-organismo';

    constructor(private readonly gcRestService: RestService) {}

    obtenerUsuariosOrganismoNoExiste(
        tipoPerfil: TipoPerfil,
        filtros?: {
            idInciso?: number;
            idUnidadEjecutora?: number;
            idUnidadCompra?: number;
        },
    ): Observable<UsuarioOrganismoDTO[]> {
        let params = new HttpParams();
        if (filtros?.idInciso !== undefined)
            params = params.set('idInciso', filtros.idInciso.toString());
        if (filtros?.idUnidadEjecutora !== undefined)
            params = params.set(
                'idUnidadEjecutora',
                filtros.idUnidadEjecutora.toString(),
            );
        if (filtros?.idUnidadCompra !== undefined)
            params = params.set(
                'idUnidadCompra',
                filtros.idUnidadCompra.toString(),
            );

        return this.gcRestService.get<UsuarioOrganismoDTO[]>(
            `${this.baseUrlUsuarioOrganismo}/usuarios-no-existentes-gc-${tipoPerfil.toLowerCase()}`,
            params,
        );
    }
    obtenerUsuarioOrganismo(
        idUsuario: string,
        idInciso: number,
        idUnidadEjecutora: number,
        idUnidadCompra: number,
    ): Observable<UsuarioOrganismoDTO> {
        return this.gcRestService.get<UsuarioOrganismoDTO>(
            `${this.baseUrlUsuarioOrganismo}/${idUsuario}/${idInciso}/${idUnidadEjecutora}/${idUnidadCompra}`,
        );
    }

    obtenerInformacionUsuarioSice(
        idUsuario: string,
        tipoPerfil: TipoPerfil,
        validarExistencia: boolean = true,
    ): Observable<UsuarioOrganismoDTO> {
        const url = `${this.baseUrlUsuarioOrganismo}/obtener-informacion-usuario-sice`;
        const params = new HttpParams()
            .set('idUsuario', idUsuario)
            .set('tipoPerfil', tipoPerfil)
            .set('validarExistencia', validarExistencia);
        return this.gcRestService.post<UsuarioOrganismoDTO, any>(
            url,
            null,
            params,
        );
    }
}
