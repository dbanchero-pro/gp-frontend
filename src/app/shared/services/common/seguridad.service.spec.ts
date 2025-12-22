import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TipoUsuario } from '../../enum/tipo-usuario.enum';
import { SeguridadService } from '../common/seguridad.service';
import { ActualizarService } from './actualizar.service';
import { AuthRawService } from './auth-raw-service';
import { UtilService } from './util.service';

describe('SeguridadService', () => {
  let servicio: SeguridadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [],
      providers: [SeguridadService,
        { provide: AuthRawService, useValue: { 
          loadUserProfile: () => Promise.resolve({}), 
          logout: () => Promise.resolve({}),
          isLoggedIn: () => true,
          clearToken: () => {} } },
         provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
    });

    servicio = TestBed.inject(SeguridadService);
  });

  it('debería crearse', () => {
    expect(servicio).toBeTruthy();
  });

  it('debería almacenar y obtener permisos', () => {
    const permisos = ['permiso1', 'permiso2'];

    servicio.almacenarPermisos(permisos);

    const result = servicio.obtenerPermisos();
    expect(result).toEqual(permisos);
  });

  it('debería verificar si existe un permiso', () => {
    const permisos = ['permiso1', 'permiso2'];

    servicio.almacenarPermisos(permisos);

    const result = servicio.tienePermiso('permiso1');
    expect(result).toBe(true);
  });

  it('debería verificar si un permiso no existe', () => {
    const permisos = ['permiso1', 'permiso2'];

    servicio.almacenarPermisos(permisos);

    const result = servicio.tienePermiso('permiso3');
    expect(result).toBe(false);
  });

  it('debería eliminar los permisos', () => {
    const permisos = ['permiso1', 'permiso2'];

    servicio.almacenarPermisos(permisos);
    sessionStorage.removeItem("permisos");
    const result = servicio.obtenerPermisos();
    expect(result).toEqual([]);
  });

  it('debería limpiar todos los datos', () => {
    const permisos = ['permiso1', 'permiso2'];

    servicio.almacenarPermisos(permisos);
    sessionStorage.removeItem("permisos");

    const result = servicio.obtenerPermisos();
    expect(result).toEqual([]);
  });

  it('debería cargar permisos del servicio cuando no están guardados', async () => {
    const util = TestBed.inject(UtilService);
    spyOn(util, 'usuarioInfo').and.returnValue(of({ permisos: ['A', 'B'] } as any));
    sessionStorage.removeItem('permisos');
    await servicio.cargarPermisos();
    expect(sessionStorage.getItem('permisos')).toBe('A,B');
  });
  it('devuelve el nombre de usuario guardado', () => {
    sessionStorage.setItem('nombreUsuario', 'Juan');
    expect(servicio.obtenerNombreUsuarioLogueado()).toBe('Juan');
  });

  it('usuario logueado es proveedor si tiene el permiso', () => {
    sessionStorage.setItem('permisos', 'USUARIO_PROVEEDOR');
    expect(servicio.usuarioLogueadoEsUsuarioProveedor()).toBeTrue();
  });

  it('cambiarTipoUsuario guarda el valor y notifica', () => {
    const actualizar = TestBed.inject(ActualizarService);
    spyOn(actualizar, 'cambiarTipoUsuario');
    servicio.cambiarTipoUsuario(TipoUsuario.PROVEEDOR);
    expect(sessionStorage.getItem('tipoUsuario')).toBe('PROVEEDOR');
    expect(actualizar.cambiarTipoUsuario).toHaveBeenCalledWith(TipoUsuario.PROVEEDOR);
  });

  it('obtenerTipoUsuario devuelve el valor almacenado', () => {
    sessionStorage.setItem('tipoUsuario', 'PROVEEDOR');
    spyOn(servicio, 'usuarioLogueadoEsUsuarioOrganismo').and.returnValue(false);
    spyOn(servicio, 'usuarioLogueadoEsUsuarioProveedor').and.returnValue(true);
    const tipo = servicio.obtenerTipoUsuario();
    expect(tipo).toBe(TipoUsuario.PROVEEDOR);
  });

  it('limpiarContexto elimina todos los datos', () => {
    sessionStorage.setItem('permisos', 'A');
    servicio.limpiarContexto();
    expect(sessionStorage.getItem('permisos')).toBeNull();
  });

  it('cargarContexto almacena la información del usuario', async () => {
    const util = TestBed.inject(UtilService);
    const actualizar = TestBed.inject(ActualizarService);
    const info = {
      usuario: 'usuario',
      nombre: 'nombre',
      proveedores: [{ nombre: 'uno' }],
      unidadesCompra: [{ id: 1 }],
      permisos: ['P1']
    } as any;
    spyOn(servicio, 'obtenerTipoUsuario').and.returnValue(TipoUsuario.ORGANISMO);
    spyOn(util, 'usuarioInfo').and.returnValue(of(info));
    spyOn(actualizar, 'cambiarTipoUsuario');
    await servicio.cargarContexto();
    expect(sessionStorage.getItem('nombreUsuario')).toBe('nombre');
    expect(sessionStorage.getItem('usuario')).toBe('usuario');
    expect(sessionStorage.getItem('proveedores')).toBe(JSON.stringify(info.proveedores));
    expect(actualizar.cambiarTipoUsuario).toHaveBeenCalled();
  });

  it('cargarContexto rechaza ante un error', async () => {
    const util = TestBed.inject(UtilService);
    spyOn(util, 'usuarioInfo').and.returnValue({ subscribe: (obs: any) => obs.error('x') } as any);
    await expectAsync(servicio.cargarContexto()).toBeRejected();
  });

  it('obtenerUnidadesCompra devuelve los datos guardados', () => {
    const unidades = [{ id: 5 } as any];
    sessionStorage.setItem('unidadesCompra', JSON.stringify(unidades));
    expect(servicio.obtenerUnidadesCompra()).toEqual(unidades as any);
  });

  it('obtenerProveedores devuelve los datos guardados', () => {
    const proveedores = [{ nombre: 'a' } as any];
    sessionStorage.setItem('proveedores', JSON.stringify(proveedores));
    expect(servicio.obtenerProveedores()).toEqual(proveedores as any);
  });

  it('usuarioLogueadoEsUsuarioOrganismo verifica unidades', () => {
    sessionStorage.setItem('unidadesCompra', JSON.stringify([{}]));
    expect(servicio.usuarioLogueadoEsUsuarioOrganismo()).toBeTrue();
  });

  it('usuarioLogueadoPuedeCambiarPerfil es verdadero si tiene ambos', () => {
    spyOn(servicio, 'usuarioLogueadoEsUsuarioOrganismo').and.returnValue(true);
    spyOn(servicio, 'usuarioLogueadoEsUsuarioProveedor').and.returnValue(true);
    expect(servicio.usuarioLogueadoPuedeCambiarPerfil()).toBeTrue();
  });

  it('tieneAlgunPermiso revisa la lista', () => {
    sessionStorage.setItem('permisos', 'A,B');
    expect(servicio.tieneAlgunPermiso(['X', 'A'])).toBeTrue();
    expect(servicio.tieneAlgunPermiso(['X', 'Y'])).toBeFalse();
  });

  it('cargarPermisos no solicita datos si ya existen', async () => {
    sessionStorage.setItem('permisos', 'A');
    const util = TestBed.inject(UtilService);
    spyOn(util, 'usuarioInfo');
    await servicio.cargarPermisos();
    expect(util.usuarioInfo).not.toHaveBeenCalled();
  });

  it('obtenerTipoUsuario retorna PROVEEDOR si solo es proveedor', () => {
    sessionStorage.removeItem('tipoUsuario');
    spyOn(servicio, 'usuarioLogueadoEsUsuarioOrganismo').and.returnValue(false);
    spyOn(servicio, 'usuarioLogueadoEsUsuarioProveedor').and.returnValue(true);
    expect(servicio.obtenerTipoUsuario()).toBe(TipoUsuario.PROVEEDOR);
  });

  it('obtenerTipoUsuario retorna ORGANISMO si solo es organismo', () => {
    sessionStorage.removeItem('tipoUsuario');
    spyOn(servicio, 'usuarioLogueadoEsUsuarioOrganismo').and.returnValue(true);
    spyOn(servicio, 'usuarioLogueadoEsUsuarioProveedor').and.returnValue(false);
    expect(servicio.obtenerTipoUsuario()).toBe(TipoUsuario.ORGANISMO);
  });

  it('obtenerNombreUsuarioLogueado devuelve vacío si no hay dato', () => {
    sessionStorage.removeItem('nombreUsuario');
    expect(servicio.obtenerNombreUsuarioLogueado()).toBe('');
  });

  it('obtenerUnidadesCompra retorna vacío si no hay guardadas', () => {
    sessionStorage.removeItem('unidadesCompra');
    expect(servicio.obtenerUnidadesCompra()).toEqual([] as any);
  });

  it('obtenerProveedores retorna vacío si no hay guardados', () => {
    sessionStorage.removeItem('proveedores');
    expect(servicio.obtenerProveedores()).toEqual([] as any);
  });

  it('usuarioLogueadoEsUsuarioOrganismo retorna falso sin unidades', () => {
    sessionStorage.removeItem('unidadesCompra');
    expect(servicio.usuarioLogueadoEsUsuarioOrganismo()).toBeFalse();
  });


  it('usuarioLogueadoPuedeCambiarPerfil es falso si falta algún rol', () => {
    spyOn(servicio, 'usuarioLogueadoEsUsuarioOrganismo').and.returnValue(true);
    spyOn(servicio, 'usuarioLogueadoEsUsuarioProveedor').and.returnValue(false);
    expect(servicio.usuarioLogueadoPuedeCambiarPerfil()).toBeFalse();
  });

  it('obtenerTipoUsuario retorna Organismo cuando no hay coincidencias previas', () => {
    sessionStorage.setItem('tipoUsuario', 'OTRO');
    spyOn(servicio, 'usuarioLogueadoEsUsuarioOrganismo').and.returnValue(true);
    spyOn(servicio, 'usuarioLogueadoEsUsuarioProveedor').and.returnValue(true);
    expect(servicio.obtenerTipoUsuario()).toBe(TipoUsuario.ORGANISMO);
  });

  it('cargarPermisos resuelve sin llamar a util cuando no está logueado', async () => {
    const auth = TestBed.inject(AuthRawService);
    spyOn(auth, 'isLoggedIn').and.returnValue(false);
    const util = TestBed.inject(UtilService);
    spyOn(util, 'usuarioInfo');
    await servicio.cargarPermisos();
    expect(util.usuarioInfo).not.toHaveBeenCalled();
  });

});
