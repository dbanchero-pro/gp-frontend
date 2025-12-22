import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { LOCALE_ID, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject, Subject, of } from 'rxjs';
import { IDescargoDTO } from 'src/app/features/entregas/models/descargo.model';
import { ItemOrdenCompraService } from 'src/app/features/entregas/services/item-orden-compra.service';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { FiltroItemCompraDTO } from 'src/app/shared/models/filtros/filtro-item-compra.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoAjuste } from '../../enum/estado-ajuste.enum';
import { TipoAjuste } from '../../enum/tipo-ajuste.enum';
import { IAjusteDTO } from '../../models/ajuste.model';
import { AgregarDescargoAjustePopupComponent } from '../agregar-descargo-ajuste-popup/agregar-descargo-ajuste-popup.component';
import { AgregarModificarAjustePopupComponent } from '../agregar-modificar-ajuste-popup/agregar-modificar-ajuste-popup.component';
import { ResolucionAjustePopupComponent } from '../resolucion-ajuste/resolucion-ajuste-popup.component';
import { AjusteService } from './../../services/ajuste.service';
import { VerAjustesComponent } from './ver-ajustes.component';


class BsModalServiceStub {
  show() {
    return { content: {} } as any;
  }
}

registerLocaleData(localeEs);

class ActualizarServiceStub {
  popups: any[] = [];
  tipoUsuario$ = new BehaviorSubject<TipoUsuario | undefined>(undefined);
  capturarErrores = true;
  mensajeInformacion() {}
  mensajeCorrecto(_mensaje?: string) {}
  mensajeOcultar() {}
  confirmar(_mensaje: string, callback: () => void) {
    callback();
  }
}

