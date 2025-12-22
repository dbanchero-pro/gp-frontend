import { EntregableResumenPipe } from './entregable-resumen.pipe';

describe('EntregableResumenPipe', () => {
  const pipe = new EntregableResumenPipe();

  it('devuelve resumen', () => {
    expect(pipe.transform({ codEntregable: 'C', descEntregable: 'N' } as any)).toBe('C - N');
  });

  it('devuelve vacío si no hay entregable', () => {
    expect(pipe.transform(null)).toBe('');
  });
});
