import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ZonaDto } from 'src/app/features/administracion/puntos-recepcion/models/zona.model';
import { RestService } from 'src/app/shared/services/common/rest.service';

@Injectable({
  providedIn: 'root'
})
export class ZonaService {

  private readonly url = '/api/gestion-contratos/v1/zonas';

  constructor(private readonly gcRestService: RestService) { }

  obtenerZonas(): Observable<ZonaDto[]> {
    return this.gcRestService.get(this.url + '/all');
  }
}
