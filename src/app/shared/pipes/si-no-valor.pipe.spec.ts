import { TestBed } from '@angular/core/testing';
import { SiNoValor } from '../enum/si-no-valor.enum';
import { SiNoValorPipe } from './si-no-valor.pipe';

describe('SiNoValorPipe', () => {
  let pipe: SiNoValorPipe;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SiNoValorPipe] });
    pipe = TestBed.inject(SiNoValorPipe);
  });

  it('devuelve "Si" cuando el valor es SI', () => {
    expect(pipe.transform(SiNoValor.SI)).toBe('Si');
  });

  it('devuelve "No" cuando el valor es NO', () => {
    expect(pipe.transform(SiNoValor.NO)).toBe('No');
  });

  it('retorna cadena vacía si el valor no coincide', () => {
    expect(pipe.transform('X')).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
