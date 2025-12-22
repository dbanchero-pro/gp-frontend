import { ItemEstadoPipe } from './item-estado.pipe';
import { EstadoItemOrdenCompra } from '../enum/estado-item-orden-compra';

describe('ItemEstadoPipe', () => {
  const pipe = new ItemEstadoPipe();

  it('devuelve vacío cuando el estado no existe', () => {
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(null)).toBe('');
  });

  it('devuelve "Pendiente" cuando el estado es pendiente', () => {
    expect(pipe.transform(EstadoItemOrdenCompra.PENDIENTE)).toBe('Pendiente');
  });

  it('devuelve "Conformidad emitida" cuando el estado tiene conformidad', () => {
    expect(pipe.transform(EstadoItemOrdenCompra.CONFORMIDAD_EMITIDA)).toBe('Conformidad emitida');
  });
});
