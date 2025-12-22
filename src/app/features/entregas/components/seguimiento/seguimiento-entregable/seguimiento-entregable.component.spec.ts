import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject, throwError } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Logger } from 'src/app/shared/utils/logger';
import { IEntregableDTO } from '../../../models/entregable.model';
import { EntregableResumenPipe } from '../../../pipes/entregable-resumen.pipe';
import { ItemOrdenCompraResumenPipe } from '../../../pipes/item-orden-compra-resumen.pipe';
import { OrdenCompraResumenPipe } from '../../../pipes/orden-compra-resumen.pipe';
import { EntregaService } from '../../../services/entrega.service';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { SeguimientoEntregableComponent } from './seguimiento-entregable.component';
const ENTREGABLES_MOCK: IEntregableDTO[] = [
    { idEntregable: 1, descEntregable: 'Entregable 1', itemOrdenCompra: { idItem: 1 }, entregas: [] as any },
    { idEntregable: 2, descEntregable: 'Entregable 2', itemOrdenCompra: { idItem: 1 }, entregas: [] as any },
    { idEntregable: 3, descEntregable: 'Entregable 3', itemOrdenCompra: { idItem: 1 }, entregas: [] as any }
];

describe('SeguimientoEntregableComponent', () => {
    let component: SeguimientoEntregableComponent;
    let fixture: ComponentFixture<SeguimientoEntregableComponent>;
    let router: Router;
    let urlSpy: jasmine.Spy;
    let ordenCompraServiceMock: jasmine.SpyObj<OrdenCompraService>;
    let itemOrdenCompraServiceMock: jasmine.SpyObj<ItemOrdenCompraService>;
  let entregaService = {
    mostrarCheck: () => true,
    recepcionarEntregasSeleccionadas: () => of([]),
    darConformidadEntregasSeleccionadas: () => of([]),
    puedeRecepcionarMasivo: () => true,
    puedeDarConformidadMasivo: () => true
  };

    beforeEach(async () => {
      ordenCompraServiceMock = jasmine.createSpyObj<OrdenCompraService>('OrdenCompraService', ['obtenerPorId','usuarioLogueadoTienePermisosRecepcion']);
      ordenCompraServiceMock.obtenerPorId.and.returnValue(of({} as any));
      ordenCompraServiceMock.usuarioLogueadoTienePermisosRecepcion.and.returnValue(of(true));
      itemOrdenCompraServiceMock = jasmine.createSpyObj<ItemOrdenCompraService>('ItemOrdenCompraService', ['obtenerItemOrdenCompra', 'cantidadesPendienteEntregaYTotal', 'obtenerAtributos']);
      itemOrdenCompraServiceMock.obtenerItemOrdenCompra.and.returnValue(of({} as any));
      itemOrdenCompraServiceMock.cantidadesPendienteEntregaYTotal.and.returnValue('');
      itemOrdenCompraServiceMock.obtenerAtributos.and.returnValue(of({} as any));
      await TestBed.configureTestingModule({
          declarations: [
              SeguimientoEntregableComponent,
              EntregableResumenPipe,
              OrdenCompraResumenPipe,
              ItemOrdenCompraResumenPipe
          ],
          imports: [ReactiveFormsModule, SharedModule, NoopAnimationsModule, RouterTestingModule],
          providers: [
              FormBuilder,
            { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['idOrdenCompra','1']]), queryParamMap: new Map(), data: { tipoSeguimiento: '' } } } },
            { provide: ActualizarService, useValue: { popups:[], confirmar: jasmine.createSpy('confirmar'), mensajeCorrecto: jasmine.createSpy('mensajeCorrecto'), mensajeError: jasmine.createSpy('mensajeError'), mensajeOcultar: jasmine.createSpy('mensajeOcultar'), capturarErrores: true } },
            { provide: SeguridadService, useValue: {
              obtenerTipoUsuario: () => TipoUsuario.ORGANISMO,
              tienePermiso: (permiso: string) => true,
              tieneAlgunPermiso:()  => true,
            } },
            { provide: ItemOrdenCompraService, useValue: itemOrdenCompraServiceMock },
            { provide: OrdenCompraService, useValue: ordenCompraServiceMock },
            {
              provide: EntregableService, useValue: {
                obtenerCodigoEntregablesPorItem: () => of([]),
                obtenerEntregablesPorItem: () => of({ content: [], page: { totalElements: 0, totalPages: 0 } }),
                crearEntregable: () => of({})
              }
            },
            { provide: EntregaService, useValue: entregaService },
            { provide: SnapshotGenericService, useValue: { save: () => {}} },

          ],
          schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    });

  beforeEach(() => {
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    urlSpy = spyOnProperty(router, 'url', 'get');
    urlSpy.and.returnValue('/entregas/seguimiento-organismo/ordenes/1/items/2/3/entregables');
    fixture = TestBed.createComponent(SeguimientoEntregableComponent);
    component = fixture.componentInstance;
    component.entregables = ENTREGABLES_MOCK;
    fixture.detectChanges();
  });

    it('debe crearse', () => {
        expect(component).toBeTruthy();
    });

    it('debe buscar y asignar el total', () => {
        component.buscar();
        expect(component.total).toBe(0);
        expect(component.ordenCompra).toBeTruthy();
        expect(component.itemOrdenCompra).toBeTruthy();
    });

    it('debe navegar al volver', () => {
        component.volver();
    expect(router.navigate).toHaveBeenCalledWith(['/entregas/seguimiento-organismo/ordenes/1/items'], { queryParams: { volver: '1' } });
    });

    it('navega usando el fallback si no coincide la ruta', () => {
        urlSpy.and.returnValue('/entregas/ordenes/5/items');
        component.volver();
        expect(router.navigate).toHaveBeenCalledWith(['/entregas/ordenes/5/items'], { queryParams: { volver: '1' } });
    });

  it('navega sin coincidencias', () => {
    urlSpy.and.returnValue('/otra');
    component.volver();
    expect(router.navigate).toHaveBeenCalledWith([''], { queryParams: { volver: '1' } });
  });

  it('agrega entregables localmente', () => {
    const nuevo = { idEntregable: 10 } as any;
    spyOn(component as any, 'actualizarEventoEntregable');
    (component as any).agregarNuevoEntregable(nuevo);
    expect(component.entregables.some((e: any) => e.idEntregable === 10)).toBeTrue();
   });

  it('buscar conserva la página y asigna id de item', () => {
    component.idItemOrdenCompra = 5;
    component.parametros = { pagina: 2, itemsPorPagina: 10, filtro: {}, sort: 'codigo', order: 'desc' } as any;
    const service = TestBed.inject(EntregableService);
    const spy = spyOn(service, 'obtenerEntregablesPorItem').and.returnValue(of({ content: [], page: { totalElements: 0, totalPages: 0 } } as any));
    component.buscar();
    expect(spy).toHaveBeenCalled();
    expect(component.parametros.pagina).toBe(2);
    expect(component.parametros.filtro.idItemOrdenCompra).toBe(5);
  });

  it('inicializa ids en 0 cuando no hay parámetros', () => {
    const route = TestBed.inject(ActivatedRoute) as any;
    const original = route.snapshot.paramMap;
    route.snapshot.paramMap = new Map();
    const fixtureLocal = TestBed.createComponent(SeguimientoEntregableComponent);
    const comp = fixtureLocal.componentInstance;
    expect(comp.idOrdenCompra).toBe(0);
    expect(comp.idItemOrdenCompra).toBe(0);
    route.snapshot.paramMap = original;
  });

  it('agrega entregable cuando la lista está vacía', () => {
    spyOn(component as any, 'actualizarEventoEntregable');
    component.entregables = undefined as any;
    const nuevo = { idEntregable: 20 } as any;

    (component as any).agregarNuevoEntregable(nuevo);
    expect(component.entregables?.length).toBe(1);
  });

  it('puede agregar entregable cuando hay cantidad pendiente', () => {
    component.itemOrdenCompra = { cantidadPendienteAsignar: 1 } as any;
    expect(component.puedeAgregarEntregable()).toBeTrue();
  });

  it('no puede agregar entregable sin cantidad pendiente', () => {
    component.itemOrdenCompra = { cantidadPendienteAsignar: 0 } as any;
    expect(component.puedeAgregarEntregable()).toBeFalse();
  });

  it('no puede agregar entregable sin permiso', () => {
    component.itemOrdenCompra = { cantidadPendienteAsignar: 1 } as any;
    const seguridad = TestBed.inject(SeguridadService);
    spyOn(seguridad, 'tienePermiso').and.returnValue(false);
    expect(component.puedeAgregarEntregable()).toBeFalse();
  });

  it('marca y desmarca entregas según la visibilidad', () => {
    const entregaService = TestBed.inject(EntregaService);
    spyOn(entregaService, 'mostrarCheck').and.callFake((e: any) => e.visible);
    component.entregables = [{ entregas: [{ visible: true, seleccionado: false }, { visible: false, seleccionado: false }] }] as any;
    component.marcarDesmarcarEntregasTodos();
    expect(component.entregables![0].entregas![0].seleccionado).toBeTrue();
    expect(component.entregables![0].entregas![1].seleccionado).toBeFalse();
    component.marcarDesmarcarEntregasTodos();
    expect(component.entregables![0].entregas![0].seleccionado).toBeFalse();
  });

  it('abrirPopupConEntregasSeleccionadas muestra error si no hay entregas', () => {
    const act = TestBed.inject(ActualizarService);
    component.entregables = [{ entregas: [{ seleccionado: false }] }] as any;
    component.abrirPopupConEntregasSeleccionadas({}, () => {});
    expect(act.mensajeError).toHaveBeenCalledWith('Debe seleccionar al menos una entrega');
  });

  it('abrirPopupConEntregasSeleccionadas abre el popup y ejecuta la acción', () => {
    const subject = new Subject<any>();
    const modalRef = { guardarEvento: subject.asObservable() } as any;
    spyOn(component, 'abrirPopup').and.returnValue(modalRef);
    const accion = jasmine.createSpy('accion');
    component.entregables = [{ entregas: [{ seleccionado: true }] }] as any;
    component.abrirPopupConEntregasSeleccionadas({}, accion);
    subject.next({ prueba: 1 });
    expect(component.abrirPopup).toHaveBeenCalled();
    expect(accion).toHaveBeenCalledWith({ prueba: 1 }, modalRef);
  })

  it('abrirPopupConEntregasSeleccionadas actualiza el cabezal antes de abrir el modal', () => {
    const modalRef: any = { guardarEvento: { subscribe: () => { } } };
    const abrirPopupSpy = spyOn(component, 'abrirPopup').and.returnValue(modalRef);
    component.entregables = [{ entregas: [{ seleccionado: true }] }] as any;
    component.idOrdenCompra = 1;
    component.idItemOrdenCompra = 2;
    component.idVariacion = 0;
    ordenCompraServiceMock.obtenerPorId.and.returnValue(of({ idOC: 10 } as any));
    itemOrdenCompraServiceMock.obtenerItemOrdenCompra.and.returnValue(of({ idItem: 20 } as any));

    component.abrirPopupConEntregasSeleccionadas({} as any, () => { });

    expect(ordenCompraServiceMock.obtenerPorId).toHaveBeenCalledWith(1);
    expect(itemOrdenCompraServiceMock.obtenerItemOrdenCompra).toHaveBeenCalledWith(1, 2, 0);
    expect(abrirPopupSpy).toHaveBeenCalled();
    expect(component.ordenCompra).toEqual(jasmine.objectContaining({ idOC: 10 }));
    expect(component.itemOrdenCompra).toEqual(jasmine.objectContaining({ idItem: 20 }));
  });

  it('abrirPopupConEntregasSeleccionadas muestra error si falla la actualización del cabezal', () => {
    spyOn(component, 'abrirPopup');
    const actualizarService = TestBed.inject(ActualizarService) as any;
    ordenCompraServiceMock.obtenerPorId.and.returnValue(throwError(() => 'fallo'));
    component.idOrdenCompra = 1;
    component.idItemOrdenCompra = 2;
    component.idVariacion = 0;
    component.entregables = [{ entregas: [{ seleccionado: true }] }] as any;
    spyOn(Logger, 'logError');

    component.abrirPopupConEntregasSeleccionadas({} as any, () => { });

    expect(actualizarService.mensajeError).toHaveBeenCalledWith('No fue posible obtener los datos actualizados.');
    expect(component.abrirPopup).not.toHaveBeenCalled();
    expect(Logger.logError).toHaveBeenCalledWith('Error al actualizar los datos del cabezal para el popup', 'fallo');
  });

  it('detecta la posibilidad de recepcionar o dar conformidad', () => {
    component.entregables = [{ entregas: [{ seleccionado: true }, { seleccionado: false }] }] as any;
    spyOn(entregaService, 'puedeRecepcionarMasivo').and.returnValue(true);
    expect(component.puedeRecepcionarEntregaMasivo()).toBeTrue();
    expect(component.puedeDarConformidadEntregaMasivo()).toBeTrue();
    component.entregables = [{} as any];
    expect(component.puedeRecepcionarEntregaMasivo()).toBeFalse();
    expect(component.puedeDarConformidadEntregaMasivo()).toBeFalse();
  });

  it('no puede recepcionar masivo con perfil proveedor', () => {
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    spyOn(TestBed.inject(SeguridadService), 'tienePermiso').and.returnValue(true);
    component.entregables = [{ entregas: [{ puedeRecepcionEntregas: true }] }] as any;
    expect(component.puedeRecepcionarEntregaMasivo()).toBeFalse();
  });

  it('obtiene las entregas seleccionadas y verifica existencia', () => {
    component.entregables = [
      { entregas: [{ seleccionado: true }, { seleccionado: false }] },
      { entregas: [] }
    ] as any;
    expect(component.obtenerEntregasSeleccionadas().length).toBe(1);
    expect(component.hayEntregasSeleccionadas()).toBeTrue();
    component.entregables = [{ entregas: [{ seleccionado: false }] }] as any;
    expect(component.hayEntregasSeleccionadas()).toBeFalse();
  });

  it('procesa correctamente la recepción de entregas seleccionadas', () => {
    const act = TestBed.inject(ActualizarService);
    const modalRef = { cerrarPopup: jasmine.createSpy('cerrar'), procesarError: jasmine.createSpy('procesarError') } as any;
    const accion = jasmine.createSpy('accion').and.returnValue(of([]));
    component.recepcionarDarConformidadEntregasSeleccionadas(accion, modalRef);
    expect(accion).toHaveBeenCalled();
    expect(act.mensajeCorrecto).toHaveBeenCalled();
    expect(modalRef.cerrarPopup).toHaveBeenCalled();
  });

  it('maneja errores al procesar la recepción', () => {
    const modalRef = { cerrarPopup: jasmine.createSpy('cerrar'), procesarError: jasmine.createSpy('procesarError') } as any;
    const accion = jasmine.createSpy('accion').and.returnValue(throwError(() => 'err'));
    spyOn(Logger, 'logError');
    component.recepcionarDarConformidadEntregasSeleccionadas(accion, modalRef);
    expect(Logger.logError).toHaveBeenCalled();
    expect(modalRef.procesarError).toHaveBeenCalled();
  });

  it('obtiene la orden de compra como proveedor y actualiza los entregables', () => {
    ordenCompraServiceMock.obtenerPorId.and.returnValue(of({ idOC: 1 } as any));
    const actualizarSpy = spyOn(component, 'actualizarEventoEntregable');
    component.tipoUsuario = TipoUsuario.PROVEEDOR;
    component.idItemOrdenCompra = 1;
    (component as any).obtenerOrdenCompra();
    expect(component.ordenCompra).toEqual(jasmine.objectContaining({ idOC: 1 }));
    expect(actualizarSpy).toHaveBeenCalled();
  });

});
