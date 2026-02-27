import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ClausulaService } from './clausula.service';

describe('ClausulaService', () => {
  let service: ClausulaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClausulaService);
  });

  it('deberia crearse', () => {
    expect(service).toBeTruthy();
  });

  it('obtiene catalogos para filtros de clausula', fakeAsync(() => {
    let filtros: any;
    service.obtenerFiltrosClausula().subscribe(resp => {
      filtros = resp;
    });
    tick(200);

    expect(filtros).toBeTruthy();
    expect(filtros.incisos.length).toBeGreaterThan(0);
    expect(filtros.tiposCompra.length).toBeGreaterThan(0);
    expect(filtros.familias.length).toBeGreaterThan(0);
  }));
});
