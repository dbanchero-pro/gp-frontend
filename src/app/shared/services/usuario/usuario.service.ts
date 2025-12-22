import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageModel } from '../../models/common/page/page.model';
import { UsuarioDTO } from '../../models/usuario/usuario.model';
import { RestService } from '../common/rest.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly baseUrlUsuario = '/api/gestion-contratos/v1/usuarios';

  constructor(private readonly gcRestService: RestService) { }



  obtenerTodosUsuarios(
    page: number = 0,
    size: number = 20,
    sort: string = 'id,asc',
    idPais?: string,
    idTipoDocumento?: string,
    nroDocumento?: string
  ): Observable<PageModel<UsuarioDTO>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (idPais) params = params.set('idPais', idPais);
    if (idTipoDocumento) params = params.set('idTipoDocumento', idTipoDocumento);
    if (nroDocumento) params = params.set('nroDocumento', nroDocumento);

    return this.gcRestService.get<PageModel<UsuarioDTO>>(`${this.baseUrlUsuario}/all`, params);
  }

  obtenerUsuarioPorId(idUsuario: string): Observable<UsuarioDTO> {
    return this.gcRestService.get<UsuarioDTO>(`${this.baseUrlUsuario}/${idUsuario}`);
  }
  
  buscarUsuarioPorId(idUsuario: string): Observable<UsuarioDTO> {
    return this.gcRestService.get<UsuarioDTO>(`${this.baseUrlUsuario}/buscar/${idUsuario}`);
  }

}

