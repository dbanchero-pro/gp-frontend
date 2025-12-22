import { UnidadCompraResumenPipe } from './unidad-compra-resumen.pipe';

describe('UnidadCompraResumenPipe', () => {
  const pipe = new UnidadCompraResumenPipe();

  it('debe devolver la cadena vacía cuando la unidad es nula', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debe unir todas las descripciones', () => {
    const unidad: any = {
      descInciso: 'I',
      descUnidadEjecutora: 'UE',
      descUnidadCompra: 'UC'
    };
    expect(pipe.transform(unidad)).toBe('I | UE | UC');
  });

  it('debe omitir descripciones vacías', () => {
    const unidad: any = {
      descInciso: 'I',
      descUnidadEjecutora: '',
      descUnidadCompra: 'UC'
    };
    expect(pipe.transform(unidad)).toBe('I | UC');
  });
});
