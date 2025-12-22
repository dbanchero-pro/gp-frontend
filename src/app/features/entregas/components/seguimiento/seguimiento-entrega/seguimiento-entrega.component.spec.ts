import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of, throwError } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { ESTADO_ENTREGA_CODIGOS, EstadoEntrega } from '../../../enum/estado-entrega.enum';
import { TipoArticuloServObra } from '../../../enum/tipo-articulo-serv-obra';
import { EntregaService } from '../../../services/entrega.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { AgregarModificarEntregaBienPopupComponent } from '../agregar-modificar-entrega-bien-popup/agregar-modificar-entrega-bien-popup.component';
import { AgregarModificarEntregaObraPopupComponent } from '../agregar-modificar-entrega-obra-popup/agregar-modificar-entrega-obra-popup.component';
import { SeguimientoEntregaComponent } from './seguimiento-entrega.component';

describe('SeguimientoEntregaComponent', () => {
    let component: SeguimientoEntregaComponent;
    let fixture: ComponentFixture<SeguimientoEntregaComponent>;
    let actualizarService: jasmine.SpyObj<ActualizarService>;
    let entregaService: jasmine.SpyObj<EntregaService>;
    let ordenCompraService: jasmine.SpyObj<OrdenCompraService>;
    let itemOrdenCompraService: jasmine.SpyObj<ItemOrdenCompraService>;
    let router: any;

    beforeEach(async () => {
        actualizarService = jasmine.createSpyObj('ActualizarService', ['confirmar', 'mensajeCorrecto', 'mensajeOcultar', 'mensajeError']);
        entregaService = jasmine.createSpyObj('EntregaService', [
            'eliminarEntrega',
            'obtenerEntregas',
            'crearEntrega',
            'puedeRecepcionarMasivo',
            'puedeDarConformidadMasivo',
            'tieneSoloEntrega',
            'tieneSoloRecepcion',
            'tieneConformidad',
            'mostrarCheck'
        ]);
        entregaService.tieneSoloEntrega.and.callFake((entrega: any) => entrega.estado === EstadoEntrega.EN_TRANSITO);
        entregaService.tieneSoloRecepcion.and.callFake((entrega: any) => entrega.estado === EstadoEntrega.ENTREGA_ACEPTADA);
        entregaService.tieneConformidad.and.callFake((entrega: any) => entrega.estado === EstadoEntrega.CONFORMIDAD_EMITIDA);
        ordenCompraService = jasmine.createSpyObj('OrdenCompraService', ['obtenerPorId', 'usuarioLogueadoTienePermisosRecepcion']);
        itemOrdenCompraService = jasmine.createSpyObj('ItemOrdenCompraService', ['obtenerItemOrdenCompra']);
        router = { navigate: jasmine.createSpy('navigate'), url: '' } as any;
        ordenCompraService.obtenerPorId.and.returnValue(of({ idOC: 1 } as any));
        ordenCompraService.usuarioLogueadoTienePermisosRecepcion.and.returnValue(of(true));
        itemOrdenCompraService.obtenerItemOrdenCompra.and.returnValue(of({ tipoArticulo: TipoArticuloServObra.ARTICULO } as any));
        await TestBed.configureTestingModule({
            declarations: [SeguimientoEntregaComponent],
            imports: [ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: Router, useValue: router },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: { get: () => null } } }
                },
                { provide: ActualizarService, useValue: actualizarService },
                {
                    provide: SeguridadService,
                    useValue: {
                        obtenerTipoUsuario: () => TipoUsuario.ORGANISMO,
                        tienePermiso: () => true,
                        tieneAlgunPermiso:()  => true,
                        usuarioLogueadoEsUsuarioProveedor: () => false
                    }
                },
                { provide: OrdenCompraService, useValue: ordenCompraService },
                { provide: ItemOrdenCompraService, useValue: itemOrdenCompraService },
                { provide: EntregaService, useValue: entregaService },
                { provide: BsModalService, useValue: jasmine.createSpyObj('BsModalService', ['show']) }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(SeguimientoEntregaComponent);
        component = fixture.componentInstance;
        spyOn(component, 'buscar');
        fixture.detectChanges();
    });

    it('actualizarTiposEstadoSegunTipoArticulo cambia la lista según el tipo', () => {
        component.actualizarTiposEstadoSegunTipoArticulo(TipoArticuloServObra.SERVICIO);
        const idsServicio = component.tiposEstado.map(estado => estado.id);
        expect(idsServicio).toContain(ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_CURSO]);
        expect(idsServicio).not.toContain(ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_TRANSITO]);
        component.actualizarTiposEstadoSegunTipoArticulo();
        const idsBienes = component.tiposEstado.map(estado => estado.id);
        expect(idsBienes).toContain(ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_TRANSITO]);
        expect(idsBienes).not.toContain(ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_CURSO]);
    });

    it('buscar obtiene entregas y configura los paneles', () => {
        (component.buscar as jasmine.Spy).and.callThrough();
        component.ordenCompra = { compra: { idCompra: 2 }, idOC: 3 } as any;
        component.idOrdenCompra = 3;
        component.idItemOrdenCompra = 4;
        component.idVariacion = 5;
        const respuesta = {
            content: [
                { estado: EstadoEntrega.EN_TRANSITO },
                { estado: EstadoEntrega.ENTREGA_ACEPTADA },
                { estado: EstadoEntrega.CONFORMIDAD_EMITIDA }
            ],
            page: { totalElements: 3 }
        };
        entregaService.obtenerEntregas.and.returnValue(of(respuesta as any));
        component.form.patchValue({ estado: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_TRANSITO] });
        component.actualizarFiltrosYBuscar();
        expect(entregaService.obtenerEntregas).toHaveBeenCalledWith({
            idOC: 3,
            idCompra: 2,
            idItemCompra: 4,
            idVariacion: 5,
            page: 0,
            size: 10,
            sort: 'estado',
            order: 'asc',
            estadoEntrega: ESTADO_ENTREGA_CODIGOS[EstadoEntrega.EN_TRANSITO]
        });
        expect(component.total).toBe(3);
        expect(component.entCol[0]).toBeTrue();
        expect(component.recCol[1]).toBeTrue();
        expect(component.confCol[2]).toBeTrue();
    });

    it('buscar maneja error y limpia las entregas', () => {
        (component.buscar as jasmine.Spy).and.callThrough();
        component.ordenCompra = { compra: { idCompra: 2 }, idOC: 3 } as any;
        component.idOrdenCompra = 3;
        component.idItemOrdenCompra = 4;
        component.idVariacion = 5;
        entregaService.obtenerEntregas.and.returnValue(throwError(() => 'error'));
        spyOn(Logger, 'logError');
        component.form.patchValue({ estado: null });
        component.buscar();
        expect(Logger.logError).toHaveBeenCalled();
        expect(component.entregas).toEqual([]);
        expect(component.total).toBe(0);
    });

    it('volver navega al listado de seguimiento correspondiente', () => {
        router.url = '/entregas/seguimiento-proveedor/ordenes/1/items';
        component.volver();
        expect(router.navigate).toHaveBeenCalledWith([
            '/entregas/seguimiento-proveedor/ordenes/1/items'
        ], { queryParams: { volver: '1' } });
    });

    it('volver navega al listado genérico cuando no es seguimiento', () => {
        router.url = '/entregas/ordenes/5/items';
        component.volver();
        expect(router.navigate).toHaveBeenCalledWith([
            '/entregas/ordenes/5/items'
        ], { queryParams: { volver: '1' } });
    });

    it('puedeAgregarEntrega verifica las condiciones correctamente', () => {
        component.tipoUsuario = TipoUsuario.PROVEEDOR;
        component.itemOrdenCompra = { cantidadPendienteAsignar: 1 } as any;
        expect(component.puedeAgregarEntrega()).toBeTrue();
        component.itemOrdenCompra = undefined as any;
        expect(component.puedeAgregarEntrega()).toBeFalse();
    });

    it('abrirPopupAgregarEntrega abre popup de obra y guarda', () => {
        component.itemOrdenCompra = { tipoArticulo: TipoArticuloServObra.OBRA } as any;
        component.ordenCompra = {} as any;
        component.entregas = [];
        const modalRef = { guardarEvento: of({}), bsModalRef: { hide: jasmine.createSpy('hide') } } as any;
        spyOn(component as any, 'abrirPopup').and.returnValue(modalRef);
        const guardarSpy = spyOn(component, 'guardarEntrega');
        component.abrirPopupAgregarEntrega();
        expect(actualizarService.mensajeOcultar).toHaveBeenCalled();
        expect((component as any).abrirPopup).toHaveBeenCalledWith(
            AgregarModificarEntregaObraPopupComponent,
            undefined,
            jasmine.any(Object)
        );
        expect(guardarSpy).toHaveBeenCalled();
    });

    it('abrirPopupAgregarEntrega abre popup de bien y guarda', () => {
        component.itemOrdenCompra = { tipoArticulo: TipoArticuloServObra.ARTICULO } as any;
        component.ordenCompra = {} as any;
        const modalRef = { guardarEvento: of({}), bsModalRef: { hide: jasmine.createSpy('hide') } } as any;
        spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
        const guardarSpy = spyOn(component, 'guardarEntrega');
        component.abrirPopupAgregarEntrega();
        expect(actualizarService.mensajeOcultar).toHaveBeenCalled();
        expect((component as any).abrirPopupGrande).toHaveBeenCalledWith(
            AgregarModificarEntregaBienPopupComponent,
            undefined,
            jasmine.any(Object)
        );
        expect(guardarSpy).toHaveBeenCalled();
    });

    it('guardarEntrega crea la entrega y refresca datos', () => {
        const dto = {} as any;
        component.tipoUsuario = TipoUsuario.ORGANISMO;
        const popup = { cerrarPopup: jasmine.createSpy('cerrarPopup'), bsModalRef: { hide: jasmine.createSpy('hide') }, mostrarError: jasmine.createSpy('mostrarError') } as any;
        entregaService.crearEntrega.and.returnValue(of({} as any));
        component.guardarEntrega(dto, popup);
        expect(entregaService.crearEntrega).toHaveBeenCalledWith(dto, TipoUsuario.ORGANISMO);
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    });

    it('nuevaConsulta reinicia el formulario y busca nuevamente', () => {
        component.form.patchValue({ estado: 'ALGUNO' });
        component.entregas = [{}];
        component.total = 5;
        component.nuevaConsulta();
        expect(component.form.value.estado).toBeNull();
        expect(component.entregas).toEqual([]);
        expect(component.total).toBe(-1);
        expect(component.buscar).toHaveBeenCalled();
    });

    it('marcarDesmarcarEntregasTodos alterna la selección de entregas', () => {
        component.entregas = [{}, {}] as any[];
        spyOn(component, 'mostrarCheck').and.returnValue(true);
        component.marcarDesmarcarEntregasTodos();
        expect(component.entregas.every(e => e.seleccionado)).toBeTrue();
        expect(component.marcarTodos).toBeTrue();
        component.marcarDesmarcarEntregasTodos();
        expect(component.entregas.every(e => !e.seleccionado)).toBeTrue();
        expect(component.marcarTodos).toBeFalse();
    });

    it('puedeRecepcionarEntrega y puedeDarConformidadEntrega evalúan las entregas', () => {
        component.entregas = [{ cantidadRecepcionAceptada: undefined }, { cantidadConformidadAceptada: null }] as any[];
        entregaService.puedeRecepcionarMasivo.and.returnValue(true);
        entregaService.puedeDarConformidadMasivo.and.returnValue(true);
        expect(component.puedeRecepcionarEntregaMasivo()).toBeTrue();
        expect(component.puedeDarConformidadEntregaMasivo()).toBeTrue();
        component.entregas = [{} as any];
        entregaService.puedeRecepcionarMasivo.and.returnValue(false);
        entregaService.puedeDarConformidadMasivo.and.returnValue(false);
        expect(component.puedeRecepcionarEntregaMasivo()).toBeFalse();
        expect(component.puedeDarConformidadEntregaMasivo()).toBeFalse();
    });

    it('abrirPopupConEntregasSeleccionadas muestra error si no hay entregas seleccionadas', () => {
        component.entregas = [{ seleccionado: false }] as any[];
        spyOn(component as any, 'abrirPopup');
        component.abrirPopupConEntregasSeleccionadas({}, () => { });
        expect(actualizarService.mensajeError).toHaveBeenCalledWith('Debe seleccionar al menos una entrega');
        expect((component as any).abrirPopup).not.toHaveBeenCalled();
    });

    it('abrirPopupConEntregasSeleccionadas actualiza el cabezal antes de abrir el modal', () => {
        const modalRef: any = { guardarEvento: { subscribe: () => { } } };
        spyOn(component as any, 'abrirPopup').and.returnValue(modalRef);
        component.entregas = [{ seleccionado: true } as any];
        component.ordenCompra = { idOC: 1 } as any;
        component.itemOrdenCompra = { idOC: 1, idItem: 2, idVariacion: 0 } as any;
        component.idOrdenCompra = 1;
        component.idItemOrdenCompra = 2;
        component.idVariacion = 0;
        ordenCompraService.obtenerPorId.and.returnValue(of({ idOC: 10 } as any));
        itemOrdenCompraService.obtenerItemOrdenCompra.and.returnValue(of({ idItem: 20 } as any));

        component.abrirPopupConEntregasSeleccionadas({} as any, () => { });

        expect(ordenCompraService.obtenerPorId).toHaveBeenCalledWith(1);
        expect(itemOrdenCompraService.obtenerItemOrdenCompra).toHaveBeenCalledWith(1, 2, 0);
        expect((component as any).abrirPopup).toHaveBeenCalled();
    });

    it('abrirPopupConEntregasSeleccionadas muestra error si falla la actualización del cabezal', () => {
        spyOn(component as any, 'abrirPopup');
        ordenCompraService.obtenerPorId.and.returnValue(throwError(() => 'fallo'));
        component.entregas = [{ seleccionado: true } as any];
        component.idOrdenCompra = 1;
        component.idItemOrdenCompra = 2;
        component.idVariacion = 0;
        spyOn(Logger, 'logError');

        component.abrirPopupConEntregasSeleccionadas({} as any, () => { });

        expect(actualizarService.mensajeError).toHaveBeenCalledWith('No fue posible obtener los datos actualizados.');
        expect((component as any).abrirPopup).not.toHaveBeenCalled();
        expect(Logger.logError).toHaveBeenCalledWith('Error al actualizar los datos del cabezal para el popup', 'fallo');
    });

    it('recepcionarDarConformidadEntregasSeleccionadas ejecuta acción y refresca datos', () => {
        const accion = jasmine.createSpy().and.returnValue(of([]));
        const modalRef = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') } as any;
        actualizarService.mensajeCorrecto.calls.reset();
        (component.buscar as jasmine.Spy).calls.reset();
        component.recepcionarDarConformidadEntregasSeleccionadas(accion as any, modalRef);
        expect(accion).toHaveBeenCalled();
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
        expect(component.buscar).toHaveBeenCalled();
        expect(modalRef.cerrarPopup).toHaveBeenCalled();
    });


    it('recepcionarDarConformidadEntregasSeleccionadas maneja error', () => {
        const accion = jasmine.createSpy().and.returnValue(throwError(() => 'err'));
        const modalRef = { cerrarPopup: jasmine.createSpy('cerrarPopup'), procesarError: jasmine.createSpy('procesarError') } as any;
        spyOn(Logger, 'logError');
        component.recepcionarDarConformidadEntregasSeleccionadas(accion as any, modalRef);
        expect(Logger.logError).toHaveBeenCalled();
        expect(modalRef.procesarError).toHaveBeenCalled();
    });

    it('controlarPermisos redirige cuando no tiene permisos', () => {
        const seguridad = TestBed.inject(SeguridadService) as any;
        spyOn(seguridad, 'obtenerTipoUsuario').and.returnValue('OTRO');
        spyOn(seguridad, 'tieneAlgunPermiso').and.returnValue(false);
        component.controlarPermisos();
        expect(router.navigate).toHaveBeenCalledWith(['/403']);
    });

    it('buscar no consulta si el formulario es inválido', () => {
        (component.buscar as jasmine.Spy).and.callThrough();
        entregaService.obtenerEntregas.calls.reset();
        component.form.setErrors({ invalido: true });
        component.buscar();
        expect(entregaService.obtenerEntregas).not.toHaveBeenCalled();
    });

    it('actualizarEventoEntrega reinicia selección y obtiene item', () => {
        (component.buscar as jasmine.Spy).and.callThrough();
        spyOn(component as any, 'actualizarFiltro').and.callThrough();
        spyOn(component as any, 'obtenerItemOrdenCompra').and.callThrough();
        entregaService.obtenerEntregas.and.returnValue(of({ content: [], page: { totalElements: 0 } } as any));
        component.actualizarEventoEntrega();
        expect(component.marcarTodos).toBeFalse();
        expect(component.hayItemsSeleccionados).toBeFalse();
        expect(component['obtenerItemOrdenCompra']).toHaveBeenCalled();
    });

    it('puedeAgregarEntrega requiere permisos de organismo', () => {
        const seguridad = TestBed.inject(SeguridadService) as any;
        spyOn(seguridad, 'tienePermiso').and.returnValue(false);
        component.tipoUsuario = TipoUsuario.ORGANISMO;
        component.tienePermisoRecepcion = true;
        component.itemOrdenCompra = { cantidadPendienteAsignar: 1, tieneAjustesBloqueantes: false } as any;
        expect(component.puedeAgregarEntrega()).toBeFalse();
    });

    it('marcarDesmarcarEntregasTodos no marca cuando mostrarCheck es falso', () => {
        component.entregas = [{}, {}] as any[];
        spyOn(component, 'mostrarCheck').and.returnValue(false);
        component.marcarDesmarcarEntregasTodos();
        expect(component.entregas.some(e => e.seleccionado)).toBeFalse();
        expect(component.marcarTodos).toBeTrue();
    });
});
