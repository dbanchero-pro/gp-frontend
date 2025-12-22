import { TestBed } from '@angular/core/testing';
import { NombresTipoValorPipe } from './nombres-tipo-valor.pipe';

describe('NombresTipoValorPipe', () => {
  let pipe: NombresTipoValorPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [NombresTipoValorPipe] });
    pipe = TestBed.inject(NombresTipoValorPipe);
  });

  it('mapea valores de tipo', () => {
    expect(pipe.transform(2)).toBe('Texto');
    expect(pipe.transform(1)).toBe('Numérico');
    expect(pipe.transform(4)).toBe('Fecha');
    expect(pipe.transform(3)).toBe('Si/No');
  });

  it('retorna vacío para valores desconocidos', () => {
    expect(pipe.transform(9)).toBe('');
  });
});
