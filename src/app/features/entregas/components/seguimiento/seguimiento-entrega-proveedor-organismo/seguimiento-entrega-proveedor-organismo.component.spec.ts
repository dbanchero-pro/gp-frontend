import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of, throwError } from 'rxjs';
import { IPuntoRecepcionDTO } from 'src/app/features/administracion/puntos-recepcion/models/punto-recepcion.model';
import { EstadoOrdenCompra } from 'src/app/shared/enum/estado-orden-compra.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { PaisService } from 'src/app/shared/services/usuario/pais.service';
import { TipoDocumentoProveedorService } from 'src/app/shared/services/usuario/tipo-documento-proveedor.service';
import { ZonaService } from 'src/app/shared/services/zona.service';
import { Logger } from 'src/app/shared/utils/logger';
import { TipoSeguimiento } from '../../../enum/tipo-seguimiento.enum';
import { SeguimientoEntregaProveedorOrganismoComponent } from './seguimiento-entrega-proveedor-organismo.component';

describe('SeguimientoEntregaProveedorOrganismoComponent', () => {
  let fixture: ComponentFixture<SeguimientoEntregaProveedorOrganismoComponent>;
  let component: SeguimientoEntregaProveedorOrganismoComponent;
  let routerSpy: jasmine.SpyObj<Router> & { url: string };
  let activatedRouteStub: any;

  const tipoCompraServiceSpy = jasmine.createSpyObj('TipoCompraService', ['obtenerTiposCompraSinPaginado']);
  const zonaServiceSpy = jasmine.createSpyObj('ZonaService', ['obtenerZonas']);
  const seguridadServiceSpy = jasmine.createSpyObj('SeguridadService', [
    'obtenerTipoUsuario',
    'tieneAlgunPermiso',
    'usuarioLogueadoEsUsuarioProveedor',
    'obtenerProveedores'
  ]);
  const tipoDocumentoServiceSpy = jasmine.createSpyObj('TipoDocumentoProveedorService', ['obtenerTiposDocumentoProveedor']);
  const paisServiceSpy = jasmine.createSpyObj('PaisService', ['obtenerTodos']);
  const ordenCompraServiceSpy = jasmine.createSpyObj('OrdenCompraService', [
    'buscarProveedor',
    'buscarOrganismo',
    'exportarExcelProveedor',
    'exportarExcelOrganismo'
  ]);
  const snapshotGenericServiceSpy = jasmine.createSpyObj('SnapshotGenericService', ['save', 'load']);
  const bsModalServiceSpy = jasmine.createSpyObj('BsModalService', ['show']);

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    routerSpy.url = '/ruta?volver=1';
    activatedRouteStub = {
      snapshot: {
        data: { tipoSeguimiento: TipoSeguimiento.Proveedor },
        queryParamMap: { get: (_: string) => null }
      }
    };
    tipoCompraServiceSpy.obtenerTiposCompraSinPaginado.and.returnValue(of([]));
    zonaServiceSpy.obtenerZonas.and.returnValue(of([]));
    seguridadServiceSpy.obtenerTipoUsuario.and.returnValue(TipoUsuario.PROVEEDOR);
    seguridadServiceSpy.tieneAlgunPermiso.and.returnValue(true);
    seguridadServiceSpy.usuarioLogueadoEsUsuarioProveedor.and.returnValue(true);
    seguridadServiceSpy.obtenerProveedores.and.returnValue([
      { id: 1, paisDocumento: 1, tipoDocumento: 1, nroDocumento: '1', nombre: 'Prov' }
    ]);
    tipoDocumentoServiceSpy.obtenerTiposDocumentoProveedor.and.returnValue(of({ content: [] }));
    paisServiceSpy.obtenerTodos.and.returnValue(of([]));
    ordenCompraServiceSpy.buscarProveedor.and.returnValue(of({ content: [], page: { totalElements: 0 } }));
    ordenCompraServiceSpy.buscarOrganismo.and.returnValue(of({ content: [], page: { totalElements: 0 } }));
    spyOn(Logger, 'logInfo').and.stub();

    await TestBed.configureTestingModule({
      declarations: [SeguimientoEntregaProveedorOrganismoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: TipoCompraService, useValue: tipoCompraServiceSpy },
        { provide: ZonaService, useValue: zonaServiceSpy },
        { provide: SeguridadService, useValue: seguridadServiceSpy },
        { provide: TipoDocumentoProveedorService, useValue: tipoDocumentoServiceSpy },
        { provide: PaisService, useValue: paisServiceSpy },
        { provide: OrdenCompraService, useValue: ordenCompraServiceSpy },
        { provide: SnapshotGenericService, useValue: snapshotGenericServiceSpy },
        { provide: BsModalService, useValue: bsModalServiceSpy }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  function crearComponente() {
    fixture = TestBed.createComponent(SeguimientoEntregaProveedorOrganismoComponent);
    component = fixture.componentInstance;

    (component as any).grupoCompra = { colapsado: true };
    (component as any).grupoOC = { colapsado: true };
    (component as any).grupoProveedor = { colapsado: true };
  }

  it('debería crearse', () => {
    crearComponente();
    expect(component).toBeTruthy();
  });

  it('debería restaurar filtros cuando el parámetro volver es 1', () => {
    activatedRouteStub.snapshot.queryParamMap.get = (p: string) => p === 'volver' ? '1' : null;
    routerSpy.url = '/ruta?volver=1';
    crearComponente();
    const restaurarSpy = spyOn<any>(component, 'restaurarFiltro');
    component.ngOnInit();
    expect(restaurarSpy).toHaveBeenCalled();
    expect(routerSpy.navigateByUrl).toHaveBeenCalledWith('/ruta', { replaceUrl: true });
    expect(component.colOC).toBeFalse();
  });

  it('debería iniciar como organismo cuando no se vuelve', () => {
    activatedRouteStub.snapshot.data.tipoSeguimiento = TipoSeguimiento.Organismo;
    activatedRouteStub.snapshot.queryParamMap.get = () => null;
    routerSpy.url = '/otra';
    crearComponente();
    component.ngOnInit();
    expect(paisServiceSpy.obtenerTodos).toHaveBeenCalled();
    expect(tipoDocumentoServiceSpy.obtenerTiposDocumentoProveedor).toHaveBeenCalled();
    expect(tipoCompraServiceSpy.obtenerTiposCompraSinPaginado).toHaveBeenCalled();
    expect(component.colCompra).toBeFalse();
    expect(ordenCompraServiceSpy.buscarOrganismo).toHaveBeenCalled();
  });

  it('debería buscar como proveedor', () => {
    crearComponente();
    component.tipoSeguimiento = TipoSeguimiento.Proveedor;
    ordenCompraServiceSpy.buscarProveedor.calls.reset();
    component.buscar();
    expect(ordenCompraServiceSpy.buscarProveedor).toHaveBeenCalled();
  });

  it('debería actualizar filtros para proveedor', () => {
    crearComponente();
    component.tipoSeguimiento = TipoSeguimiento.Proveedor;
    component.proveedores = [
      { id: 1, paisDocumento: 9, tipoDocumento: 8, nroDocumento: '123', nombre: 'Uno' }
    ] as any;
    component.form.patchValue({
      proveedor: 1,
      idZona: 2,
      nroOC: '10',
      organismoOc: { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 }
    });
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual({
      estadoOrdenCompra: EstadoOrdenCompra.Pendiente,
      proveedor: {
        paisDocumento: 9,
        tipoDocumento: 8,
        nroDocumento: '123',
        id: 1,
        nombre: 'Uno'
      },
      idZona: 2,
      nroOC: '10',
      idIncisoOc: 1,
      idUnidadEjecutoraOc: 2,
      idUnidadCompraOc: 3,
      soloOCAjustesPendientes: false

    });
    component.form.patchValue({ proveedor: 99 });
    component.actualizarFiltro();
    expect((component.parametros.filtro as any).proveedor).toBeUndefined();
  });

  it('debería actualizar filtros para organismo', () => {
    activatedRouteStub.snapshot.data.tipoSeguimiento = TipoSeguimiento.Organismo;
    crearComponente();
    component.tipoSeguimiento = TipoSeguimiento.Organismo;
    component.form.patchValue({
      nroAnioCompra: '5/2024',
      tipoCompra: 7,
      nroOC: '11',
      organismoOc: { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 },
      organismoCompra: { idInciso: 4, idUnidadEjecutora: 5, idUnidadCompra: 6 },
      tipoDoc: 8,
      paisDoc: 9,
      nroDocumento: 'abc',
      idZona: 1
    });
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual({
      estadoOrdenCompra: EstadoOrdenCompra.Pendiente,
      numCompra: 5,
      anioCompra: 2024,
      tipoCompra: 7,
      nroOC: '11',
      idIncisoOc: 1,
      idUnidadEjecutoraOc: 2,
      idUnidadCompraOc: 3,
      idInciso: 4,
      idUnidadEjecutora: 5,
      idUnidadCompra: 6,
      idTipoDocumento: 8,
      idPais: 9,
      nroDocumento: 'abc',
      idZona: 1,
      soloOCAjustesPendientes: false
    });
  });

  it('debería restaurar filtros sin snapshot', () => {
    snapshotGenericServiceSpy.load.and.returnValue(null);
    crearComponente();
    component['restaurarFiltro']();
    expect(component.parametros.pagina).toBe(0);
  });

  it('debería guardar filtros', () => {
    crearComponente();
    snapshotGenericServiceSpy.save.calls.reset();
    component['guardarFiltro']();
    expect(snapshotGenericServiceSpy.save).toHaveBeenCalled();
  });

  it('debería obtener proveedores solo si el usuario es proveedor', () => {
    crearComponente();
    seguridadServiceSpy.usuarioLogueadoEsUsuarioProveedor.and.returnValue(false);
    component.proveedores = [] as any;
    component.obtenerProveedores();
    expect(component.proveedores.length).toBe(0);
  });

  it('debería validar cantidad de proveedores', () => {
    crearComponente();
    component.proveedores = [{ id: 1 }, { id: 2 }] as any;
    component.validarCantidadProveedores();
    expect(component.proveedorDeshabilitado).toBeFalse();
    component.proveedores = [{ id: 1 }] as any;
    component.validarCantidadProveedores();
    expect(component.proveedorDeshabilitado).toBeTrue();
  });

  it('debería manejar error al buscar', () => {
    crearComponente();
    component.tipoSeguimiento = TipoSeguimiento.Proveedor;
    ordenCompraServiceSpy.buscarProveedor.and.returnValue(throwError(() => new Error('error')));
    component.buscar();
    expect(component.total).toBe(0);
  });

  it('debería restaurar filtros desde snapshot', () => {
    snapshotGenericServiceSpy.load.and.returnValue({
      filtro: { estado: EstadoOrdenCompra.Finalizada },
      pagina: 2,
      tamanoPagina: 20,
      sort: 'campo',
      order: 'asc',
      estadoDesplegables: { colCompra: true, colOC: true, colProveedor: true, colEstado: true }
    });
    crearComponente();
    component['restaurarFiltro']();
    expect(component.form.get('estado')?.value).toEqual(EstadoOrdenCompra.Finalizada);
    expect(component.parametros.pagina).toBe(2);
    expect(component.colCompra).toBeTrue();
  });

  it('debería forzar validación al cambiar tipo de documento', fakeAsync(() => {
    crearComponente();
    const ctrl = component.form.get('nroDocumento') as AbstractControl;
    ctrl.setValue('123');
    spyOn(ctrl, 'setValue').and.callThrough();
    component.cambioTipoDoc();
    tick();
    expect(ctrl.setValue).toHaveBeenCalledWith('123');
  }));

  it('debería cargar países', () => {
    crearComponente();
    paisServiceSpy.obtenerTodos.calls.reset();
    component.cargarPaises();
    expect(paisServiceSpy.obtenerTodos).toHaveBeenCalled();
  });

  it('debería cargar tipos de documento de proveedor', () => {
    crearComponente();
    tipoDocumentoServiceSpy.obtenerTiposDocumentoProveedor.calls.reset();
    component.cargarTiposDocumentoProveedor();
    expect(tipoDocumentoServiceSpy.obtenerTiposDocumentoProveedor).toHaveBeenCalled();
  });

  it('debería abrir popup de punto de recepción', () => {
    crearComponente();
    const abrirSpy = spyOn(component, 'abrirPopup');
    const punto: IPuntoRecepcionDTO = { fechaBaja: new Date() } as any;
    component.abrirPopupPuntoRecepcion(punto);
    expect(abrirSpy).toHaveBeenCalled();
    const config = abrirSpy.calls.mostRecent().args[2] as any;
    expect(config.initialState.titulo).toContain('(inhabilitado)');
  });

  it('debería abrir popup de punto de recepción sin inhabilitar', () => {
    crearComponente();
    const abrirSpy = spyOn(component, 'abrirPopup');
    const punto: IPuntoRecepcionDTO = { fechaBaja: null as any } as any;
    component.abrirPopupPuntoRecepcion(punto);
    const config = abrirSpy.calls.mostRecent().args[2] as any;
    expect(config.initialState.titulo).not.toContain('(inhabilitado)');
  });

  it('debería descargar excel para proveedor', () => {
    crearComponente();
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    ordenCompraServiceSpy.exportarExcelProveedor.calls.reset();
    component.descargarExcel();
    expect(ordenCompraServiceSpy.exportarExcelProveedor).toHaveBeenCalled();
  });

  it('debería descargar excel para organismo', () => {
    crearComponente();
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    ordenCompraServiceSpy.exportarExcelOrganismo.calls.reset();
    component.descargarExcel();
    expect(ordenCompraServiceSpy.exportarExcelOrganismo).toHaveBeenCalled();
  });

  it('no debería setear filtros adicionales si tipoSeguimiento es indefinido', () => {
    crearComponente();
    (component as any).tipoSeguimiento = undefined;
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual({ estadoOrdenCompra: EstadoOrdenCompra.Pendiente, soloOCAjustesPendientes: false});
  });

  it('debería restaurar filtro sin estado de desplegables', () => {
    snapshotGenericServiceSpy.load.and.returnValue({ filtro: {}, pagina: 1, tamanoPagina: 5, sort: 'nroOC', order: 'asc' });
    crearComponente();
    component['restaurarFiltro']();
    expect(component.colCompra).toBeTrue();
  });

  it('debería ignorar cambio de tipo de documento si falta el control', fakeAsync(() => {
    crearComponente();
    component.form.removeControl('nroDocumento');
    component.cambioTipoDoc();
    tick();
    expect(component.form.contains('nroDocumento')).toBeFalse();
  }));

  it('debería actualizar filtros de organismo sin número de compra', () => {
    activatedRouteStub.snapshot.data.tipoSeguimiento = TipoSeguimiento.Organismo;
    crearComponente();
    component.tipoSeguimiento = TipoSeguimiento.Organismo;
    component.form.patchValue({
      nroAnioCompra: '',
      tipoCompra: 1,
      organismoOc: { idInciso: 1, idUnidadEjecutora: 1, idUnidadCompra: 1 },
      organismoCompra: { idInciso: 1, idUnidadEjecutora: 1, idUnidadCompra: 1 }
    });
    component.actualizarFiltro();
    expect((component.parametros.filtro as any).numCompra).toBeUndefined();
    expect((component.parametros.filtro as any).anioCompra).toBeUndefined();
  });
  
  it('debería detectar cambio en unidad de compra', () => {
    crearComponente();
    const orden: any = {
      compra: { unidadCompra: { idInciso: 20, idUnidadEjecutora: 30, idUnidadCompra: 50 } },
      unidadCompra: { idInciso: 40, idUnidadEjecutora: 30, idUnidadCompra: 50 }
    };
    expect(component.cambiaUC(orden)).toBeTrue();
    orden.unidadCompra.idInciso = 20;
    expect(component.cambiaUC(orden)).toBeFalse();
  });

  it('debería validar número de compra y OC', () => {
    crearComponente();
    component.form.get('nroAnioCompra')?.setValue('abc');
    component.validarNroAnioCompra();
    expect(component.nroCompraValido).toBeFalse();
    component.form.get('nroAnioCompra')?.setValue('1/2020');
    component.validarNroAnioCompra();
    expect(component.nroCompraValido).toBeTrue();
    component.form.get('nroOC')?.setValue('abc');
    component.validarNroOc();
    expect(component.nroOcValido).toBeFalse();
    component.form.get('nroOC')?.setValue('123');
    component.validarNroOc();
    expect(component.nroOcValido).toBeTrue();
  });

  it('debería aplicar filtro base', () => {
    crearComponente();
    component.onFiltroOrganismo({ a: 1 });
    expect(component.form.get('filtroBase')?.value).toEqual({ a: 1 });
  });

  it('debería navegar a ver items', () => {
    crearComponente();
    component.verItems({ idOC: 5 } as any);
    expect(routerSpy.navigate).toHaveBeenCalled();
  });

  it('deberA-a navegar a ver ajustes', () => {
    crearComponente();
    routerSpy.navigate.calls.reset();
    component.verAjustes({ idOC: 7 } as any);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/ajustes', 7], { queryParams: { volver: '1' } });
  });

  it('debería mantener control intacto al vaciar nroAnioCompra', () => {
    crearComponente();
    const ctrl = component.form.get('nroAnioCompra');
    ctrl?.setValue('');
    component.validarNroAnioCompra();
    expect(component.nroCompraValido).toBeTrue();
    expect(ctrl?.pristine).toBeTrue();
  });

  it('no debería buscar si el formulario es inválido', () => {
    crearComponente();
    component.form.get('nroOC')?.setValue('abc');
    ordenCompraServiceSpy.buscarProveedor.calls.reset();
    component.buscar();
    expect(ordenCompraServiceSpy.buscarProveedor).not.toHaveBeenCalled();
  });

  it('debería calcular fechaEntregaParaProveedor solo para proveedor y próximo a vencer', () => {
    crearComponente();
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    expect(component.fechaEntregaParaProveedor({ proximoAVencerse: true } as any)).toBeTrue();
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    expect(component.fechaEntregaParaProveedor({ proximoAVencerse: true } as any)).toBeFalse();
  });

  it('debería abrir coordenadas en nueva ventana', () => {
    crearComponente();
    const openSpy = spyOn(window, 'open');
    component.abrirCoordenadas({ latitud: 1, longitud: 2 } as any);
    expect(openSpy).toHaveBeenCalled();
  });

  it('debería generar acciones con permisos según tipo de usuario', () => {
    crearComponente();
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    let acciones = (component as any).obtenerAcciones({} as any);
    expect(acciones[0].permisos?.length).toBe(0);
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    acciones = (component as any).obtenerAcciones({} as any);
    expect(acciones[0].permisos?.length).toBeGreaterThan(0);
  });

  it('nuevaConsulta debería reiniciar parámetros y buscar', () => {
    crearComponente();
    component.parametros = { pagina: 5, filtro: { estadoOrdenCompra: 'x' } as any } as any;
    spyOn(component, 'buscar');
    component.nuevaConsulta();
    expect(component.parametros.pagina).toBe(0);
    expect(component.parametros.filtro).toEqual({});
    expect(component.buscar).toHaveBeenCalled();
  });
});

