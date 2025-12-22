import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Pais } from '../../enum/pais.enum';
import { PageModel } from '../../models/common/page/page.model';
import { ITipoDocumentoUsuarioDTO } from '../../models/usuario/tipo-documento-usuario.model';
import { RestService } from '../common/rest.service';

@Injectable({
  providedIn: 'root',
})
export class TipoDocumentoUsuarioService {

  private readonly baseUrl = '/api/gestion-contratos/v1/tipos-documento-usuario';

  constructor(private readonly gcRestService: RestService) { }

  obtenerTiposDocumentoUsuario(
    page: number = 0,
    size: number = 20,
    sort: string = 'id.idTipoDocumento,asc',
    idPais?: string,
    idTipoDocumento?: string
  ): Observable<PageModel<ITipoDocumentoUsuarioDTO>> {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (idPais) {
      params = params.set('idPais', idPais);
    }

    if (idTipoDocumento) {
      params = params.set('idTipoDocumento', idTipoDocumento);
    }

    return this.gcRestService.get<PageModel<ITipoDocumentoUsuarioDTO>>(`${this.baseUrl}/all`, params);
  }

  obtenerTodos(): Observable<ITipoDocumentoUsuarioDTO[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000)
      .set('sort', 'id.idTipoDocumento,asc');

    return this.gcRestService
      .get<PageModel<ITipoDocumentoUsuarioDTO>>(`${this.baseUrl}/all`, params)
      .pipe(map((res) => res.content));
  }

  obtenerTodosUY(): Observable<ITipoDocumentoUsuarioDTO[]> {
    const params = new HttpParams()
      .set('page', 0)
      .set('size', 1000)
      .set('sort', 'id.idTipoDocumento,asc')
      .set('idPais', Pais.URUGUAY);

    return this.gcRestService
      .get<PageModel<ITipoDocumentoUsuarioDTO>>(`${this.baseUrl}/all`, params)
      .pipe(map((res) => res.content));
  }

}