describe('VerAjustesComponent', () => {
  let component: VerAjustesComponent;
  let fixture: ComponentFixture<VerAjustesComponent>;
  let seguridadService: jasmine.SpyObj<SeguridadService>;
  let routerStub: jasmine.SpyObj<Router>;
  let archivoServiceStub: jasmine.SpyObj<ArchivoService>;
  let ajusteService: jasmine.SpyObj<AjusteService>;
  let activatedRouteStub: Partial<ActivatedRoute>;
  let paramMapGetSpy: jasmine.Spy;
  let queryParamGetSpy: jasmine.Spy;
  let snapshotGenericServiceStub: {
    save: jasmine.Spy;
    load: jasmine.Spy;
    clear: jasmine.Spy;
  };
  let ordenCompraServiceStub: jasmine.SpyObj<OrdenCompraService>;
  let itemOrdenCompraServiceStub: jasmine.SpyObj<ItemOrdenCompraService>;
  let loggerInstanceSpy: jasmine.SpyObj<any>;

  beforeAll(() => {
    loggerInstanceSpy = jasmine.createSpyObj('LoggerService', ['logError', 'logWarning', 'logInfo', 'logDebug', 'logVerbose']);
    spyOnProperty(Logger, 'instance', 'get').and.returnValue(loggerInstanceSpy);
  });

  const crearAjuste = (descargos: IAjusteDTO['descargos']) => ({
    fechaOrdenamiento: null,
    idAjuste: 1,
    tipoAjuste: TipoAjuste.OC_ANULAR,
    estado: EstadoAjuste.EN_PROCESO,
    usuarioSolicitante: { id: '1' } as any,
    descargos
  }) as IAjusteDTO;

  beforeEach(async () => {
    routerStub = jasmine.createSpyObj<Router>('Router', ['navigate', 'navigateByUrl']);
    Object.defineProperty(routerStub, 'url', { value: '/ajustes' });

    paramMapGetSpy = jasmine.createSpy('paramGet').and.returnValue(null);
    queryParamGetSpy = jasmine.createSpy('queryGet').and.returnValue(null);

    activatedRouteStub = {
      snapshot: {
        paramMap: { get: paramMapGetSpy } as any,
        queryParamMap: { get: queryParamGetSpy } as any,
        data: {}
      } as any
    };

    seguridadService = jasmine.createSpyObj<SeguridadService>('SeguridadService', [
      'obtenerTipoUsuario',
      'usuarioLogueadoEsUsuarioProveedor',
      'tienePermiso',
      'tieneAlgunPermiso',
      'obtenerUsuarioLogueado'
    ]);
    seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.ORGANISMO);
    seguridadService.usuarioLogueadoEsUsuarioProveedor.and.returnValue(false);
    seguridadService.tienePermiso.and.returnValue(true);
    seguridadService.tieneAlgunPermiso.and.returnValue(true);
    seguridadService.obtenerUsuarioLogueado.and.returnValue('1');

    itemOrdenCompraServiceStub = jasmine.createSpyObj<ItemOrdenCompraService>('ItemOrdenCompraService', ['obtenerItemOrdenCompra', 'obtenerUnidades']);
    itemOrdenCompraServiceStub.obtenerItemOrdenCompra.and.returnValue(of({} as any));
    itemOrdenCompraServiceStub.obtenerUnidades.and.callFake((item: any) => {
      const unidad = item?.descUnidadMedida?.trim();
      if (!unidad || unidad.replace(/-/g, '').trim() === '') {
        return '';
      }
      return `(${unidad})`;
    });

    ordenCompraServiceStub = jasmine.createSpyObj<OrdenCompraService>('OrdenCompraService', ['obtenerPorId']);
    ordenCompraServiceStub.obtenerPorId.and.returnValue(of({} as any));

    snapshotGenericServiceStub = {
      save: jasmine.createSpy('save'),
      load: jasmine.createSpy('load').and.returnValue(null),
      clear: jasmine.createSpy('clear')
    };

    archivoServiceStub = jasmine.createSpyObj<ArchivoService>('ArchivoService', ['descargar', 'obtener']);
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YQ==', nombre: 'archivo.pdf' }));

    ajusteService = jasmine.createSpyObj<AjusteService>('AjusteService', [
      'buscarAjustes',
      'eliminarAjuste',
      'aprobarAjuste',
      'rechazarAjuste',
      'crearAjuste',
      'modificarAjuste'
    ]);
    ajusteService.buscarAjustes.and.returnValue(of({ content: [], page: { totalElements: 0 } } as any));
    ajusteService.eliminarAjuste.and.returnValue(of(true));
    ajusteService.crearAjuste.and.returnValue(of(crearAjuste(null)));
    ajusteService.modificarAjuste.and.returnValue(of(crearAjuste(null)));

    await TestBed.configureTestingModule({
      declarations: [VerAjustesComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: SeguridadService, useValue: seguridadService },
        { provide: ItemOrdenCompraService, useValue: itemOrdenCompraServiceStub },
        { provide: OrdenCompraService, useValue: ordenCompraServiceStub },
        { provide: SnapshotGenericService, useValue: snapshotGenericServiceStub },
        { provide: ArchivoService, useValue: archivoServiceStub },
        { provide: LOCALE_ID, useValue: 'es' },
        { provide: AjusteService, useValue: ajusteService },
        { provide: BsModalService, useClass: BsModalServiceStub },
        { provide: ActualizarService, useClass: ActualizarServiceStub }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(VerAjustesComponent);
    component = fixture.componentInstance;
    seguridadService = TestBed.inject(SeguridadService) as jasmine.SpyObj<SeguridadService>;
    ajusteService = TestBed.inject(AjusteService) as jasmine.SpyObj<AjusteService>;
    paramMapGetSpy.calls.reset();
    queryParamGetSpy.calls.reset();
    routerStub.navigate.calls.reset();
    routerStub.navigateByUrl.calls.reset();
    archivoServiceStub.descargar.calls.reset();
    archivoServiceStub.obtener.calls.reset();
    archivoServiceStub.obtener.and.returnValue(of({ contenido: 'YQ==', nombre: 'archivo.pdf' }));
    snapshotGenericServiceStub.save.calls.reset();
    snapshotGenericServiceStub.clear.calls.reset();
    loggerInstanceSpy.logError.calls.reset();
    loggerInstanceSpy.logWarning.calls.reset();
    loggerInstanceSpy.logInfo.calls.reset();
    loggerInstanceSpy.logDebug.calls.reset();
  });

  it('debería refrescar el cabezal antes de aprobar un ajuste', () => {
    const modalRef: any = { aprobarEvento: new Subject<IAjusteDTO>(), rechazarEvento: new Subject<IAjusteDTO>() };
    spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
    component.idOrdenCompra = 12;
    component.idItem = 34;
    component.idVariacion = 56;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    component.consultaParaItem = true;
    ordenCompraServiceStub.obtenerPorId.and.returnValue(of({ idOC: 200 } as any));
    itemOrdenCompraServiceStub.obtenerItemOrdenCompra.and.returnValue(of({ idItem: 300 } as any));
    const ajuste = { idAjuste: 9 } as IAjusteDTO;

    component.aprobarAjuste(ajuste);

    expect(ordenCompraServiceStub.obtenerPorId).toHaveBeenCalledWith(12, TipoUsuario.ORGANISMO);
    expect(itemOrdenCompraServiceStub.obtenerItemOrdenCompra).toHaveBeenCalledWith(12, 34, 56, TipoUsuario.ORGANISMO);
    expect((component as any).abrirPopupGrande).toHaveBeenCalledWith(
      ResolucionAjustePopupComponent,
      undefined,
      jasmine.objectContaining({
        initialState: jasmine.objectContaining({
          ajuste,
          ordenCompra: jasmine.objectContaining({ idOC: 200 }),
          itemOrdenCompra: jasmine.objectContaining({ idItem: 300 }),
          tipoUsuario: TipoUsuario.ORGANISMO,
          consultaParaItem: true
        })
      })
    );
  });

  it('debería refrescar el cabezal antes de realizar un descargo', () => {
    const modalRef: any = { descargoAgregado: new Subject<IDescargoDTO>() };
    spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
    component.idOrdenCompra = 21;
    component.idItem = 43;
    component.idVariacion = 0;
    ordenCompraServiceStub.obtenerPorId.and.returnValue(of({ idOC: 210 } as any));
    itemOrdenCompraServiceStub.obtenerItemOrdenCompra.and.returnValue(of({ idItem: 430 } as any));
    const ajuste = { idAjuste: 5 } as IAjusteDTO;
    component.consultaParaItem = true;

    component.realizarDescargo(ajuste);

    expect(ordenCompraServiceStub.obtenerPorId).toHaveBeenCalledWith(21, component.tipoUsuario);
    expect(itemOrdenCompraServiceStub.obtenerItemOrdenCompra).toHaveBeenCalledWith(21, 43, 0, component.tipoUsuario);
    expect((component as any).abrirPopupGrande).toHaveBeenCalledWith(
      AgregarDescargoAjustePopupComponent,
      undefined,
      jasmine.objectContaining({
        initialState: jasmine.objectContaining({
          ajuste,
          ordenCompra: jasmine.objectContaining({ idOC: 210 }),
          itemOrdenCompra: jasmine.objectContaining({ idItem: 430 })
        })
      })
    );
  });

  it('debería abrir popup al agregar ajuste (OC)', () => {
    const modalRef = { ajusteGuardado: new Subject<any>(), cerrarPopup: jasmine.createSpy('cerrarPopup') } as unknown as Partial<AgregarModificarAjustePopupComponent>;
    spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
    const buscarSpy = spyOn(component, 'buscar');
    component.consultaParaItem = false;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    component.idOrdenCompra = 99;
    ordenCompraServiceStub.obtenerPorId.and.returnValue(of({ idOC: 101 } as any));

    component.agregarAjuste();

    expect(ordenCompraServiceStub.obtenerPorId).toHaveBeenCalledWith(99, TipoUsuario.ORGANISMO);
    expect(component.ordenCompra).toEqual(jasmine.objectContaining({ idOC: 101 }));
    expect(itemOrdenCompraServiceStub.obtenerItemOrdenCompra).not.toHaveBeenCalled();
    expect((component as any).abrirPopupGrande).toHaveBeenCalledWith(
      AgregarModificarAjustePopupComponent,
      undefined,
      jasmine.objectContaining({
        initialState: jasmine.objectContaining({
          modo: 'agregar',
          consultaParaItem: false,
          tipoUsuario: TipoUsuario.ORGANISMO,
          ajustesPendientes: component.ajustes,
        })
      })
    );

    modalRef.ajusteGuardado?.next({} as IAjusteDTO);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debería abrir popup al modificar ajuste ítem)', () => {
    const modalRef = { ajusteGuardado: new Subject<any>(), cerrarPopup: jasmine.createSpy('cerrarPopup') } as unknown as Partial<AgregarModificarAjustePopupComponent>;
    spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
    const buscarSpy = spyOn(component, 'buscar');
    component.consultaParaItem = true;
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    component.idOrdenCompra = 88;
    component.idItem = 1;
    component.idVariacion = 2;
    const ajuste = { idAjuste: 1 } as any;
    ordenCompraServiceStub.obtenerPorId.and.returnValue(of({ idOC: 90 } as any));
    itemOrdenCompraServiceStub.obtenerItemOrdenCompra.and.returnValue(of({ idItem: 11 } as any));

    component.modificarAjuste(ajuste);

    expect(ordenCompraServiceStub.obtenerPorId).toHaveBeenCalledWith(88, TipoUsuario.PROVEEDOR);
    expect(itemOrdenCompraServiceStub.obtenerItemOrdenCompra).toHaveBeenCalledWith(88, 1, 2, TipoUsuario.PROVEEDOR);
    expect(component.itemOrdenCompra).toEqual(jasmine.objectContaining({ idItem: 11 }));
    expect((component as any).abrirPopupGrande).toHaveBeenCalledWith(
      AgregarModificarAjustePopupComponent,
      undefined,
      jasmine.objectContaining({
        initialState: jasmine.objectContaining({
          modo: 'modificar',
          consultaParaItem: true,
          tipoUsuario: TipoUsuario.PROVEEDOR,
          ajuste,
          ajustesPendientes: component.ajustes,
        })
      })
    );

    modalRef.ajusteGuardado?.next({} as IAjusteDTO);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debería abrir popup al agregar ajuste (OC)', () => {
    const modalRef = { ajusteGuardado: new Subject<any>(), cerrarPopup: jasmine.createSpy('cerrarPopup') } as unknown as Partial<AgregarModificarAjustePopupComponent>;
    spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
    const buscarSpy = spyOn(component, 'buscar');
    component.consultaParaItem = false;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    component.idOrdenCompra = 99;
    ordenCompraServiceStub.obtenerPorId.and.returnValue(of({ idOC: 102 } as any));

    component.agregarAjuste();

    expect(ordenCompraServiceStub.obtenerPorId).toHaveBeenCalledWith(99, TipoUsuario.ORGANISMO);
    expect(component.ordenCompra).toEqual(jasmine.objectContaining({ idOC: 102 }));
    expect(itemOrdenCompraServiceStub.obtenerItemOrdenCompra).not.toHaveBeenCalled();
    expect((component as any).abrirPopupGrande).toHaveBeenCalledWith(
      AgregarModificarAjustePopupComponent,
      undefined,
      jasmine.objectContaining({
        initialState: jasmine.objectContaining({
          modo: 'agregar',
          consultaParaItem: false,
          tipoUsuario: TipoUsuario.ORGANISMO,
          ajustesPendientes: component.ajustes,
        })
      })
    );

    modalRef.ajusteGuardado?.next({} as IAjusteDTO);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('debería abrir popup al modificar ajuste ítem)', () => {
    const modalRef = { ajusteGuardado: new Subject<any>(), cerrarPopup: jasmine.createSpy('cerrarPopup') } as unknown as Partial<AgregarModificarAjustePopupComponent>;
    spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
    const buscarSpy = spyOn(component, 'buscar');
    component.consultaParaItem = true;
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    (component as any).ordenCompra = { idOC: 88 } as any;
    (component as any).itemOrdenCompra = { idItem: 1 } as any;
    const ajuste = { idAjuste: 1 } as any;

    component.modificarAjuste(ajuste);

    expect((component as any).abrirPopupGrande).toHaveBeenCalledWith(
      AgregarModificarAjustePopupComponent,
      undefined,
      jasmine.objectContaining({
        initialState: jasmine.objectContaining({
          modo: 'modificar',
          consultaParaItem: true,
          tipoUsuario: TipoUsuario.PROVEEDOR,
          ajuste,
          ajustesPendientes: component.ajustes,
        })
      })
    );

  modalRef.ajusteGuardado?.next({} as IAjusteDTO);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('deberia limpiar filtros de item cuando la consulta es por item', () => {
    component.consultaParaItem = true;
    component.parametros.filtro = {
      nroItem: 10,
      descripcionArticulo: 'Desc',
      codArticulo: 5
    } as any;
    component.form.get('estado')?.setValue(EstadoAjuste.APROBADO);

    component.actualizarFiltro();

    expect(component.parametros.filtro).toEqual({ estado: EstadoAjuste.APROBADO });
  });

  it('deberia mapear busqueda por numero de item cuando la consulta es por orden', () => {
    component.consultaParaItem = false;
    component.parametros.filtro = {} as any;
    component.filtroItem = { tipoBusqueda: TipoBusqueda.NROITEM, item: '123' };

    component.actualizarFiltro();

    expect(component.parametros.filtro.nroItem).toBe(123);
    expect(component.parametros.filtro.descripcionArticulo).toBeUndefined();
  });

  it('deberia mapear busqueda por descripcion cuando corresponde', () => {
    component.consultaParaItem = false;
    component.parametros.filtro = {} as any;
    component.filtroItem = { tipoBusqueda: TipoBusqueda.ARTICULO, item: 'Filtro' };

    component.actualizarFiltro();

    expect(component.parametros.filtro.descripcionArticulo).toBe('Filtro');
    expect(component.parametros.filtro.nroItem).toBeUndefined();
  });

  it('no deberia aplicar cambio de filtro de items cuando la consulta es por item', () => {
    const filtroAnterior = component.filtroItem;
    component.consultaParaItem = true;
    component.parametros.filtro = {} as any;

    component.onFiltroItemsCambio({ tipoBusqueda: TipoBusqueda.NROITEM, item: '45' } as FiltroItemCompraDTO);

    expect(component.filtroItem).toBe(filtroAnterior);
    expect(component.parametros.filtro.nroItem).toBeUndefined();
  });

  it('deberia actualizar filtro de items cuando la consulta es por orden', () => {
    component.consultaParaItem = false;
    component.parametros.filtro = {} as any;

    component.onFiltroItemsCambio({ tipoBusqueda: TipoBusqueda.NROITEM, item: '45' } as FiltroItemCompraDTO);

    expect(component.filtroItem.item).toBe('45');
    expect(component.parametros.filtro.nroItem).toBe(45);
  });

  it('deberia limpiar filtros de items cuando el texto queda vacio', () => {
    component.consultaParaItem = false;
    component.parametros.filtro = { nroItem: 1, descripcionArticulo: 'algo' } as any;

    component.onFiltroItemsCambio({ tipoBusqueda: TipoBusqueda.NROITEM, item: '   ' } as FiltroItemCompraDTO);

    expect(component.parametros.filtro.nroItem).toBeUndefined();
    expect(component.parametros.filtro.descripcionArticulo).toBeUndefined();
  });

  it('deberia excluir En proceso para organismos', () => {
    seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.ORGANISMO);

    component.obtenerTiposEstado();

    expect(component.tiposEstado.some(tipo => tipo.id === EstadoAjuste.EN_PROCESO)).toBeFalse();
  });

  it('deberia restablecer En proceso al cambiar a proveedor', () => {
    seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.ORGANISMO);
    component.obtenerTiposEstado();
    expect(component.tiposEstado.some(tipo => tipo.id === EstadoAjuste.EN_PROCESO)).toBeFalse();

    seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.PROVEEDOR);

    component.obtenerTiposEstado();

    const ids = component.tiposEstado.map(tipo => tipo.id);
    expect(ids.indexOf(EstadoAjuste.EN_PROCESO)).toBe(1);
    expect(ids.filter(id => id === EstadoAjuste.EN_PROCESO).length).toBe(1);
  });

  it('deberia detectar consulta para item cuando la ruta incluye variacion', () => {
    paramMapGetSpy.and.callFake((param: string) => (param === 'idVariacion' ? '5' : null));

    component.obtenerTipoConsulta();

    expect(component.consultaParaItem).toBeTrue();
  });

  it('deberia obtener y validar datos del usuario logueado', () => {
    seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.PROVEEDOR);

    component.obtenerUsuarioyValidar();

    expect(component.tipoUsuario).toBe(TipoUsuario.PROVEEDOR);
    expect(component.esUsuarioProveedor).toBeTrue();
  });

  it('deberia actualizar el filtro base cuando se recibe un filtro de organismo', () => {
    const actualizarFiltroSpy = spyOn(component, 'actualizarFiltro').and.callThrough();

    const filtroOrganismo = { organismo: 'test' };
    component.onFiltroOrganismo(filtroOrganismo);

    expect(component.form.get('filtroBase')?.value).toBe(filtroOrganismo);
    expect(actualizarFiltroSpy).not.toHaveBeenCalled();
  });

  it('deberia registrar error si faltan parametros para consultar ajustes por item', () => {
    component.consultaParaItem = true;
    component.idOrdenCompra = 10;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    component.form.get('estado')?.setValue(EstadoAjuste.APROBADO);

    loggerInstanceSpy.logError.calls.reset();
    component.buscar();

    expect(loggerInstanceSpy.logError).toHaveBeenCalledWith('Faltan parámetros para consultar ajustes por ítem', {
      idOC: 10,
      idItem: undefined,
      idVariacion: undefined
    });
    expect(ajusteService.buscarAjustes).not.toHaveBeenCalled();
  });

  it('deberia registrar error si falta el identificador de orden', () => {
    component.consultaParaItem = false;
    component.idOrdenCompra = undefined;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    component.form.get('estado')?.setValue(EstadoAjuste.EN_PROCESO);

    loggerInstanceSpy.logError.calls.reset();
    component.buscar();

    expect(loggerInstanceSpy.logError).toHaveBeenCalledWith('Falta idOrdenCompra para consultar ajustes por orden.');
    expect(ajusteService.buscarAjustes).not.toHaveBeenCalled();
  });

  it('deberia buscar ajustes cuando los parametros son validos', () => {
    component.consultaParaItem = true;
    component.idOrdenCompra = 10;
    component.idItem = 20;
    component.idVariacion = 30;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    component.parametros.pagina = 2;
    component.parametros.tamanoPagina = 15;
    component.parametros.sort = 'estado';
    component.parametros.order = 'asc';
    component.form.get('estado')?.setValue(EstadoAjuste.PENDIENTE_APROBACION);
    component.form.get('tipoAjuste')?.setValue(component.tiposAjuste[1]);
    component.form.get('rangoFechas')?.setValue({ fechaDesde: '2024-01-01', fechaHasta: '2024-02-01' });

    const respuesta = { content: [crearAjuste(null)], page: { totalElements: 4 } } as any;
    ajusteService.buscarAjustes.and.returnValue(of(respuesta));

    component.buscar();

    expect(snapshotGenericServiceStub.save).toHaveBeenCalledWith(VerAjustesComponent.SNAPSHOT_KEY, component.parametros);
    expect(ajusteService.buscarAjustes).toHaveBeenCalledWith(
      component.tipoUsuario,
      10,
      jasmine.objectContaining({
        estado: EstadoAjuste.PENDIENTE_APROBACION,
        idItem: 20,
        idVariacion: 30,
        fechaDesde: '2024-01-01',
        fechaHasta: '2024-02-01'
      }),
      2,
      15,
      'estado',
      'asc'
    );
    expect(component.ajustes.length).toBe(1);
    expect(component.total).toBe(4);
  });

  it('deberia reconocer al originador del ajuste', () => {
    const ajuste = crearAjuste(null);

    expect(component.esOriginadorDelAjuste(ajuste)).toBeTrue();

    seguridadService.obtenerUsuarioLogueado.and.returnValue('2');
    expect(component.esOriginadorDelAjuste(ajuste)).toBeFalse();
  });

  it('deberia evaluar permisos para agregar ajustes segun el usuario', () => {
    component.ordenCompra = {} as any;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    seguridadService.tienePermiso.and.returnValue(true);
    component.consultaParaItem = true;
    component.itemOrdenCompra = {
        puedeAgregarAjusteAnulacion: true,
        puedeAgregarAjusteCantidad: false,
        puedeAgregarAjusteFecha: false
    }

    expect(component.puedeAgregarAjuste()).toBeTrue();

    seguridadService.tienePermiso.and.returnValue(false);
    expect(component.puedeAgregarAjuste()).toBeFalse();

    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    expect(component.puedeAgregarAjuste()).toBeTrue();
  });

  it('deberia permitir modificar y eliminar ajustes propios en proceso', () => {
    const ajuste = crearAjuste(null);
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    seguridadService.obtenerUsuarioLogueado.and.returnValue('1');
    seguridadService.tienePermiso.and.returnValue(true);

    expect(component.puedeModificarAjuste(ajuste)).toBeTrue();
    expect(component.puedeEliminarAjuste(ajuste)).toBeTrue();

    const acciones = component.obtenerAccionesAjuste(ajuste).map(a => a.nombre);
    expect(acciones).toContain('Modificar');
    expect(acciones).toContain('Eliminar');
  });

  it('deberia permitir aprobar ajustes pendientes con permiso', () => {
    const ajuste = crearAjuste(null);
    ajuste.estado = EstadoAjuste.PENDIENTE_APROBACION;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    seguridadService.tienePermiso.and.callFake((permiso: string) => permiso === 'GC_AJUSTES_ORDE.APROBACION');

    expect(component.puedeAprobarAjuste(ajuste)).toBeTrue();

    const acciones = component.obtenerAccionesAjuste(ajuste).map(a => a.nombre);
    expect(acciones).toContain('Aprobar');
  });

  it('deberia revenir a la pantalla anterior usando los datos almacenados si el popup no los retorna', fakeAsync(() => {
    const volverSpy = spyOn(component, 'volver');
    const buscarSpy = spyOn(component, 'buscar').and.stub();
    spyOn(component as any, 'cerrarPopup').and.stub();

    (component as any).ajusteEnResolucion = {
      idAjuste: 99,
      tipoAjuste: TipoAjuste.ITEM_ANULAR
    };

    (component as any).procesarResolucionAjuste({ idAjuste: 99 }, 'Mensaje', EstadoAjuste.APROBADO);
    tick(0);
    tick(150);

    expect(volverSpy).toHaveBeenCalled();
    expect(buscarSpy).not.toHaveBeenCalled();
  }));

  it('deberia volver luego de aprobar la anulacion de un item', fakeAsync(() => {
    const volverSpy = spyOn(component, 'volver');
    const buscarSpy = spyOn(component, 'buscar').and.stub();
    spyOn(component as any, 'cerrarPopup').and.stub();

    (component as any).ajusteEnResolucion = {
      idAjuste: 99,
      tipoAjuste: TipoAjuste.ITEM_ANULAR
    };

    const dto: IAjusteDTO = {
      idAjuste: 99,
      estado: EstadoAjuste.APROBADO,
      tipoAjuste: TipoAjuste.ITEM_ANULAR
    };

    (component as any).procesarResolucionAjuste(dto, 'Mensaje', EstadoAjuste.APROBADO);
    tick(0);
    tick(150);

    expect(volverSpy).toHaveBeenCalled();
    expect(buscarSpy).not.toHaveBeenCalled();
  }));

  it('deberia volver luego de aprobar la anulacion de una orden', fakeAsync(() => {
    const volverSpy = spyOn(component, 'volver');
    const buscarSpy = spyOn(component, 'buscar').and.stub();
    spyOn(component as any, 'cerrarPopup').and.stub();

    (component as any).ajusteEnResolucion = {
      idAjuste: 100,
      tipoAjuste: TipoAjuste.OC_ANULAR
    };

    const dto: IAjusteDTO = {
      idAjuste: 100,
      estado: EstadoAjuste.APROBADO,
      tipoAjuste: TipoAjuste.OC_ANULAR
    };

    (component as any).procesarResolucionAjuste(dto, 'Mensaje', EstadoAjuste.APROBADO);
    tick(0);
    tick(150);

    expect(volverSpy).toHaveBeenCalled();
    expect(buscarSpy).not.toHaveBeenCalled();
  }));

  it('deberia permitir realizar descargo cuando el ajuste esta rechazado', () => {
    const ajuste = crearAjuste(null);
    ajuste.estado = EstadoAjuste.RECHAZADO;
    component.tipoUsuario = TipoUsuario.PROVEEDOR;

    expect(component.puedeRealizarDescargo(ajuste)).toBeTrue();

    const acciones = component.obtenerAccionesAjuste(ajuste).map(a => a.nombre);
    expect(acciones).toContain('Realizar descargo');
  });

  it('deberia exponer etiqueta acorde al tipo de consulta', () => {
    component.consultaParaItem = false;
    expect(component.labelAccionAgregarAjuste).toBe('Agregar ajuste OC');

    component.consultaParaItem = true;
    expect(component.labelAccionAgregarAjuste).toBe('Agregar ajuste ítem');
  });

  it('deberia reiniciar filtros al iniciar una nueva consulta', () => {
    component.form.get('estado')?.setValue(EstadoAjuste.APROBADO);
    component.filtroItem = { tipoBusqueda: TipoBusqueda.ARTICULO, item: 'texto' };
    component.parametros.filtro = { descripcionArticulo: 'texto' } as any;
    component.parametros.pagina = 5;
    component.parametros.order = 'asc';
    component.parametros.sort = 'estado';
    component.ajustes = [crearAjuste(null)];
    component.total = 10;

    const buscarSpy = spyOn(component, 'buscar').and.stub();

    component.nuevaConsulta();

    expect(component.form.get('estado')?.value).toBeNull();
    expect(component.filtroItem).toEqual({ tipoBusqueda: TipoBusqueda.NROITEM, item: '' });
    expect(component.parametros.pagina).toBe(0);
    expect(component.parametros.filtro).toEqual({ nroItem: undefined,
            codArticulo: undefined,
            descripcionArticulo: undefined,
            estado: null});
    expect(component.parametros.order).toBe(component.ordenInicial);
    expect(component.parametros.sort).toBe(component.columnaOrdenInicial);
    expect(component.ajustes).toEqual([]);
    expect(component.total).toBe(0);
    expect(snapshotGenericServiceStub.clear).toHaveBeenCalledWith(VerAjustesComponent.SNAPSHOT_KEY);
    expect(buscarSpy).toHaveBeenCalled();
  });

  it('deberia navegar a seguimiento organismo cuando no es consulta por item', () => {
    component.consultaParaItem = false;
    component.esUsuarioProveedor = false;
    component.volver();
    expect(routerStub.navigate).toHaveBeenCalledWith(['/entregas/seguimiento-organismo'], { queryParams: { volver: '1' } });
  });

  it('deberia navegar a seguimiento proveedor cuando el usuario es proveedor', () => {
    component.consultaParaItem = false;
    component.esUsuarioProveedor = true;

    component.volver();

    expect(routerStub.navigate).toHaveBeenCalledWith(['/entregas/seguimiento-proveedor'], { queryParams: { volver: '1' } });
  });

  it('deberia volver a los items del seguimiento organismo cuando la consulta es por item', () => {
    component.consultaParaItem = true;
    component.esUsuarioProveedor = false;
    component.idOrdenCompra = 77;

    component.volver();

    expect(routerStub.navigate).toHaveBeenCalledWith([
      '/entregas/seguimiento-organismo/ordenes',
      77,
      'items'
    ], { queryParams: { volver: '1' } });
  });

  it('deberia volver a los items del seguimiento proveedor cuando la consulta es por item', () => {
    component.consultaParaItem = true;
    component.esUsuarioProveedor = true;
    component.idOrdenCompra = 55;

    component.volver();

    expect(routerStub.navigate).toHaveBeenCalledWith([
      '/entregas/seguimiento-proveedor/ordenes',
      55,
      'items'
    ], { queryParams: { volver: '1' } });
  });

  it('deberia restaurar el filtro almacenado al regresar a la pantalla', fakeAsync(() => {
    const buscarSpy = spyOn(component, 'buscar').and.stub();
    snapshotGenericServiceStub.load.and.returnValue({
      filtro: { estado: EstadoAjuste.APROBADO, nroItem: 3 },
      tamanoPagina: 25,
      pagina: 2,
      sort: 'estado',
      order: 'asc'
    });

    (component as any).buscarVolver();
    tick(200);

    expect(component.form.get('estado')?.value).toBe(EstadoAjuste.APROBADO);
    expect(component.parametros.pagina).toBe(2);
    expect(component.parametros.tamanoPagina).toBe(25);
    expect(component.parametros.sort).toBe('estado');
    expect(component.parametros.order).toBe('asc');
    expect(component.filtroItem.tipoBusqueda).toBe(TipoBusqueda.NROITEM);
    expect(component.filtroItem.item).toBe(3);
    expect(buscarSpy).toHaveBeenCalled();
  }));

  it('deberia inicializar el identificador de orden desde el parametro de ruta', () => {
    paramMapGetSpy.and.callFake((param: string) => (param === 'idOrdenCompra' ? '77' : null));
    const nuevoFixture = TestBed.createComponent(VerAjustesComponent);
    const nuevoComponent = nuevoFixture.componentInstance;

    expect(nuevoComponent.idOrdenCompra).toBe(77);

    nuevoFixture.destroy();
    paramMapGetSpy.and.returnValue(null);
  });

  it('deberia cargar el item cuando se trata de una consulta por variacion', () => {
    const obtenerItemSpy = spyOn(component as any, 'obtenerItemOrdenCompra').and.stub();
    component.consultaParaItem = true;
    component.idOrdenCompra = 5;
    component.idItem = 6;
    component.idVariacion = 7;
    component.form.get('estado')?.setValue(EstadoAjuste.EN_PROCESO);

    component.buscar();

    expect(obtenerItemSpy).toHaveBeenCalled();
  });

  it('deberia ejecutar la logica de volver cuando el query volver esta presente', () => {
    queryParamGetSpy.and.returnValue('1');
    const buscarVolverSpy = spyOn(component as any, 'buscarVolver').and.callThrough();
    routerStub.navigateByUrl.calls.reset();

    component.ngOnInit();

    expect(buscarVolverSpy).toHaveBeenCalled();
    expect(routerStub.navigateByUrl).toHaveBeenCalled();

    queryParamGetSpy.and.returnValue(null);
  });

  it('deberia describir el estado del ajuste segun la enumeracion', () => {
    expect((component as any).descripcionEstado(EstadoAjuste.EN_PROCESO)).toBe('En proceso');
    expect((component as any).descripcionEstado(EstadoAjuste.PENDIENTE_APROBACION)).toBe('Pendiente de aprobación');
    expect((component as any).descripcionEstado(EstadoAjuste.APROBADO)).toBe('Aprobado');
    expect((component as any).descripcionEstado(EstadoAjuste.RECHAZADO)).toBe('Rechazado');
    expect((component as any).descripcionEstado(undefined)).toBe('Desconocido');
  });

  it('deberia indicar el origen de la solicitud segun el tipo de usuario', () => {
    expect((component as any).origenSolicitud(TipoUsuario.PROVEEDOR)).toBe('Proveedor');
    expect((component as any).origenSolicitud(TipoUsuario.ORGANISMO)).toBe('Organismo');
    expect((component as any).origenSolicitud(undefined)).toBe('Organismo');
  });

  it('deberia obtener los identificadores desde la ruta cuando estan presentes', () => {
    paramMapGetSpy.and.callFake((param: string) => {
      switch (param) {
        case 'idItemOrdenCompra':
          return '11';
        case 'idVariacion':
          return '22';
        case 'idOrdenCompra':
          return '33';
        default:
          return null;
      }
    });

    (component as any).obtenerIdsParametrosRuta();

    expect(component.idItem).toBe(11);
    expect(component.idVariacion).toBe(22);
    expect(component.idOrdenCompra).toBe(33);

    paramMapGetSpy.and.returnValue(null);
  });

});
