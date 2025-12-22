import { ItemOrdenCompraResumenPipe } from './item-orden-compra-resumen.pipe';

describe('ItemOrdenCompraResumenPipe', () => {
  const pipe = new ItemOrdenCompraResumenPipe();

  it('crea la descripción completa', () => {
    const item: any = { nroItem: 1, descArticulo: 'Desc', codArticulo: 'X' };
    expect(pipe.transform(item)).toBe('Ítem Nº 1 - Desc (Cód. Artículo X)');
  });

  it('devuelve vacío si no hay item', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('tolera propiedades faltantes', () => {
    const item: any = { };
    expect(pipe.transform(item)).toBe('Ítem Nº  -  (Cód. Artículo )');
  });
});
