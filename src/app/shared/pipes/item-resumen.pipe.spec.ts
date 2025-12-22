import { TestBed } from '@angular/core/testing';
import { ItemResumenPipe } from './item-resumen.pipe';
import { ItemCompraDto } from '../models/item-compra.model';

describe('ItemResumenPipe', () => {
  let pipe: ItemResumenPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ItemResumenPipe] });
    pipe = TestBed.inject(ItemResumenPipe);
  });

  it('genera resumen del item', () => {
    const item: ItemCompraDto = { nroItem: 2, descArticulo: 'Desc', codArticulo: '1' } as any;
    expect(pipe.transform(item)).toBe('Ítem Nº 2 - Desc (Cód. Artículo 1)');
  });

  it('retorna cadena vacía si no existe item', () => {
    expect(pipe.transform(undefined)).toBe('');
  });

  it('maneja valores faltantes', () => {
    const item: ItemCompraDto = { nroItem: undefined, descArticulo: undefined, codArticulo: undefined } as any;
    expect(pipe.transform(item)).toBe('Ítem Nº  -  (Cód. Artículo )');
  });
});
