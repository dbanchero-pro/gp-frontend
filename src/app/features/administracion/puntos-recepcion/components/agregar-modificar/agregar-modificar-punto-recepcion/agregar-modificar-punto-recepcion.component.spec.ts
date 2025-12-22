import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NgZone, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { BsModalRef, BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { UsuarioOrganismoService } from 'src/app/shared/services/usuario/usuario-organismo.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { ZonaService } from 'src/app/shared/services/zona.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { FuncionarioPuntoRecepcionService } from '../../../services/funcionario-punto-recepcion.service';
import { PuntosRecepcionService } from '../../../services/puntosRecepcion.service';
import { AgregarModificarPuntoRecepcionComponent } from './agregar-modificar-punto-recepcion.component';

export const mockModalService = {
  show: () => {
    const ref = new BsModalRef();
    ref.content = {};
    return ref;
  },
  hide: () => { },
}
describe('AgregarModificarPuntoRecepcionComponent', () => {
  let component: AgregarModificarPuntoRecepcionComponent;
  let fixture: ComponentFixture<AgregarModificarPuntoRecepcionComponent>;

  let mockPuntoRecepcionService: jasmine.SpyObj<PuntosRecepcionService>;
  let mockActualizarService: jasmine.SpyObj<ActualizarService>;
  let mockZonaService: jasmine.SpyObj<ZonaService>;
  let mockFuncionarioService: jasmine.SpyObj<FuncionarioPuntoRecepcionService>;
  let mockUsuarioService: jasmine.SpyObj<UsuarioOrganismoService>;

  beforeEach(async () => {
    mockPuntoRecepcionService = jasmine.createSpyObj('PuntosRecepcionService', ['obtenerPuntoRecepcion', 'altaPuntoRecepcion', 'modificarPuntoRecepcion']);
    mockActualizarService = jasmine.createSpyObj('ActualizarService', ['subTitulo', 'titulo', 'estado', 'mensajeCorrecto', 'mensajeError', 'showMsgError', 'cargando', 'mensajeOcultar', 'guardarMensajeTemporal', 'confirmar']);
    mockZonaService = jasmine.createSpyObj('ZonaService', ['obtenerZonas']);
    mockFuncionarioService = jasmine.createSpyObj('FuncionarioPuntoRecepcionService', ['guardarFuncionario', 'obtenerFuncionariosPorPuntoRecepcion', 'eliminarFuncionario']);
    mockUsuarioService = jasmine.createSpyObj('UsuarioOrganismoService', ['obtenerUsuariosOrganismo']);

    mockZonaService.obtenerZonas.and.returnValue(of([]));
    mockPuntoRecepcionService.altaPuntoRecepcion.and.returnValue(of({}));
    mockPuntoRecepcionService.modificarPuntoRecepcion.and.returnValue(of({}));
    mockFuncionarioService.obtenerFuncionariosPorPuntoRecepcion.and.returnValue(of([]));
    mockFuncionarioService.guardarFuncionario.and.returnValue(of({}));
    mockFuncionarioService.eliminarFuncionario.and.returnValue(of({}));


    await TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        FormsModule,
        ModalModule.forRoot(),
        SharedModule
      ],
      declarations: [AgregarModificarPuntoRecepcionComponent],
      providers: [
        { provide: PuntosRecepcionService, useValue: mockPuntoRecepcionService },
        { provide: ActualizarService, useValue: mockActualizarService },
        { provide: SeguridadService, useValue: {
          obtenerTipoUsuario: () => of(TipoUsuario.ORGANISMO),
          tienePermiso: (permiso: string) => true,
          tieneAlgunPermiso: (permisos: string[]) => true
        } },
        { provide: ZonaService, useValue: mockZonaService },
        { provide: FuncionarioPuntoRecepcionService, useValue: mockFuncionarioService },
        { provide: UsuarioService, useValue: mockUsuarioService },
        { provide: BsModalService, useValue: mockModalService },
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.inject(NgZone).run(() => { });
    fixture = TestBed.createComponent(AgregarModificarPuntoRecepcionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario correctamente', fakeAsync(() => {
    const puntoRecepcion = {
      id: 1,
      nombre: 'Test Punto',
      direccion: 'Dirección 123',
      telefonos: '099090909',
      correosElectronicos: 'correo@ejemplo.com;correo2@ejemplo.com',
      horarios: 'Lun a Vie',
      localidad: 'Montevideo',
      zona: { id: 1 },
      observaciones: '',
      latitud: 1,
      longitud: 1,

      codigoPostal: 12345,
      unidadCompra: {
        idInciso: 1,
        idUnidadEjecutora: 2,
        idUnidadCompra: 3,
      }
    };
    component.idPc = 1;
    component.modoIngreso = false;
    mockPuntoRecepcionService.obtenerPuntoRecepcion.and.returnValue(of(puntoRecepcion));

    component.cargarFormulario();
    tick();
    fixture.detectChanges();
    expect(component.form.valid).toBeTrue();
    expect(component.form.get('nombre')?.value).toBe('Test Punto');
    flush();
  }));

  
  it('debería cargar zonas correctamente', fakeAsync(() => {
    const zonas = [
      { id: 1, descripcionZona: 'Zona 1', dadoBaja: false },
      { id: 2, descripcionZona: 'Zona 2', dadoBaja: false }
    ];

    mockZonaService.obtenerZonas.and.returnValue(of(zonas));

    if (component.cargarDepartamentos) {
      component.cargarDepartamentos();
      expect(component.opcionesZona).toEqual(zonas);
    }
  }));


  it('debería retornar DTO con strings vacíos si los datos de descripción vienen nulos', fakeAsync(() => {
    component.form = component['formBuilder'].group({
      nomPuntoRecepcion: ['Punto X'],
      direccion: ['Calle Falsa'],
      telefonos: ['123'],
      correosElectronicos: ['a@b.com'],
      horarios: ['9 a 17'],
      localidad: ['Ciudad'],
      zona: [99],
      latitud: [''],
      longitud: [''],
      observaciones: [''],
      codigoPostal: [''],
      organismo: [{ idInciso: 999, idUnidadEjecutora: 888, idUnidadCompra: 777 }]
    });

    component.opcionesZona = [];

    const dto = component.obtenerDto();

    expect(dto.descInciso).toBeUndefined();
    expect(dto.descUnidadEjecutora).toBeUndefined();
    expect(dto.descUnidadCompra).toBeUndefined();
    expect(dto.zona.descripcionZona).toBeUndefined();
    flush();
  }));

  it('no debería hacer nada si modoIngreso es true', fakeAsync(() => {
    component.modoIngreso = true;
    component.cargarFormulario();
    expect(mockPuntoRecepcionService.obtenerPuntoRecepcion).not.toHaveBeenCalled();
    flush();
  }));


  it('debería llamar mensajeOcultar al cambiar valores del form', fakeAsync(() => {
    component.form = component['formBuilder'].group({
      nombre: [''],
      organismo: [{ idInciso: 1, idUnidadEjecutora: 1, idUnidadCompra: 1 }]
    });


    component['cambioValores']();

    component.form.get('nombre')?.setValue('Nuevo valor');
    component.form.get('organismo')?.setValue({ idInciso: 1});
    tick();

    expect(mockActualizarService.mensajeOcultar).toHaveBeenCalledTimes(2);
    flush();
  }));

  it('debería navegar si la acción tiene URL', () => {
    const navigateSpy = spyOn(component['router'], 'navigate');
    const accion = { url: ['/ruta'] } as any;
    component.manejarAccion(accion);
    expect(navigateSpy).toHaveBeenCalledWith(['/ruta']);
  });

  it('campoVacio detecta control inválido', () => {
    component.form = component['formBuilder'].group({ nombre: ['', Validators.required] });
    const ctrl = component.form.get('nombre');
    ctrl?.markAsTouched();
    expect(component.campoVacio('nombre')).toBeTrue();
  });

  it('validarCorreo ajusta el indicador según la validez', () => {
    component.form = component['formBuilder'].group({ correosElectronicos: ['x', Validators.email] });
    component.validarCorreo();
    expect(component.correoValido).toBeFalse();
    component.form.get('correosElectronicos')?.setValue('test@test.com');
    component.validarCorreo();
    expect(component.correoValido).toBeTrue();
  });

  it('esFormularioValido muestra error cuando datos invalidos', () => {
    component.form = component['formBuilder'].group({
      nombre: ['', Validators.required],
      correosElectronicos: ['a@', [Validators.required, Validators.email]],
      latitud: ['1'],
      longitud: [''],
      organismo: ['']
    });
    const valido = (component as any).esFormularioValido();
    expect(valido).toBeFalse();
    expect(mockActualizarService.showMsgError).toHaveBeenCalled();
  });

  it('guardar llama servicio correcto segun modo', fakeAsync(() => {
    component.modoIngreso = true;
    spyOn(component as any, 'volver');
    component.form = component['formBuilder'].group({
      organismo: [{ idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 }],
      nombre: ['a'],
      zona: ['1'],
      direccion: ['x'],
      telefonos: ['t'],
      correosElectronicos: ['a@b.com'],
      horarios: ['h'],
      localidad: ['l']
    });
    component.guardar();
    expect(mockPuntoRecepcionService.altaPuntoRecepcion).toHaveBeenCalled();

    component.modoIngreso = false;
    component.idPc = 9;
    (mockPuntoRecepcionService.altaPuntoRecepcion as jasmine.Spy).calls.reset();
    component.guardar();
    expect(mockPuntoRecepcionService.modificarPuntoRecepcion).toHaveBeenCalledWith(9, jasmine.any(Object));
  }));

});
