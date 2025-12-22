import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { PuntosRecepcionService } from '../../../services/puntosRecepcion.service';
import { ResponsablesPuntoRecepcionComponent } from './responsables-punto-recepcion.component';

describe('ResponsablesPuntoRecepcionComponent', () => {
  let component: ResponsablesPuntoRecepcionComponent;
  let fixture: ComponentFixture<ResponsablesPuntoRecepcionComponent>;

  const modalSpy = jasmine.createSpyObj('BsModalService', ['show', 'hide']);
  const routeStub = { params: of({ idPC: '5' }) } as Partial<ActivatedRoute>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  const puntoRecepcionServiceSpy = jasmine.createSpyObj('PuntosRecepcionService', ['obtenerPuntoRecepcion', 'obtenerResponsablesPuntoRecepcion']);

  beforeEach(async () => {
  // Mock the responsables call used by the component
  puntoRecepcionServiceSpy.obtenerResponsablesPuntoRecepcion.and.returnValue(of({ page: { totalElements: 0 }, content: [] }));

    await TestBed.configureTestingModule({
      declarations: [ResponsablesPuntoRecepcionComponent],
      providers: [
        { provide: BsModalService, useValue: modalSpy },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: Router, useValue: routerSpy },
        { provide: PuntosRecepcionService, useValue: puntoRecepcionServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
      .overrideComponent(ResponsablesPuntoRecepcionComponent, { set: { template: '' } })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResponsablesPuntoRecepcionComponent);
    component = fixture.componentInstance;
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar y ejecutar las búsquedas cuando hay id', () => {
    const buscarSpy = spyOn(component, 'buscar');
    const puntoSpy = spyOn(component, 'obtenerPuntoRecepcion');
    component.ngOnInit();
    expect(component.idPuntoRecepcion).toBe(5);
    expect(buscarSpy).toHaveBeenCalled();
    expect(puntoSpy).toHaveBeenCalled();
  });

  it('debe obtener los funcionarios y actualizar la paginación', fakeAsync(() => {
    component.idPuntoRecepcion = 5;
    component.buscar();
    tick();
    expect(puntoRecepcionServiceSpy.obtenerResponsablesPuntoRecepcion).toHaveBeenCalled();
    expect(component.funcionarios).toEqual([]);
    expect(component.total).toBe(0);
  }));

  it('debe obtener el punto de recepción', fakeAsync(() => {
    const punto = { id: 5, nombre: 'Punto 1' } as any;
    puntoRecepcionServiceSpy.obtenerPuntoRecepcion.and.returnValue(of(punto));
    component.idPuntoRecepcion = 5;
    component.obtenerPuntoRecepcion();
    tick();
    expect(puntoRecepcionServiceSpy.obtenerPuntoRecepcion).toHaveBeenCalledWith(5);
    expect(component.puntoRecepcion).toEqual(punto);
  }));

  it('no debe buscar el punto si no hay id definido', () => {
    component.idPuntoRecepcion = undefined as any;
    puntoRecepcionServiceSpy.obtenerPuntoRecepcion.calls.reset();
    component.obtenerPuntoRecepcion();
    expect(puntoRecepcionServiceSpy.obtenerPuntoRecepcion).not.toHaveBeenCalled();
  });

  it('debe navegar al listado al invocar volver', () => {
    component.volver();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/administracion/puntos-recepcion'], { queryParams: { volver: 1 } });
  });

  it('debe cambiar la página y llamar a buscar', () => {
    const buscarSpy = spyOn(component, 'buscar');
    component.cambioPagina(2);
    expect(component.parametros.pagina).toBe(2);
    component.cambioPorPagina(20);
    expect(component.parametros.pagina).toBe(0);
    expect(component.parametros.tamanoPagina).toBe(20);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debe cambiar el tamaño de página y llamar a buscar', () => {
    const buscarSpy = spyOn(component, 'buscar');
    component.cambioPorPagina(50);
    expect(component.parametros.pagina).toBe(0);
    expect(component.parametros.tamanoPagina).toBe(50);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debe cambiar el orden y la columna de orden', () => {
    const buscarSpy = spyOn(component, 'buscar');
    component.cambioOrden('desc');
    component.cambioColumnaOrden('usuarioOrganismo.usuario.nroDocumento');
    expect(component.parametros.order).toBe('desc');
    expect(component.parametros.sort).toBe('usuarioOrganismo.usuario.nroDocumento');
    expect(buscarSpy.calls.count()).toBe(2);
  });
});

