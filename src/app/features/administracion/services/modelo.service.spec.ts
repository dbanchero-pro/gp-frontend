import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ModeloService } from './modelo.service';

describe('ModeloService', () => {
  let service: ModeloService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModeloService);
  });

  it('deberia crearse', () => {
    expect(service).toBeTruthy();
  });

  it('retorna modelos con secciones cargadas', fakeAsync(() => {
    let modelos: any[] = [];

    service.buscarModelos({} as any).subscribe(resp => {
      modelos = resp;
    });
    tick(300);

    expect(modelos.length).toBeGreaterThan(0);
    expect(modelos.every(m => (m.secciones || []).length > 0)).toBeTrue();
  }));

  it('incluye tipos de compra para los modelos mock', fakeAsync(() => {
    let modelos: any[] = [];

    service.buscarModelos({} as any).subscribe(resp => {
      modelos = resp;
    });
    tick(300);

    expect(modelos.every(m => (m.tiposCompra || []).length > 0)).toBeTrue();
  }));
});
