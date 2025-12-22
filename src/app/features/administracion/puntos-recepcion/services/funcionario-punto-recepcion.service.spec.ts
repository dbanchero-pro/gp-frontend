import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { FuncionarioPuntoRecepcionService } from './funcionario-punto-recepcion.service';

describe('FuncionarioPuntoRecepcionService', () => {
  let service: FuncionarioPuntoRecepcionService;
  let gcRestServiceSpy: jasmine.SpyObj<RestService>;

  beforeEach(() => {
    gcRestServiceSpy = jasmine.createSpyObj('GcRestService', ['get', 'post']);

    TestBed.configureTestingModule({
      providers: [
        FuncionarioPuntoRecepcionService,
        { provide: RestService, useValue: gcRestServiceSpy }
      ]
    });

    service = TestBed.inject(FuncionarioPuntoRecepcionService);
  });

  it('debería llamar a obtenerFuncionariosPorPuntoRecepcion con los parámetros correctos', () => {
    gcRestServiceSpy.get.and.returnValue(of([]));

    const expectedParams = new HttpParams()
      .set('page', '0')
      .set('size', '10')
      .set('sort', 'nombre');

    service.obtenerFuncionariosPorPuntoRecepcion({
      page: 0,
      size: 10,
      sort: 'nombre',
      idPuntoRecepcion: 123
    }).subscribe();

    expect(gcRestServiceSpy.get).toHaveBeenCalledWith(
      '/api/gestion-contratos/v1/funcionarios-puntos-recepcion/123',
      expectedParams
    );
  });

  it('debería llamar a obtenerFuncionario con los parámetros correctos', () => {
    gcRestServiceSpy.get.and.returnValue(of({}));

    service.obtenerFuncionario(1, 'user1', 2, 3, 4).subscribe();

    expect(gcRestServiceSpy.get).toHaveBeenCalledWith(
      '/api/gestion-contratos/v1/funcionarios-puntos-recepcion/1/user1/2/3/4'
    );
  });

  it('debería llamar a guardarFuncionario con los parámetros correctos', () => {
    gcRestServiceSpy.post.and.returnValue(of({}));

    const expectedParams = new HttpParams()
      .set('idPuntoRecepcion', '1')
      .set('idUsuario', 'user1')
      .set('idInciso', '2')
      .set('idUnidadEjecutora', '3')
      .set('idUnidadCompra', '4');

    service.guardarFuncionario(1, 'user1', 2, 3, 4).subscribe();

    expect(gcRestServiceSpy.post).toHaveBeenCalledWith(
      '/api/gestion-contratos/v1/funcionarios-puntos-recepcion/guardar',
      null,
      expectedParams
    );
  });

  it('debería llamar a eliminarFuncionario con los parámetros correctos', () => {
    gcRestServiceSpy.get.and.returnValue(of({}));

    service.eliminarFuncionario(1, 'user1', 2, 3, 4).subscribe();

    expect(gcRestServiceSpy.get).toHaveBeenCalledWith(
      '/api/gestion-contratos/v1/funcionarios-puntos-recepcion/eliminar/1/user1/2/3/4'
    );
  });
});
