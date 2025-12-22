import { TestBed } from '@angular/core/testing';
import { CompraDTO } from '../models/compra.model';
import { CompraResumenPipe } from './compra-resumen.pipe';

describe('CompraResumenPipe', () => {
  let pipe: CompraResumenPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [CompraResumenPipe] });
    pipe = TestBed.inject(CompraResumenPipe);
  });

  it('retorna cadena vacia si no hay compra', () => {
    expect(pipe.transform(null)).toBe('');
  });

  it('formatea unidad y detalle correctamente', () => {
    const compra: Partial<CompraDTO> = {
      numCompra: 1,
      anioCompra: 2024,
      subtipoCompra: { descTipoCompra: 'Compra' } as any,
      unidadCompra: { descInciso: 'I', descUnidadEjecutora: 'UE', descUnidadCompra: 'UC' } as any
    };
    const result = pipe.transform(compra, 'full');
    expect(result).toContain('I');
    expect(result).toContain('Nº 1/2024');
  });

  it('formatea solo la unidad', () => {
    const compra: Partial<CompraDTO> = {
      unidadCompra: { descInciso: 'I', descUnidadEjecutora: 'UE', descUnidadCompra: 'UC' } as any
    };
    const result = pipe.transform(compra, 'unidad');
    expect(result).toBe('I | UE | UC: UC');
  });

  it('formatea el detalle con ampliación', () => {
    const compra: Partial<CompraDTO> = {
      subtipoCompra: { descTipoCompra: 'Compra' } as any,
      numCompra: 1,
      anioCompra: 2024,
      nroAmpliacion: 5
    };
    const result = pipe.transform(compra, 'detalle');
    expect(result).toBe('Compra Nº 1/2024 | Nº ampliación/renovación: 5');
  });

  it('formatea el detalle en html', () => {
    const compra: Partial<CompraDTO> = {
      subtipoCompra: { descSubtipoCompra: 'subtipoCompra', descTipoCompra: 'tipoCompra' } as any,
      numCompra: 1,
      anioCompra: 2024,
      nroAmpliacion: 5
    };
    const result = pipe.transform(compra, 'detalleHtml');
    expect(result).toBe('<strong>tipoCompra | subtipoCompra Nº 1/2024</strong> | Nº ampliación/renovación: <strong>5</strong>');
  });
});
