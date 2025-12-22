import { GrupoColapsableComponent, GrupoColapsableTituloComponent, GrupoColapsableContenidoComponent } from './grupo-colapsable.component';

describe('GrupoColapsableComponent', () => {
  it('debería crearse con valores por defecto', () => {
    const comp = new GrupoColapsableComponent();
    expect(comp.colapsado).toBeFalse();
    expect(comp.classContenido).toBe('mr-2 pr-2 pb-2');
  });

  it('debería permitir asignar valores', () => {
    const comp = new GrupoColapsableComponent();
    comp.titulo = 'Titulo';
    comp.ariaLabel = 'Aria';
    comp.colapsado = true;
    comp.class = 'clase';
    comp.classContenido = 'contenido';
    comp.classTitulo = 'titulo';
    expect(comp.titulo).toBe('Titulo');
    expect(comp.ariaLabel).toBe('Aria');
    expect(comp.colapsado).toBeTrue();
    expect(comp.class).toBe('clase');
    expect(comp.classContenido).toBe('contenido');
    expect(comp.classTitulo).toBe('titulo');
  });
});

describe('Componentes auxiliares', () => {
  it('deberían crearse sin problemas', () => {
    expect(new GrupoColapsableTituloComponent()).toBeTruthy();
    expect(new GrupoColapsableContenidoComponent()).toBeTruthy();
  });
});
