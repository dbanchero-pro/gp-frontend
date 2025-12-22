import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { SeguridadService } from '../../services/common/seguridad.service';
import { AccionBoton, BotonAccionComponent } from './boton-accion.component';

describe('BotonAccionComponent', () => {
  let component: BotonAccionComponent;
  let fixture: ComponentFixture<BotonAccionComponent>;
  let seguridadMock: jasmine.SpyObj<SeguridadService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    seguridadMock = jasmine.createSpyObj('SeguridadService', ['tienePermiso']);
    routerMock = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [BotonAccionComponent],
      providers: [
        { provide: SeguridadService, useValue: seguridadMock },
        { provide: Router, useValue: routerMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BotonAccionComponent);
    component = fixture.componentInstance;
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería asignar accionPrincipal y opcionesMenu según permisos', () => {
    seguridadMock.tienePermiso.and.returnValue(true);

    const acciones: AccionBoton[] = [
      { nombre: 'Principal', clase: '', icono: '', permisos: ['P1'] },
      { nombre: 'Opción extra', clase: '', icono: '', permisos: ['P2'] }
    ];

    component.acciones = acciones;
    component.ngOnInit();

    expect(component.accionPrincipal?.nombre).toBe('Principal');
    expect(component.opcionesMenu.length).toBe(1);
    expect(component.opcionesMenu[0].nombre).toBe('Opción extra');
  });

  it('debería filtrar acciones sin permisos definidos', () => {
    const acciones: AccionBoton[] = [
      { nombre: 'Sin permiso', clase: '', icono: '' }
    ];

    const resultado = component.filtrarAccionesPorPermiso(acciones);
    expect(resultado.length).toBe(1);
  });

  it('debería no mostrar acciones con permisos no otorgados', () => {
    seguridadMock.tienePermiso.and.returnValue(false);

    const acciones: AccionBoton[] = [
      { nombre: 'Privado', clase: '', icono: '', permisos: ['NO_ACCESS'] }
    ];

    const resultado = component.filtrarAccionesPorPermiso(acciones);
    expect(resultado.length).toBe(0);
  });

  it('debería evaluar permisos utilizando subacciones', () => {
    seguridadMock.tienePermiso.and.returnValue(true);

    const acciones: AccionBoton[] = [{
      nombre: 'Padre',
      clase: '',
      icono: '',
      acciones: [{ nombre: 'Hija', clase: '', icono: '', permisos: ['PERMISO_OK'] }]
    }];

    const resultado = component.filtrarAccionesPorPermiso(acciones);

    expect(resultado.length).toBe(1);
    expect(seguridadMock.tienePermiso).toHaveBeenCalledWith('PERMISO_OK');
  });

  it('debería descartar acciones sin subacciones permitidas', () => {
    seguridadMock.tienePermiso.and.returnValue(false);

    const acciones: AccionBoton[] = [{
      nombre: 'Padre',
      clase: '',
      icono: '',
      acciones: [{ nombre: 'Hija', clase: '', icono: '', permisos: ['PERMISO_DENEGADO'] }]
    }];

    const resultado = component.filtrarAccionesPorPermiso(acciones);

    expect(resultado.length).toBe(0);
  });

  it('debería navegar cuando la acción tiene url', () => {
    const stopSpy = jasmine.createSpy('stopPropagation');
    const evento = { stopPropagation: stopSpy } as unknown as Event;
    const accion: AccionBoton = { nombre: 'Ir', clase: '', icono: '', url: ['/ruta'] };

    component.ejecutarAccion(accion, evento);

    expect(stopSpy).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/ruta']);
  });

  it('debería ejecutar acción y emitir evento', () => {
    const accionMock = jasmine.createSpy('accion');
    const emitSpy = spyOn(component.accionEjecutada, 'emit');

    const accion: AccionBoton = {
      nombre: 'ClickMe',
      clase: '',
      icono: '',
      accion: accionMock
    };

    component.ejecutarAccion(accion, new Event('click'));

    expect(accionMock).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(accion);
  });

  it('tieneOpcionesMenu debería devolver true si hay opciones extra', () => {
    component.opcionesMenu = [{ nombre: 'Sub', clase: '', icono: '' }];
    expect(component.tieneOpcionesMenu()).toBeTrue();
  });

  it('tieneOpcionesMenu debería devolver false si no hay opciones extra', () => {
    component.opcionesMenu = [];
    expect(component.tieneOpcionesMenu()).toBeFalse();
  });
});
