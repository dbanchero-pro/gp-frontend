import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { TipoCompraService } from './tipo-compra.service';

class MockGcRestService {
  lastUrl = '';
  lastParams: HttpParams | undefined;
  get(url: string, params?: HttpParams) { this.lastUrl = url; this.lastParams = params; return of({ content: [], totalElements: 0 }); }
  post(url: string, data: any, params?: HttpParams) { this.lastUrl = url; this.lastParams = params; return of(null); }
}

describe('TipoCompraService', () => {
  let service: TipoCompraService;
  let rest: MockGcRestService;

  beforeEach(() => {
    rest = new MockGcRestService();
    service = new TipoCompraService(rest as any);
  });


  it('obtenerTiposCompraSinPaginado debería llamar a la URL correcta', () => {
    service.obtenerTiposCompraSinPaginado().subscribe();
    expect(rest.lastUrl).toBe('/api/gestion-contratos/v1/tipos-compra/all');
  });

  it('obtenerTiposCompraPaginado debería llamar a la URL correcta', () => {
    service.obtenerTiposCompraPaginado().subscribe();
    expect(rest.lastUrl).toBe('/api/gestion-contratos/v1/tipos-compra');
  });

});
