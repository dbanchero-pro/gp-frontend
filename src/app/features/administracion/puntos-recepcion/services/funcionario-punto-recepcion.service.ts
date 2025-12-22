import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { RestService } from 'src/app/shared/services/common/rest.service';

@Injectable({
  providedIn: 'root'
})
export class FuncionarioPuntoRecepcionService {

  private readonly url = '/api/gestion-contratos/v1/funcionarios-puntos-recepcion';

  constructor(private readonly gcRestService: RestService) { }

  obtenerFuncionariosPorPuntoRecepcion(params: {
    page?: number, size?: number, sort?: string, idPuntoRecepcion: number
  }) {
    let httpParams = new HttpParams();

    if (params.page !== undefined) httpParams = httpParams.set('page', params.page.toString());
    if (params.size !== undefined) httpParams = httpParams.set('size', params.size.toString());
    if (params.sort) httpParams = httpParams.set('sort', params.sort);

    return this.gcRestService.get(`${this.url}/${params.idPuntoRecepcion}`, httpParams);
  }

  obtenerFuncionario(idPuntoRecepcion: number, idUsuario: string, idInciso: number, idUnidadEjecutora: number, idUnidadCompra: number) {
    return this.gcRestService.get(`${this.url}/${idPuntoRecepcion}/${idUsuario}/${idInciso}/${idUnidadEjecutora}/${idUnidadCompra}`);
  }

  guardarFuncionario(idPuntoRecepcion: number, idUsuario: string, idInciso: number, idUnidadEjecutora: number, idUnidadCompra: number) {
    const params = new HttpParams()
      .set('idPuntoRecepcion', idPuntoRecepcion.toString())
      .set('idUsuario', idUsuario)
      .set('idInciso', idInciso.toString())
      .set('idUnidadEjecutora', idUnidadEjecutora.toString())
      .set('idUnidadCompra', idUnidadCompra.toString());

    return this.gcRestService.post(`${this.url}/guardar`, null, params);
  }

  eliminarFuncionario(idPuntoRecepcion: number, idUsuario: string, idInciso: number, idUnidadEjecutora: number, idUnidadCompra: number) {
    return this.gcRestService.get(`${this.url}/eliminar/${idPuntoRecepcion}/${idUsuario}/${idInciso}/${idUnidadEjecutora}/${idUnidadCompra}`);
  }

}
