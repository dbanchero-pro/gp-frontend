import { PuntoRecepcionResumenPipe } from './punto-recepcion-resumen.pipe';

describe('PuntoRecepcionResumenPipe', () => {
  const pipe = new PuntoRecepcionResumenPipe();

  it('debería devolver cadena vacía si el punto es nulo', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });

  it('debería concatenar nombre y zona', () => {
    const punto = { nombre: 'P1', zona: { descripcionZona: 'Z1' } } as any;
    expect(pipe.transform(punto)).toBe('P1 | Z1');
  });

  it('debería filtrar valores nulos', () => {
    const punto = { nombre: 'SoloNombre' } as any;
    expect(pipe.transform(punto)).toBe('SoloNombre');
  });
});
