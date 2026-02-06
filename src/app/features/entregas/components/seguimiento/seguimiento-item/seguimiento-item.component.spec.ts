import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of, throwError } from 'rxjs';
import { AjusteErroresPopupComponent } from 'src/app/features/ajustes/components/ajuste-errores-popup/ajuste-errores-popup.component';
import { IAjustesItemsRequestDTO } from 'src/app/features/ajustes/models/ajustes-items-request.model';
import { IAjustesItemsResponseDTO } from 'src/app/features/ajustes/models/ajustes-items-response.model';
import { AjusteService } from 'src/app/features/ajustes/services/ajuste.service';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoItemOrdenCompra } from '../../../enum/estado-item-orden-compra';
import { TipoArticuloServObra } from '../../../enum/tipo-articulo-serv-obra';
import { TipoCantidad } from '../../../enum/tipo-cantidad.enum';
import { TipoSeguimiento } from '../../../enum/tipo-seguimiento.enum';
import { ItemOrdenCompraDTO } from '../../../models/item-orden-compra.model';
import { OrdenCompraResumenPipe } from '../../../pipes/orden-compra-resumen.pipe';
import { EntregaService } from '../../../services/entrega.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { ITEMS_MOCK, SeguimientoItem } from './seguimiento-item.component';

describe('SeguimientoItem', () => {
  let component: SeguimientoItem;
  let fixture: ComponentFixture<SeguimientoItem>;
  let logErrorSpy: jasmine.Spy;
  let ajusteServiceMock: jasmine.SpyObj<AjusteService>;
  let ordenCompraServiceMock: jasmine.SpyObj<OrdenCompraService>;
  const mockModalService = {
    show: (comp?: any, cfg?: any) => {
      const ref = new BsModalRef();
      ref.content = {};
      return ref;
    },
    hide: () => { }
  };
  beforeEach(async () => {
    ajusteServiceMock = jasmine.createSpyObj<AjusteService>('AjusteService', ['crearAjustesItemsSeleccionados', 'validarAjustesItemsSeleccionados']);
    ordenCompraServiceMock = jasmine.createSpyObj<OrdenCompraService>('OrdenCompraService', ['obtenerPorId']);
    ordenCompraServiceMock.obtenerPorId.and.returnValue(of({} as any));
    await TestBed.configureTestingModule({
    declarations: [SeguimientoItem, OrdenCompraResumenPipe],
    imports: [ReactiveFormsModule, BrowserAnimationsModule],
    providers: [
      FormBuilder,
      { provide: Router, useValue: { navigate: () => { }, navigateByUrl: () => { }, url: '/ruta' } },
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['idOrdenCompra', '1']]), queryParamMap: new Map(), data: { tipoSeguimiento: '' } } } },
      {
        provide: SeguridadService,
        useValue: {
          obtenerTipoUsuario: () => TipoUsuario.PROVEEDOR,
          tienePermiso: jasmine.createSpy('tienePermiso').and.returnValue(true),
        }
      },
      { provide: OrdenCompraService, useValue: ordenCompraServiceMock },
      {
        provide: ItemOrdenCompraService, useValue: {
          obtenerItemsDeOrdenCompra: () => of({ content: ITEMS_MOCK, page: { totalElements: ITEMS_MOCK.length } }),
          cantidadesPendienteEntregaYTotal: (item: ItemOrdenCompraDTO) => `999 de 999`,
          cantidadesPendienteConformidadYTotal: (item: ItemOrdenCompraDTO) => `1999 de 1999`,
          cantidadesPendienteRecepcionYTotal: (item: ItemOrdenCompraDTO) => `2999 de 2999`,
        }
      },
      { provide: BsModalService, useValue: mockModalService },
      { provide: AjusteService, useValue: ajusteServiceMock },
      { provide: EntregaService, useValue: { recepcionarItemsSeleccionados: () => of([]) } }
    ],
    schemas: [NO_ERRORS_SCHEMA]
  }).compileComponents();
});

  beforeAll(() => {
    registerLocaleData(localeEs);
  });

  beforeEach(() => {
    logErrorSpy = jasmine.createSpy('logError');
    spyOnProperty(Logger, 'instance', 'get').and.returnValue({
      logError: logErrorSpy,
      logWarning: () => { },
      logInfo: () => { },
      logDebug: () => { },
      logVerbose: () => { }
    });
    fixture = TestBed.createComponent(SeguimientoItem);
    component = fixture.componentInstance;
  // se simula el componente hijo con el método limpiar
    component.filtroItemsComponent = { limpiar: () => { } } as any;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('buscarVolver restaura filtro desde snapshot', fakeAsync(() => {
    const snap = { filtro: { estado: 'PENDIENTE', nroItem: 5 }, pagina: 0 };
    spyOn(TestBed.inject(SnapshotGenericService), 'load').and.returnValue(snap);
    spyOn(component, 'buscar');
    (component as any).buscarVolver();
    expect(component.filtroItem?.item).toBe(5);
    tick(250);
    expect(component.buscar).toHaveBeenCalled();
  }));

  it('ngOnInit con volver igual a 1 llama buscarVolver', () => {
    const route = TestBed.inject(ActivatedRoute);
    const router = TestBed.inject(Router);
    Object.defineProperty(route.snapshot, 'queryParamMap', { value: new Map([['volver', '1']]) });
    Object.defineProperty(router, 'url', { value: '/ruta?volver=1' });
    const spyBuscar = spyOn<any>(component, 'buscarVolver');
    const spyNavigate = spyOn(router, 'navigateByUrl');
    component.ngOnInit();
    expect(spyBuscar).toHaveBeenCalled();
    expect(spyNavigate).toHaveBeenCalledWith('/ruta', { replaceUrl: true });
  });

  it('onFiltroOrganismo actualiza filtro', () => {
    const spy = spyOn(component, 'actualizarFiltro');
    component.onFiltroOrganismo({ estado: 'PENDIENTE' });
    expect(component.form.get('filtroBase')?.value).toEqual({ estado: 'PENDIENTE' });
    expect(spy).not.toHaveBeenCalled();
  });

  it('onFiltroItemsCambio maneja búsqueda por número', () => {
    component.onFiltroItemsCambio({ tipoBusqueda: TipoBusqueda.NROITEM, item: 7 });
    expect(component.filtroItem.item).toBe(7);
    expect(component.parametros.filtro.descripcionArticulo).toBeUndefined();
  });

  it('onFiltroItemsCambio maneja búsqueda por descripción', () => {
    component.onFiltroItemsCambio({ tipoBusqueda: TipoBusqueda.ARTICULO, item: 'abc' });
    expect(component.filtroItem.item).toBe('abc');
  });

  it('onFiltroItemsCambio ignora texto vacío', () => {
    component.parametros.filtro.nroItem = 1;
    component.onFiltroItemsCambio({ tipoBusqueda: TipoBusqueda.NROITEM, item: ' ' });
    expect(component.filtroItem.item).toBe(' ');
  });

  it('buscarVolver restaura descripción desde snapshot', fakeAsync(() => {
    const snap = { filtro: { estado: 'PENDIENTE', descripcionArticulo: 'abc' }, pagina: 0 };
    spyOn(TestBed.inject(SnapshotGenericService), 'load').and.returnValue(snap);
    spyOn(component, 'buscar');
    (component as any).buscarVolver();
    expect(component.filtroItem?.item).toBe('abc');
    tick(250);
    expect(component.buscar).toHaveBeenCalled();
  }));

  it('buscarVolver sin snapshot ejecuta búsqueda', fakeAsync(() => {
    spyOn(TestBed.inject(SnapshotGenericService), 'load').and.returnValue(undefined);
    const spy = spyOn(component, 'buscar');
    (component as any).buscarVolver();
    tick(250);
    expect(spy).toHaveBeenCalled();
  }));

  it('navega a entregables al llamar verEntregables', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    component.verEntregables({ idItem: 1, idVariacion: 1, tipoCantidad: TipoCantidad.ENTREGABLE } as any);
    expect(spy).toHaveBeenCalledWith([1, 1, 'entregables'], { relativeTo: TestBed.inject(ActivatedRoute) });
  });

  it('navega a entregas al llamar verEntregas', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    component.verEntregas({ idItem: 1, idVariacion: 1, tipoCantidad: TipoCantidad.ENTREGA } as any);
    expect(spy).toHaveBeenCalledWith([1, 1, 'entregas'], {
      relativeTo: TestBed.inject(ActivatedRoute),
    });
  });

  it('verItems navega a la ruta de items', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    component.verItems({ nroOC: 9 } as any);
    expect(spy).toHaveBeenCalledWith(['../items'], { relativeTo: TestBed.inject(ActivatedRoute), queryParams: { idOrdenCompra: 9 }, queryParamsHandling: 'merge' });
  });

  it('buscar obtiene items y total', () => {
    const service = TestBed.inject(ItemOrdenCompraService);
    spyOn(service, 'obtenerItemsDeOrdenCompra').and.returnValue(of({ content: [{ idItem: 1 }], page: { totalElements: 1 } }));
    component.idOrdenCompra = 2;
    component.buscar();
    expect(component.items.length).toBe(1);
    expect(component.total).toBe(1);
  });

  it('buscar maneja error del servicio', () => {
    const service = TestBed.inject(ItemOrdenCompraService);
    spyOn(service, 'obtenerItemsDeOrdenCompra').and.returnValue(throwError(() => 'err'));
    component.buscar();
    expect(logErrorSpy).toHaveBeenCalled();
  });

  it('nuevaConsulta reinicia parámetros y llama buscar', () => {
    const snapshot = TestBed.inject(SnapshotGenericService);
    const spyClear = spyOn(snapshot, 'clear');
    const spyBuscar = spyOn(component, 'buscar');
    component.filtroItemsComponent = { limpiar: () => { } } as any;
    component.items = [1 as any];
    component.parametros.filtro = { estado: 'X' } as any;
    component.nuevaConsulta();
    expect(component.items.length).toBe(0);
    expect(component.parametros.filtro).toEqual({ nroItem: undefined,
            codArticulo: undefined,
            descripcionArticulo: undefined,
            estado: 'PENDIENTE'});
    expect(spyClear).toHaveBeenCalledWith(SeguimientoItem.SNAPSHOT_KEY);
    expect(spyBuscar).toHaveBeenCalled();
  });

  it('cambioTipoDoc vuelve a setear el valor del control', fakeAsync(() => {
    const fb = TestBed.inject(FormBuilder);
    component.form.addControl('nroDocumento', fb.control('A'));
    const ctrl = component.form.get('nroDocumento')!;
    const spy = spyOn(ctrl, 'setValue').and.callThrough();
    component.cambioTipoDoc();
    tick();
    expect(spy).toHaveBeenCalledWith('A');
  }));

  it('obtenerAcciones agrega solo entregas cuando no hay entregables', () => {
    const acciones = (component as any).obtenerAcciones({ tipoArticulo: TipoArticuloServObra.SERVICIO, tieneCaracteristicas: false, cantidadEntregablesTotales: 0, cantidadEntregasTotales: 1, tipoCantidad: TipoCantidad.ENTREGA } as any);
    expect(acciones.map((a: any) => a.nombre)).toEqual(['Entregas ítem', 'Ajustes ítem']);
  });

  it('cantidades muestra texto para entregables', () => {
    const item: any = { tipoCantidad: TipoCantidad.ENTREGABLE, cantidadPendienteEntrega: 1, cantidadTotal: 2 };
    expect(component.cantidadesPendienteEntrega(item)).toBe('999 de 999');
  });

  it('cantidades muestra texto para entregas únicas', () => {
    const item: any = { tipoCantidad: TipoCantidad.ENTREGA, cantidadPendienteEntrega: 2, cantidadTotal: 3, cantidad: 1 };
    expect(component.cantidadesPendienteEntrega(item)).toBe('999 de 999');
  });

  it('cantidades muestra cantidad fija cuando no hay entregas ni entregables', () => {
    const item: any = { cantidad: 1, cantidadTotal: 1, tipoCantidad: TipoCantidad.ITEM };
    expect(component.cantidadesPendienteEntrega(item)).toBe('999 de 999');
  });

  it('cantidades usa unidad de medida cuando corresponde', () => {
    const item: any = { cantidadPendienteEntrega: 5, cantidadTotalMostrar: 10, descUnidadMedida: 'kg', tipoUnidad: undefined, cantidad: 10 };
    expect(component.cantidadesPendienteEntrega(item)).toBe('999 de 999');
  });

  it('volver navega según el tipo de seguimiento', () => {
    const router = TestBed.inject(Router);
    const spy = spyOn(router, 'navigate');
    component.tipoSeguimiento = TipoSeguimiento.Proveedor;
    component.volver();
    expect(spy).toHaveBeenCalledWith(['/entregas/seguimiento-proveedor'], { queryParams: { volver: '1' } });
    component.tipoSeguimiento = TipoSeguimiento.Organismo;
    component.volver();
    expect(spy).toHaveBeenCalledWith(['/entregas/seguimiento-organismo'], { queryParams: { volver: '1' } });
  });

  it("actualiza el filtro para Proveedor", () => {
    component.tipoSeguimiento = TipoSeguimiento.Proveedor;
    component.actualizarFiltro();
    expect(component.parametros.filtro.estado).toBe(EstadoItemOrdenCompra.PENDIENTE);
  });

  it("actualiza el filtro para Organismo", () => {
    component.tipoSeguimiento = TipoSeguimiento.Organismo;
    component.actualizarFiltro();
    expect(component.parametros.filtro.estado).toBe(EstadoItemOrdenCompra.PENDIENTE);
  });

  it('obtiene acciones para artículo', () => {
    const acciones = (component as any).obtenerAcciones({ tipoArticulo: TipoArticuloServObra.ARTICULO, tieneCaracteristicas: true, cantidadTotal: 0, tipoCantidad: TipoCantidad.ENTREGA } as any);
    expect(acciones.map((a: any) => a.nombre)).toEqual(['Entregas ítem', 'Ajustes ítem', 'Ver características']);
  });

  it('obtiene acciones para servicio', () => {
    const acciones = (component as any).obtenerAcciones({ tipoArticulo: TipoArticuloServObra.SERVICIO, tieneCaracteristicas: true, cantidadTotal: 0, tipoCantidad: TipoCantidad.ITEM } as any);
    expect(acciones.map((a: any) => a.nombre)).toEqual(['Entregables ítem', 'Entregas ítem', 'Ajustes ítem', 'Ver características']);
  });

  it('obtiene acciones para obra con entregables', () => {
    const acciones = (component as any).obtenerAcciones({ tipoArticulo: TipoArticuloServObra.OBRA, tieneCaracteristicas: false, cantidadTotal: 1, tipoCantidad: TipoCantidad.ENTREGABLE } as any);
    expect(acciones.map((a: any) => a.nombre)).toEqual(['Entregables ítem', 'Ajustes ítem']);
  });

  it('sin tipo de artículo retorna lista vacía', () => {
    const acciones = (component as any).obtenerAcciones({} as any);
    expect(acciones.length).toBe(0);
  });

  it('guarda el filtro usando el servicio de snapshot', () => {
    const service = TestBed.inject(SnapshotGenericService);
    const spy = spyOn(service, 'save');
    (component as any).guardarFiltro();
    expect(spy).toHaveBeenCalled();
  });

  it('cantidadesPendienteRecepcion usa valor proporcionado', () => {
    const item: any = { cantidadPendienteRecepcion: 1, cantidadPendienteEntrega: 2, cantidadPendienteAsignar: 1 };
    expect(component.cantidadesPendienteRecepcion(item)).toBe('2999 de 2999');
  });

  it('cantidadesPendienteRecepcion calcula cuando falta dato', () => {
    const item: any = { cantidadPendienteEntrega: 5, cantidadPendienteAsignar: 2 };
    expect(component.cantidadesPendienteRecepcion(item)).toBe('2999 de 2999');
  });

  it('cantidadesPendienteConformidad usa valor proporcionado', () => {
    const item: any = { cantidadPendienteConformidad: 2, cantidadTotal: 10, cantidadPendienteEntrega: 8 };
    expect(component.cantidadesPendienteConformidad(item)).toBe('1999 de 1999');
  });

  it('cantidadesPendienteConformidad calcula cuando falta dato', () => {
    const item: any = { cantidadTotal: 10, cantidadPendienteEntrega: 7 };
    expect(component.cantidadesPendienteConformidad(item)).toBe('1999 de 1999');
  });


  it('mostrarCheck respeta los permisos requeridos para organismo', () => {
    const seguridad = TestBed.inject(SeguridadService) as any;
    component.tipoUsuario = TipoUsuario.ORGANISMO;
    seguridad.tienePermiso.and.callFake((permiso: string) => permiso === 'GC_GESTION_RECEP.ALTA');
    const item: any = { puedeRecepcionEntregas: true, puedeConformidadEntregas: false, puedeAgregarAjusteAnulacion: false, puedeAgregarAjusteCantidad: false, puedeAgregarAjusteFecha: false };
    expect(component.mostrarCheck(item)).toBeTrue();
    seguridad.tienePermiso.and.returnValue(false);
    expect(component.mostrarCheck(item)).toBeFalse();
  });


  it('mostrarCheck respeta los permisos requeridos para proveedor', () => {
    const seguridad = TestBed.inject(SeguridadService) as any;
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    seguridad.tienePermiso.and.returnValue(true);
    const item: any = { puedeRecepcionEntregas: false, puedeConformidadEntregas: false, puedeAgregarAjusteAnulacion: true, puedeAgregarAjusteCantidad: true, puedeAgregarAjusteFecha: true };
    expect(component.mostrarCheck(item)).toBeTrue();
    seguridad.tienePermiso.and.returnValue(false);
    expect(component.mostrarCheck(item)).toBeTrue();
  });


  it('mostrarCheck respeta el estado del ítem', () => {
    const seguridad = TestBed.inject(SeguridadService) as any;
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    seguridad.tienePermiso.and.returnValue(true);
    const item: any = { puedeRecepcionEntregas: false, puedeConformidadEntregas: false, puedeAgregarAjusteAnulacion: false, puedeAgregarAjusteCantidad: false, puedeAgregarAjusteFecha: false };
    expect(component.mostrarCheck(item)).toBeFalse();
    seguridad.tienePermiso.and.returnValue(false);
    expect(component.mostrarCheck(item)).toBeFalse();
  });

  it('seleccionar actualiza los botones masivos y marca', () => {
    component.items = [
      { seleccionado: false, puedeRecepcionEntregas: true, puedeConformidadEntregas: true, puedeAgregarAjusteAnulacion: true, puedeAgregarAjusteCantidad: false, puedeAgregarAjusteFecha: false } as any,
      { seleccionado: false, puedeRecepcionEntregas: true, puedeConformidadEntregas: false, puedeAgregarAjusteAnulacion: false, puedeAgregarAjusteCantidad: false, puedeAgregarAjusteFecha: false } as any
    ];
    component.seleccionar(component.items[0], true);
    expect(component.items[0].seleccionado).toBeTrue();
    component.seleccionar(component.items[1], true);
    expect(component.sePuedeRecepcionarTodos).toBeTrue();
    expect(component.sePuedeDarConformidadTodos).toBeFalse();
    expect(component.sePuedeAjustarTodos).toBeTrue();
    component.seleccionar(component.items[0], false);
    expect(component.marcarTodos).toBeFalse();
  });

  it('mostrarFechaComprometidaOC detecta valores faltantes', () => {
    component.items = [{ fechaComprometida: null } as any, { fechaComprometida: '2024-01-01' } as any];
    expect(component.mostrarFechaComprometidaOC()).toBeTrue();
    component.items = [{ fechaComprometida: '2024-01-01' } as any];
    expect(component.mostrarFechaComprometidaOC()).toBeFalse();
  });

  it('recepcionarDarConformidadAjustarItemsSeleccionados maneja éxito y error', () => {
    component.items = [{ seleccionado: true } as any];
    const modal: any = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') };
    const accionExito = () => of([]);
    component.recepcionarDarConformidadAjustarItemsSeleccionados(accionExito, 'ok', 'err', modal);
    expect(component.marcarTodos).toBeFalse();
    const accionError = () => throwError(() => 'fallo');
    component.recepcionarDarConformidadAjustarItemsSeleccionados(accionError, 'ok', 'err', modal);
    expect(modal.procesarError).toHaveBeenCalledWith('fallo');
    expect(logErrorSpy).toHaveBeenCalledWith('err', 'fallo');
  });


  it('abrirPopupConItemsSeleccionadas refresca la orden de compra y abre el modal', () => {
    const modalRef: any = { guardarEvento: { subscribe: () => { } } };
    const abrirPopupSpy = spyOn(component as any, 'abrirPopup').and.returnValue(modalRef);
    component.items = [{ seleccionado: true } as any];
    component.ordenCompra = { idOC: 1 } as any;
    ordenCompraServiceMock.obtenerPorId.and.returnValue(of({ idOC: 9 } as any));

    component.abrirPopupConItemsSeleccionadas({} as any, () => { });

    expect(ordenCompraServiceMock.obtenerPorId).toHaveBeenCalledWith(1);
    expect(abrirPopupSpy).toHaveBeenCalled();
    expect(component.ordenCompra).toEqual(jasmine.objectContaining({ idOC: 9 }));
  });

  it('abrirPopupConItemsSeleccionadas muestra error si falla la actualización del cabezal', () => {
    const abrirPopupSpy = spyOn(component as any, 'abrirPopup');
    const actualizarService = component['actualizarService'];
    const mensajeErrorSpy = spyOn(actualizarService, 'mensajeError');
    ordenCompraServiceMock.obtenerPorId.and.returnValue(throwError(() => 'fallo'));
    component.items = [{ seleccionado: true } as any];

    component.abrirPopupConItemsSeleccionadas({} as any, () => { });

    expect(ordenCompraServiceMock.obtenerPorId).toHaveBeenCalled();
    expect(abrirPopupSpy).not.toHaveBeenCalled();
    expect(mensajeErrorSpy).toHaveBeenCalledWith('No fue posible obtener los datos actualizados de la orden de compra.');
    expect(logErrorSpy).toHaveBeenCalledWith('Error al actualizar los datos de la orden de compra para el popup', 'fallo');
  });

  it('abrirPopupAjustarSeleccionados muestra error si falla la actualización del cabezal', () => {
    const actualizarService = component['actualizarService'];
    const mensajeErrorSpy = spyOn(actualizarService, 'mensajeError');
    spyOn(component as any, 'abrirPopupXXL');
    ordenCompraServiceMock.obtenerPorId.and.returnValue(throwError(() => 'fallo'));
    component.items = [{ seleccionado: true } as any];

    component.abrirPopupAjustarSeleccionados();

    expect(ordenCompraServiceMock.obtenerPorId).toHaveBeenCalled();
    expect(mensajeErrorSpy).toHaveBeenCalledWith('No fue posible obtener los datos actualizados de la orden de compra.');
    expect(logErrorSpy).toHaveBeenCalledWith('Error al obtener la orden de compra para abrir el popup de ajustes', 'fallo');
  });

  it("debería abrir el popup de ajuste masivo con ítems seleccionados y procesar el emit", () => {
    const modalService = TestBed.inject(BsModalService) as any;
    const spyAjustar = spyOn(component as any, 'ajustarItemsSeleccionados');
    spyOn(modalService, 'show').and.callFake((_c: any, _cfg: any) => {
      const ref = new BsModalRef();
      (ref as any).content = { ajustesGuardados: { subscribe: (cb: any) => cb({ idOC: 1, ajusteDto: [], listadoAjustesErrores: [] } as any) } };
      return ref;
    });

    component.items = [{ seleccionado: true } as any];
    component.ordenCompra = { idOC: 1 } as any;
    component.tipoUsuario = TipoUsuario.PROVEEDOR;

    component.abrirPopupAjustarSeleccionados();

    expect(ordenCompraServiceMock.obtenerPorId).toHaveBeenCalled();
    expect(modalService.show).toHaveBeenCalled();
    expect(spyAjustar).toHaveBeenCalled();
  });

  it('ajustarItemsSeleccionados valida y procesa respuesta exitosa', () => {
    const actualizarService = TestBed.inject(ActualizarService);
    const mensajeCorrectoSpy = spyOn(actualizarService, 'mensajeCorrecto');
    const modalRef: any = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') };
    const request = { tipoSolicitante: TipoUsuario.PROVEEDOR, ajusteDto: [{ idAjuste: 1 } as any], listadoAjustesErrores: [] } as unknown as IAjustesItemsRequestDTO;
    const respuestaValidacion: IAjustesItemsResponseDTO = { ajustesProcesados: request.ajusteDto };
    const respuestaCreacion: IAjustesItemsResponseDTO = { listaMensajes: ['ok'], ajustesConError: [{} as any] };
    ajusteServiceMock.validarAjustesItemsSeleccionados.and.returnValue(of(respuestaValidacion));
    ajusteServiceMock.crearAjustesItemsSeleccionados.and.returnValue(of(respuestaCreacion));
    const buscarSpy = spyOn(component, 'buscar');
    const abrirPopupSpy = spyOn<any>(component, 'abrirPopup');

    component.ajustarItemsSeleccionados(request, modalRef);

    expect(ajusteServiceMock.validarAjustesItemsSeleccionados).toHaveBeenCalledWith(request, TipoUsuario.PROVEEDOR);
    expect(ajusteServiceMock.crearAjustesItemsSeleccionados).toHaveBeenCalledWith(
      jasmine.objectContaining({ ajusteDto: request.ajusteDto, listadoAjustesErrores: [] }),
      TipoUsuario.PROVEEDOR
    );
  expect(mensajeCorrectoSpy).toHaveBeenCalledWith('Su solicitud está pendiente de aprobación por parte del comprador');
    expect(buscarSpy).toHaveBeenCalled();
    expect(modalRef.cerrarPopup).toHaveBeenCalled();
    expect(abrirPopupSpy).not.toHaveBeenCalled();
  });

  it('ajustarItemsSeleccionados abre el popup de errores cuando la validación devuelve errores', () => {
    const actualizarService = TestBed.inject(ActualizarService);
    const mensajeCorrectoSpy = spyOn(actualizarService, 'mensajeCorrecto');
    const modalRef: any = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') };
    const request = { tipoSolicitante: TipoUsuario.PROVEEDOR, ajusteDto: [], listadoAjustesErrores: [] } as unknown as IAjustesItemsRequestDTO;
    const respuestaValidacion: IAjustesItemsResponseDTO = {
      ajustesProcesados: [{ idAjuste: 1 } as any],
      ajustesConError: [{
        idAjuste: 2,
        itemOrdenCompra: { nroItem: 5, codArticulo: 123, descArticulo: 'Articulo demo' } as any,
        mensajeError: 'Item con error'
      } as any]
    };
    const popupStub = {
      confirmar: new EventEmitter<void>(),
      cancelar: new EventEmitter<void>()
    } as AjusteErroresPopupComponent;
    const abrirPopupSpy = spyOn<any>(component, 'abrirPopup').and.returnValue(popupStub);

    ajusteServiceMock.validarAjustesItemsSeleccionados.and.returnValue(of(respuestaValidacion));
    ajusteServiceMock.crearAjustesItemsSeleccionados.and.returnValue(of({} as IAjustesItemsResponseDTO));

    component.ajustarItemsSeleccionados(request, modalRef);

    expect(abrirPopupSpy).toHaveBeenCalledWith(AjusteErroresPopupComponent, 'Crear ajustes', jasmine.objectContaining({
      initialState: jasmine.objectContaining({
        mensajeConfirmacion: jasmine.any(String),
        errores: respuestaValidacion.ajustesConError,
        deshabilitarGuardar: false
      })
    }));
    expect(ajusteServiceMock.crearAjustesItemsSeleccionados).not.toHaveBeenCalled();

    popupStub.confirmar.emit();

    expect(ajusteServiceMock.crearAjustesItemsSeleccionados).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ajusteDto: respuestaValidacion.ajustesProcesados,
        listadoAjustesErrores: respuestaValidacion.ajustesConError
      }),
      TipoUsuario.PROVEEDOR
    );
  expect(mensajeCorrectoSpy).toHaveBeenCalledWith('Su solicitud está pendiente de aprobación por parte del comprador');
    expect(modalRef.cerrarPopup).toHaveBeenCalled();
  });

  it('ajustarItemsSeleccionados deshabilita el boton Guardar cuando todos los ajustes tienen errores', () => {
    const modalRef: any = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') };
    const request = { tipoSolicitante: TipoUsuario.PROVEEDOR, ajusteDto: [{ idAjuste: 1 } as any], listadoAjustesErrores: [] } as unknown as IAjustesItemsRequestDTO;
    const respuestaValidacion: IAjustesItemsResponseDTO = {
      ajustesProcesados: [],
      ajustesConError: [{ idAjuste: 1 } as any]
    };
    const popupStub = {
      confirmar: new EventEmitter<void>(),
      cancelar: new EventEmitter<void>()
    } as AjusteErroresPopupComponent;
    const abrirPopupSpy = spyOn<any>(component, 'abrirPopup').and.returnValue(popupStub);

    ajusteServiceMock.validarAjustesItemsSeleccionados.and.returnValue(of(respuestaValidacion));
    ajusteServiceMock.crearAjustesItemsSeleccionados.and.returnValue(of({} as IAjustesItemsResponseDTO));

    component.ajustarItemsSeleccionados(request, modalRef);

    expect(abrirPopupSpy).toHaveBeenCalledWith(AjusteErroresPopupComponent, 'Crear ajustes', jasmine.objectContaining({
      initialState: jasmine.objectContaining({
        mensajeConfirmacion: 'No es posible crear los ajustes solicitados. Los siguientes ítems tienen errores:',
        errores: respuestaValidacion.ajustesConError,
        deshabilitarGuardar: true
      })
    }));
    expect(ajusteServiceMock.crearAjustesItemsSeleccionados).not.toHaveBeenCalled();
  });
  it('ajustarItemsSeleccionados usa el tipo del componente cuando no viene en la solicitud', () => {
    const actualizarService = TestBed.inject(ActualizarService);
    const mensajeCorrectoSpy = spyOn(actualizarService, 'mensajeCorrecto');
    const mensajeAdvertenciaSpy = spyOn(actualizarService, 'mensajeAdvertencia');
    const modalRef: any = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') };
    const respuesta: IAjustesItemsResponseDTO = { ajustesProcesados: [] };
    ajusteServiceMock.validarAjustesItemsSeleccionados.and.returnValue(of(respuesta));
    ajusteServiceMock.crearAjustesItemsSeleccionados.and.returnValue(of({} as IAjustesItemsResponseDTO));
    const buscarSpy = spyOn(component, 'buscar');
    const abrirPopupSpy = spyOn<any>(component, 'abrirPopup');
    component.tipoUsuario = TipoUsuario.ORGANISMO;

    const request = { ajusteDto: [], listadoAjustesErrores: [] } as unknown as IAjustesItemsRequestDTO;
    component.ajustarItemsSeleccionados(request, modalRef);

    expect(ajusteServiceMock.validarAjustesItemsSeleccionados).toHaveBeenCalledWith(request, TipoUsuario.ORGANISMO);
    expect(ajusteServiceMock.crearAjustesItemsSeleccionados).toHaveBeenCalledWith(
      jasmine.objectContaining({ ajusteDto: [] }),
      TipoUsuario.ORGANISMO
    );
    expect(mensajeCorrectoSpy).toHaveBeenCalledWith('Se ha creado el ajuste de forma exitosa');
    expect(mensajeAdvertenciaSpy).not.toHaveBeenCalled();
    expect(buscarSpy).toHaveBeenCalled();
    expect(modalRef.cerrarPopup).toHaveBeenCalled();
    expect(abrirPopupSpy).not.toHaveBeenCalled();
  });

  it('ajustarItemsSeleccionados maneja errores del servicio de creación', () => {
    const modalRef: any = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') };
    ajusteServiceMock.validarAjustesItemsSeleccionados.and.returnValue(of({ ajustesProcesados: [] } as IAjustesItemsResponseDTO));
    ajusteServiceMock.crearAjustesItemsSeleccionados.and.returnValue(throwError(() => 'fallo'));
    const abrirPopupSpy = spyOn<any>(component, 'abrirPopup');

    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    component.ajustarItemsSeleccionados({ ajusteDto: [], listadoAjustesErrores: [] } as unknown as IAjustesItemsRequestDTO, modalRef);

    expect(logErrorSpy).toHaveBeenCalledWith('Error al crear ajustes masivos', 'fallo');
    expect(modalRef.procesarError).toHaveBeenCalledWith('fallo');
    expect(modalRef.cerrarPopup).not.toHaveBeenCalled();
    expect(abrirPopupSpy).not.toHaveBeenCalled();
  });

  it('ajustarItemsSeleccionados maneja errores en la validación', () => {
    const modalRef: any = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') };
    ajusteServiceMock.validarAjustesItemsSeleccionados.and.returnValue(throwError(() => 'validacion'));
    component.tipoUsuario = TipoUsuario.PROVEEDOR;

    component.ajustarItemsSeleccionados({ ajusteDto: [], listadoAjustesErrores: [] } as unknown as IAjustesItemsRequestDTO, modalRef);

    expect(logErrorSpy).toHaveBeenCalledWith('Error al validar ajustes masivos', 'validacion');
    expect(modalRef.procesarError).toHaveBeenCalledWith('validacion');
    expect(ajusteServiceMock.crearAjustesItemsSeleccionados).not.toHaveBeenCalled();
  });


});
