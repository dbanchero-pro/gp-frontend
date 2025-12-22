import { ordenarMultipleYPaginar, ordenarYPaginar } from './paginador';

interface Obj { id: number; nombre?: string | null; fecha?: Date | null; }

describe('paginador', () => {
  const items: Obj[] = [
    { id: 3, nombre: 'c' },
    { id: 1, nombre: 'a' },
    { id: 2 },
    { id: 4, nombre: 'd' }
  ];

  it('ordena ascendente y pagina correctamente', () => {
    const res = ordenarYPaginar(items, 0, 2, 'id', 'asc');
    expect(res[0].id).toBe(1);
    expect(res.length).toBe(2);
  });

  it('ordena descendente considerando null', () => {
    const res = ordenarYPaginar(items, 1, 2, 'nombre', 'desc');
    expect(res[0].nombre).toBe('a');
    expect(res[1].nombre).toBeUndefined();
  });

  it('mantiene la posición relativa cuando ambos valores son nulos', () => {
    const data: Obj[] = [
      { id: 1, nombre: null },
      { id: 2, nombre: null }
    ];
    const res = ordenarYPaginar(data, 0, 2, 'nombre', 'desc');
    expect(res.map(i => i.id)).toEqual([1, 2]);
  });

  it('ordenarYPaginar deja los nulos al inicio en orden ascendente', () => {
    const data: Obj[] = [
      { id: 1, nombre: null },
      { id: 2, nombre: 'a' }
    ];
    const res = ordenarYPaginar(data, 0, 2, 'nombre', 'asc');
    expect(res[0].nombre).toBeNull();
  });

  it('ordena por multiples columnas en forma ascendente', () => {
    const data: Obj[] = [
      { id: 2, nombre: 'b' },
      { id: 1, nombre: 'b' },
      { id: 3, nombre: 'a' }
    ];
    const res = ordenarMultipleYPaginar(data, 0, 3, ['nombre', 'id'], 'asc');
    expect(res.map(i => i.id)).toEqual([3, 1, 2]);
  });

  it('ordena por multiples columnas en forma descendente con nulls', () => {
    const data: Obj[] = [
      { id: 1, nombre: null },
      { id: 3, nombre: 'b' },
      { id: 2, nombre: 'b' }
    ];
    const res = ordenarMultipleYPaginar(data, 0, 3, ['nombre', 'id'], 'desc');
    expect(res.map(i => i.id)).toEqual([3, 2, 1]);
  });

  it('continúa con la siguiente columna cuando ambas tienen valores nulos', () => {
    const data: Obj[] = [
      { id: 2, nombre: null },
      { id: 1, nombre: null }
    ];
    const res = ordenarMultipleYPaginar(data, 0, 2, ['nombre', 'id'], 'asc');
    expect(res.map(i => i.id)).toEqual([1, 2]);
  });

  it('ordena utilizando fechas convirtiéndolas a tiempo', () => {
    const data: Obj[] = [
      { id: 1, fecha: new Date('2024-01-02') },
      { id: 2, fecha: new Date('2024-01-01') },
      { id: 3, fecha: new Date('2024-01-03') }
    ];
    const res = ordenarMultipleYPaginar(data, 0, 3, ['fecha'], 'desc');
    expect(res.map(i => i.id)).toEqual([3, 1, 2]);
  });
});
