import { registerLocaleData } from '@angular/common';
import localeEsUY from '@angular/common/locales/es-UY';
import { TestBed } from '@angular/core/testing';
import { FechaHoraPipe } from './fecha-hora.pipe';

describe('FechaHoraPipe', () => {
  let pipe: FechaHoraPipe;

  beforeEach(() => {
    registerLocaleData(localeEsUY, 'es-UY');
    TestBed.configureTestingModule({
      providers: [FechaHoraPipe],
      
    });

    pipe = TestBed.inject(FechaHoraPipe);
  });

  it('debería crearse', () => {
    expect(pipe).toBeTruthy();
  });

  it('debe transformar la fecha con formato por defecto', () => {
    const date = new Date('2022-01-01T12:34:56');
    const result = pipe.transform(date);
    expect(result).toBe('01/01/2022 12:34:56');
  });

  it('debe transformar la fecha con formato personalizado', () => {
    const date = new Date('2022-01-01T12:34:56');
    pipe.format = 'dd-MM-yyyy HH:mm:ss';
    const result = pipe.transform(date);
    expect(result).toBe('01-01-2022 12:34:56');
  });

  it('debe transformar la fecha con formato guion', () => {
    const date = new Date('2022-01-01T12:34:56');
    const result = pipe.transformGuion(date);
    expect(result).toBe('2022-01-01 12:34:56');
  });

  it('debe transformar la fecha con formato guion personalizado', () => {
    const date = new Date('2022-01-01T12:34:56');
    pipe.format = 'yyyy/MM/dd HH:mm:ss';
    const result = pipe.transformGuion(date);
    expect(result).toBe('2022/01/01 12:34:56');
  });
});