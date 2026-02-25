import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { ZonaDto } from '../models/zona.model';

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
