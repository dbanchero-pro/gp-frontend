import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { CabezalConsultaComponent } from './cabezal-consulta.component';

describe('HeaderOrderComponent', () => {
  let component: CabezalConsultaComponent;
  let fixture: ComponentFixture<CabezalConsultaComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CabezalConsultaComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CabezalConsultaComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería emitir evento al cambiar orden', () => {
    const spy = spyOn(component.orderChange, 'emit');
    component.orden = 'asc';

    component.orderChanged();

    expect(component.orden).toBe('desc');
    expect(spy).toHaveBeenCalledWith('desc');

    component.orderChanged();
    expect(component.orden).toBe('asc');
    expect(spy).toHaveBeenCalledWith('asc');
  });

  it('debería emitir evento sortChange al cambiar columna', () => {
    const spy = spyOn(component.sortChange, 'emit');
    const mockEvent = { target: { value: 'nombre' } };

    component.sortChanged(mockEvent);

    expect(spy).toHaveBeenCalledWith('nombre');
  });

  it('debería navegar al hacer click en el botón si showBtn está activo', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.routerLinkBtn = ['/test'];

    component.navBtn();

    expect(navigateSpy).toHaveBeenCalledWith(['/test']);
  });

  it('debería tener valores por defecto correctos', () => {
    expect(component.columnaOrden).toBe('');
    expect(component.titulo).toBe('');
    expect(component.subtitulo).toBe('');
    expect(component.listaOrden).toEqual([]);
    expect(component.orden).toBe('asc');
    expect(component.textoBoton).toBe('');
    expect(component.mostrarBoton).toBe(false);
    expect(component.routerLinkBtn).toEqual(['']);
  });

  it('ngOnChanges asigna titulo y mensajes con totalItems 0', () => {
    component.titulo = '';
    component.totalItems = 0;
    component.ngOnChanges({
      titulo: { currentValue: 'algo', previousValue: 'algo', firstChange: false, isFirstChange: () => false },
    });
    expect(component.titulo).toBe('Resultado de la búsqueda');
    expect(component.subtitulo).toBe('No se encontraron resultados.');
  });

  it('ngOnChanges asigna mensajes con un resultado', () => {
    component.titulo = '';
    component.totalItems = 1;
    component.ngOnChanges({
      titulo: { currentValue: 'algo', previousValue: 'algo', firstChange: false, isFirstChange: () => false },
    });
    expect(component.subtitulo).toBe('Se encontró 1 resultado.');
  });

  it('ngOnChanges asigna mensajes con multiples resultados', () => {
    component.titulo = '';
    component.totalItems = 5;
    component.ngOnChanges({
      titulo: { currentValue: 'algo', previousValue: 'algo', firstChange: false, isFirstChange: () => false },
    });
    expect(component.subtitulo).toBe('Se encontraron 5 resultados.');
  });


  it('ngOnChanges limpia titulo y subtitulo cuando totalItems negativo', () => {
    component.titulo = 'algo';
    component.subtitulo = 'sub';
    component.totalItems = -1;
    component.ngOnChanges({
      titulo: { currentValue: 'algo', previousValue: 'algo', firstChange: false, isFirstChange: () => false },
    });
    expect(component.titulo).toBe('algo');
    expect(component.subtitulo).toBe('');
  });
});
