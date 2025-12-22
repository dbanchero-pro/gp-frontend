import { registerLocaleData } from '@angular/common';
import localeEsUY from '@angular/common/locales/es-UY';
import { TestBed } from '@angular/core/testing';
import { FechaPipe } from './fecha.pipe';

describe('FechaPipe', () => {
  let pipe: FechaPipe;

  beforeEach(() => {
    registerLocaleData(localeEsUY, 'es-UY');
    TestBed.configureTestingModule({
      providers: [FechaPipe],
      
    });

    pipe = TestBed.inject(FechaPipe);
  });

  it('debería crearse', () => {
    expect(pipe).toBeTruthy();
  });

  it('debe transformar la fecha con formato por defecto', () => {
    const date = new Date('2022-01-01T12:34:56');
    const result = pipe.transform(date);
    expect(result).toBe('01/01/2022');
  });

  it('debe transformar la fecha con formato personalizado', () => {
    const date = new Date('2022-01-01T12:34:56');
    pipe.format = 'dd-MM-yyyy';
    const result = pipe.transform(date);
    expect(result).toBe('01-01-2022');
  });

  it('debe transformar la fecha con formato guion', () => {
    const date = new Date('2022-01-01T12:34:56');
    const result = pipe.transformGuion(date);
    expect(result).toBe('2022-01-01');
  });

  it('debe transformar la fecha con formato guion personalizado', () => {
    const date = new Date('2022-01-01T12:34:56');
    pipe.format = 'yyyy/MM/dd';
    const result = pipe.transformGuion(date);
    expect(result).toBe('2022/01/01');
  });
});