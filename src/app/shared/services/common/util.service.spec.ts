import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { IUsuarioInfoDTO } from '../../models/usuario/usuario-info.model';
import { RestService } from './rest.service';
import { UtilService } from './util.service';

class MockgcRestService {
  get<T>(url: string): Observable<T> {
    return of({} as T);  // Puedes ajustar esto según tus necesidades
  }
}

describe('UtilService', () => {
  let service: UtilService;
  let gcRestService: RestService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UtilService,
        { provide: RestService, useClass: MockgcRestService }
      ],
    });

    service = TestBed.inject(UtilService);
    gcRestService = TestBed.inject(RestService);
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('debería llamar al método get con la URL correcta para ping', () => {
    spyOn(gcRestService, 'get').and.returnValue(of({}));  // Puedes ajustar esto según tus necesidades

    service.ping();

    expect(gcRestService.get).toHaveBeenCalledWith('/api/util/v1/ping');
  });

  it('debería llamar al método get con la URL correcta para usuarioInfo', () => {
    spyOn(gcRestService, 'get').and.returnValue(of({} as IUsuarioInfoDTO));  // Puedes ajustar esto según tus necesidades

    service.usuarioInfo();

    expect(gcRestService.get).toHaveBeenCalledWith('/api/util/v1/usuario-info');
  });

  it('debería llamar al método get con la URL correcta para version', () => {
    spyOn(gcRestService, 'get').and.returnValue(of({}));
    service.version();
    expect(gcRestService.get).toHaveBeenCalledWith('/api/util/v1/version');
  });

  // Puedes agregar más pruebas según tus necesidades
});