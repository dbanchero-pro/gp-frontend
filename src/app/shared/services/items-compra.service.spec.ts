import { TipoBusqueda } from '../enum/tipo-busqueda-item.enum';
import { RestService } from './common/rest.service';
import { ItemsCompraService } from './items-compra.service';

class GcRestMock {
  put = jasmine.createSpy('put');
  delete = jasmine.createSpy('delete');
  get = jasmine.createSpy('get');
}

describe('ItemsCompraService', () => {
  let service: ItemsCompraService;
  let rest: GcRestMock;

  beforeEach(() => {
    rest = new GcRestMock();
    service = new ItemsCompraService(rest as any as RestService);
  });

  it('modificar llama a put con la URL correcta', () => {
    service.modificar(1, 2, { x: 1 } as any);
    expect(rest.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/items-compra/1/2', { x: 1 } as any);
  });

  it('eliminar llama a delete con la URL correcta', () => {
    service.eliminar(1, 2);
    expect(rest.delete).toHaveBeenCalledWith('/api/gestion-contratos/v1/items-compra/eliminar/1/2');
  });

  it('obtenerItemsPorId llama a get', () => {
    service.obtenerItemsPorId(1, 2);
    expect(rest.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/items-compra/1/2');
  });

  it('copiar llama a put con cuerpo nulo', () => {
    service.copiar(1, 2);
    expect(rest.put).toHaveBeenCalledWith('/api/gestion-contratos/v1/items-compra/copiarItem/1/2', null);
  });

  it('buscarPorArticulo usa el filtro según el tipo', () => {
    service.buscarPorArticulo(1, 'a', TipoBusqueda.ARTICULO);
    expect(rest.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/items-compra/filtrar-articulos/1/a');
    service.buscarPorArticulo(1, 'a', TipoBusqueda.NROITEM);
    expect(rest.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/items-compra/filtrar-nroitem/1/a');
  });
});
