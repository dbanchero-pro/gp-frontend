import { DecimalPipe, registerLocaleData } from '@angular/common';
import localeEsUY from '@angular/common/locales/es-UY';
import { LOCALE_ID } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { IPuntoRecepcionDTO } from '../../../models/punto-recepcion.model';
import { IZonaDTO } from '../../../models/zona.model';
import { PuntosRecepcionService } from '../../../services/puntosRecepcion.service';
import { ElementosPuntosRecepcionComponent } from './elementos-puntos-recepcion.component';

const puntoMock: IPuntoRecepcionDTO = {
  id: 1,
  idInciso: 1,
  descInciso: 'Inciso 1',
  idUnidadEjecutora: 10,
  descUnidadEjecutora: 'Unidad Ejecutora 10',
  idUnidadCompra: 100,
  descUnidadCompra: 'Unidad Compra 100',
  nombre: 'Punto 1',
  direccion: 'Calle Falsa 123',
  telefonos: '123456;7891011',
  correosElectronicos: 'correo1@test.com;correo2@test.com',
  horarios: 'Lunes a Viernes 9 a 17',
  zona: { id: 1, descripcionZona: 'Zona Norte' } as IZonaDTO,
  localidad: 'Montevideo',
  observaciones: 'Ninguna',
  latitud: -34.90,
  longitud: -56.19,
  fechaBaja: undefined
};

describe('ElementosPuntosRecepcionComponent', () => {
  let component: ElementosPuntosRecepcionComponent;
  let fixture: ComponentFixture<ElementosPuntosRecepcionComponent>;
  let puntosRecepcionService: jasmine.SpyObj<PuntosRecepcionService>;
  let actualizarService: jasmine.SpyObj<ActualizarService>;
  beforeAll(() => {
    // 1) Registra el locale antes de inicializar TestBed
    registerLocaleData(localeEsUY, 'es-UY');
  });
  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('PuntosRecepcionService', ['inhabilitarPuntoRecepcion', 'habilitarPuntoRecepcion', 'cargando']);
    serviceSpy.inhabilitarPuntoRecepcion.and.returnValue(of({}));
    serviceSpy.habilitarPuntoRecepcion.and.returnValue(of({}));
    serviceSpy.cargando = false; // Simula que no está cargando
    const actualizarSpy = jasmine.createSpyObj('ActualizarService', [
      'mensajeCorrecto',
      'mensajeError'
    ], {
      cargando(): void { },
      confirmar$: { next: jasmine.createSpy('next') },
      confirmar: jasmine.createSpy('confirmar').and.callFake((texto: string[], accion: () => void, cancelar?: () => void) => {
        accion(); // Simula la acción de confirmación
      }),

    });

    await TestBed.configureTestingModule({
      declarations: [ElementosPuntosRecepcionComponent],
      imports: [SharedModule, BrowserAnimationsModule],
      providers: [
        { provide: LOCALE_ID, useValue: 'es-UY' },
        DecimalPipe,
        { provide: PuntosRecepcionService, useValue: serviceSpy },
        { provide: ActualizarService, useValue: actualizarSpy },
        { provide: SeguridadService, useValue: {
            usuarioLogueadoEsUsuarioOrganismo: () => false,
            tienePermiso: (permiso: string) => true,
            tieneAlgunPermiso: (permisos: string[]) => true
          }
        },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ElementosPuntosRecepcionComponent);
    component = fixture.componentInstance;
    puntosRecepcionService = TestBed.inject(PuntosRecepcionService) as jasmine.SpyObj<PuntosRecepcionService>;
    actualizarService = TestBed.inject(ActualizarService) as jasmine.SpyObj<ActualizarService>;
    component.puntoRecepcion = { ...puntoMock };
    component.navegarResponsables = jasmine.createSpy('navegarResponsables');


    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar acciones si NO está eliminado', () => {
    component.puntoRecepcion.fechaBaja = undefined;
    component.ngOnChanges();

    expect(component.acciones.length).toBe(3);
    expect(component.acciones[0].nombre).toBe('Modificar');

  });

  it('debe cargar acción "Habilitar" si está eliminado', () => {
    component.puntoRecepcion.fechaBaja = new Date('2000-01-01');
    component.ngOnChanges();
    expect(component.acciones.length).toBe(1);
    expect(component.acciones[0].nombre).toBe('Habilitar');
  });

  it('debe emitir confirmación al inhabilitar', () => {
    component.inhabilitarElemento(9);

    expect(actualizarService.confirmar).toHaveBeenCalled();
  });

  it('debe llamar servicio y emitir evento al inhabilitar', fakeAsync(() => {
    const emitSpy = spyOn(component.puntoModificado, 'emit');
    puntosRecepcionService.inhabilitarPuntoRecepcion.and.returnValue(of({}));
    component.inhabilitarPuntoRecepcion(1);
    tick(1000);

    expect(puntosRecepcionService.inhabilitarPuntoRecepcion).toHaveBeenCalledWith(puntoMock.id!);
    expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(1);
  }));

  it('debe manejar error al inhabilitar', () => {
    puntosRecepcionService.inhabilitarPuntoRecepcion.and.returnValue(throwError(() => new Error('fail')));
    component.inhabilitarPuntoRecepcion(1);
    expect(actualizarService.mensajeError).toHaveBeenCalled();
  });

  it('debe calcular inhabilitado y clase correctamente', () => {
    component.puntoRecepcion.fechaBaja = new Date('2000-01-01');
    expect(component.inhabilitado).toBeTrue();
    expect(component.claseInhabilitado).toBe('inhabilitado');
  });

  it('debe confirmar habilitar elemento', () => {
    component.habilitarElemento(1);
    expect(actualizarService.confirmar).toHaveBeenCalled();
  });

  it('debe llamar servicio y emitir evento al habilitar', fakeAsync(() => {
    const emitSpy = spyOn(component.puntoModificado, 'emit');
    puntosRecepcionService.habilitarPuntoRecepcion.and.returnValue(of({}));
    component.habilitarPuntoRecepcion(1);
    tick(1000);
    expect(puntosRecepcionService.habilitarPuntoRecepcion).toHaveBeenCalledWith(1);
    expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(1);
  }));

  it('debe manejar error al habilitar', () => {
    puntosRecepcionService.habilitarPuntoRecepcion.and.returnValue(throwError(() => new Error('fail')));
    component.habilitarPuntoRecepcion(1);
    expect(actualizarService.mensajeError).toHaveBeenCalled();
  });


  it('debe dividir correctamente los correos', () => {
    component.puntoRecepcion = { ...puntoMock, correosElectronicos: 'correo1@test.com;correo2@test.com' };
    component.ngOnChanges();
    expect(component.correos).toEqual(['correo1@test.com', 'correo2@test.com']);
  });
});