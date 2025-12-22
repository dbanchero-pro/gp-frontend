import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Logger } from 'src/app/shared/utils/logger';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregableDTO } from '../../../models/entregable.model';
import { EntregableResumenPipe } from '../../../pipes/entregable-resumen.pipe';
import { ItemOrdenCompraResumenPipe } from '../../../pipes/item-orden-compra-resumen.pipe';
import { OrdenCompraResumenPipe } from '../../../pipes/orden-compra-resumen.pipe';
import { EntregaService } from '../../../services/entrega.service';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { EntregableComponent } from './entregable.component';

class MockRouter {
    url = '/entregas/seguimiento-organismo/items/1/3/entregables/2';
    navigate = jasmine.createSpy('navigate');
}
const ENTREGABLE_MOCK: IEntregableDTO =
    { idEntregable: 1, descEntregable: 'Entregable 1', itemOrdenCompra: { idItem: 1, tipoUnidad: TipoUnidad.CANTIDAD }, entregas: [] as any };

describe('EntregableComponent', () => {
    let component: EntregableComponent;
    let fixture: ComponentFixture<EntregableComponent>;
    let mockEntregableService: any;
    let mockEntregaService: any;
    let mockActualizarService: any;
    let mockOrdenCompraService: any;

    const router = new MockRouter();

    beforeEach(async () => {
        mockEntregableService = {
            obtenerCantidadEntregable: jasmine
                .createSpy('obtenerCantidadEntregable')
                .and.returnValue(10),
            obtenerCodigoEntregablesPorItem: () => of([]),
            obtenerEntregablesPorItem: () => of({ content: [], page: { totalElements: 0, totalPages: 0 } }),
            cantidadesPendienteEntrega: jasmine
                .createSpy('cantidadesPendienteEntrega')
                .and.returnValue('10 de 20 kg'),
            puedeRecepcionarEntrega: jasmine
                .createSpy('puedeRecepcionarEntrega')
                .and.returnValue(false),
            puedeDarConformidadEntrega: jasmine
                .createSpy('puedeDarConformidadEntrega')
                .and.returnValue(false),
            entregableTieneCantidadSinAsignar: jasmine
                .createSpy('entregableTieneCantidadSinAsignar')
                .and.returnValue(true),
            eliminarEntregable: jasmine
                .createSpy('eliminarEntregable')
                .and.returnValue(of({})),
            modificarEntregable: jasmine
                .createSpy('modificarEntregable')
                .and.returnValue(of({})),
            obtenerUnidades: jasmine
                .createSpy('obtenerUnidades')
                .and.returnValue('kg'),
        };

        mockEntregaService = {
            crearEntrega: jasmine
                .createSpy('crearEntrega')
                .and.returnValue(of({})),
        };

        mockActualizarService = {
            confirmar: jasmine
                .createSpy('confirmar')
                .and.callFake((_mensaje: string, aceptar: () => void) => aceptar()),
            mensajeCorrecto: jasmine.createSpy('mensajeCorrecto'),
            popups: [],
            capturarErrores: true,
        };

        mockOrdenCompraService = {
            obtenerPorId: jasmine
                .createSpy('obtenerPorId')
                .and.returnValue(of({})),
            usuarioLogueadoTienePermisosRecepcion: jasmine
                .createSpy('usuarioLogueadoTienePermisosRecepcion')
                .and.returnValue(of(true))
        };

        await TestBed.configureTestingModule({
            declarations: [
                EntregableComponent,
                EntregableResumenPipe,
                OrdenCompraResumenPipe,
                ItemOrdenCompraResumenPipe
            ],
            imports: [ReactiveFormsModule, SharedModule, NoopAnimationsModule],
            providers: [
                FormBuilder,
                { provide: Router, useValue: router },
                { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map([['idOrdenCompra', '1']]), queryParamMap: new Map(), data: { tipoSeguimiento: '' } } } },
                { provide: ActualizarService, useValue: mockActualizarService },
                {
                    provide: SeguridadService, useValue: {
                        obtenerTipoUsuario: () => TipoUsuario.ORGANISMO,
                        tienePermiso: () => true
                    }
                },
                { provide: ItemOrdenCompraService, useValue: { obtenerItemOrdenCompra: () => of({}) } },
                { provide: OrdenCompraService, useValue: mockOrdenCompraService },
                {
                    provide: EntregableService,
                    useValue: mockEntregableService,
                },
                { provide: EntregaService, useValue: mockEntregaService },
                { provide: SnapshotGenericService, useValue: { save: () => { } } },

            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(EntregableComponent);
        component = fixture.componentInstance;
        component.entregable = ENTREGABLE_MOCK;
        component.itemOrdenCompra = { idItem: 1, tipoUnidad: TipoUnidad.CANTIDAD } as any;
        component.ordenCompra = { idOC: 1 } as any;
        fixture.detectChanges();
        router.navigate.calls.reset();
        router.url = '/entregas/seguimiento-organismo/items/1/3/entregables/2';
    });

    it('debe crearse', () => {
        component.entregable = ENTREGABLE_MOCK;
        expect(component).toBeTruthy();
    });

    it('consulta los permisos de recepci�n al inicializarse para organismos', () => {
        expect(mockOrdenCompraService.usuarioLogueadoTienePermisosRecepcion)
            .toHaveBeenCalledWith(1);
        expect(component.tienePermisoRecepcion).toBeTrue();
    });

    it('habilita la recepci�n para proveedores sin consultar el servicio', () => {
        const seguridad = TestBed.inject(SeguridadService) as any;
        seguridad.obtenerTipoUsuario = jasmine.createSpy('obtenerTipoUsuario').and.returnValue(TipoUsuario.PROVEEDOR);
        component.tienePermisoRecepcion = false;
        mockOrdenCompraService.usuarioLogueadoTienePermisosRecepcion.calls.reset();

        component.ngOnInit();

        expect(component.tienePermisoRecepcion).toBeFalse();
        expect(mockOrdenCompraService.usuarioLogueadoTienePermisosRecepcion).not.toHaveBeenCalled();
        seguridad.obtenerTipoUsuario = () => TipoUsuario.ORGANISMO;
    });

    it('debe obtener acciones para organismo con entregable pendiente', () => {
        component.tipoUsuario = TipoUsuario.ORGANISMO;
        component.entregable.cantidadPendienteEntrega = 0;
        component.entregable.cantidadPendienteAsignar = 0;
        component.entregable.cantidad = 10;

        component.entregable.entregas = [];
        
        mockEntregableService.entregableTieneCantidadSinAsignar = jasmine
            .createSpy('entregableTieneCantidadSinAsignar')
            .and.returnValue(false);
                
        const acciones = component.obtenerAccionesEntregable();
        const nombres = acciones.map(a => a.nombre);
        expect(nombres).toEqual(['Modificar entregable', 'Eliminar entregable']);
    });

    it('debe obtener acciones para proveedor con distintos estados', () => {
        component.tipoUsuario = TipoUsuario.PROVEEDOR;
        component.entregable.cantidadPendienteEntrega = 10;

        component.entregable.cantidadPendienteAsignar = 5;
        component.entregable.cantidad = 20;

        mockEntregableService.entregableTieneCantidadSinAsignar = jasmine
            .createSpy('entregableTieneCantidadSinAsignar')
            .and.returnValue(true);

        let acciones = component.obtenerAccionesEntregable();
        expect(acciones.length).toBe(1);

    });

    it('debe agregar accion de entrega para organismo cuando hay cantidad sin asignar', () => {
        component.tipoUsuario = TipoUsuario.ORGANISMO;
        component.tienePermisoRecepcion = true;
        component.entregable.entregas = [];
        mockEntregableService.entregableTieneCantidadSinAsignar = jasmine
            .createSpy('entregableTieneCantidadSinAsignar')
            .and.returnValue(true);

        const acciones = component.obtenerAccionesEntregable();

        expect(acciones.some(a => a.nombre === 'Agregar entrega')).toBeTrue();
        const accion = acciones.find(a => a.nombre === 'Agregar entrega');
        expect(accion?.permisos).toContain('GC_GESTION_RECEP.ALTA');
    });

    it('debe agregar accion de entrega para proveedor sin permisos adicionales', () => {
        component.tipoUsuario = TipoUsuario.PROVEEDOR;
        component.tienePermisoRecepcion = true;
        component.entregable.entregas = [];
        mockEntregableService.entregableTieneCantidadSinAsignar = jasmine
            .createSpy('entregableTieneCantidadSinAsignar')
            .and.returnValue(true);

        const acciones = component.obtenerAccionesEntregable();
        const accion = acciones.find(a => a.nombre === 'Agregar entrega');

        expect(accion).toBeDefined();
        expect(accion?.permisos).toEqual([]);
    });

    it('debe eliminar el entregable y emitir la actualización cuando se confirma', () => {
        const emitirSpy = spyOn(component.actualizarEvento, 'emit');

        (component as any).eliminarEntregable();

        expect(mockActualizarService.confirmar).toHaveBeenCalled();
        expect(mockEntregableService.eliminarEntregable).toHaveBeenCalledWith(1);
        expect(mockActualizarService.mensajeCorrecto).toHaveBeenCalledWith('El entregable ha sido eliminado de forma exitosa.');
        expect(emitirSpy).toHaveBeenCalledWith({ idEntregable: 1 });
    });

    it('debe modificar el entregable y cerrar el popup cuando se guarda correctamente', () => {
        const emitSpy = spyOn(component.actualizarEvento, 'emit');
        const cerrarPopupSpy = spyOn(component, 'cerrarPopup');
        const popupStub = { mostrarError: jasmine.createSpy('mostrarError') } as any;
        const entregableModificado = { ...ENTREGABLE_MOCK, descEntregable: 'Editado' };

        (component as any).modificarEntregable(entregableModificado, popupStub);

        expect(mockEntregableService.modificarEntregable).toHaveBeenCalledWith(1, entregableModificado);
        expect(mockActualizarService.mensajeCorrecto).toHaveBeenCalledWith('El entregable se ha guardado de forma exitosa.');
        expect(component.entregable).toEqual(entregableModificado as any);
        expect(emitSpy).toHaveBeenCalledWith({ idEntregable: 1 });
        expect(cerrarPopupSpy).toHaveBeenCalled();
    });

    it('debe agregar la entrega y cerrar el popup al guardar', () => {
        const popupStub = { cerrarPopup: jasmine.createSpy('cerrarPopup') } as any;
        const emitSpy = spyOn(component.actualizarEvento, 'emit');

        (component as any).agregarEntrega({}, ENTREGABLE_MOCK, popupStub);

        expect(mockEntregaService.crearEntrega).toHaveBeenCalled();
        expect(mockActualizarService.mensajeCorrecto).toHaveBeenCalledWith('La entrega ha sido agregada de forma exitosa.');
        expect(emitSpy).toHaveBeenCalledWith({ idEntregable: 1 });
        expect(popupStub.cerrarPopup).toHaveBeenCalled();
    });

    it('debe mostrar error cuando falla la creacion de una entrega', () => {
        const popupStub = { cerrarPopup: jasmine.createSpy('cerrarPopup'), mostrarError: jasmine.createSpy('mostrarError') } as any;
        mockEntregaService.crearEntrega.and.returnValue(throwError(() => 'fallo entrega'));

        (component as any).agregarEntrega({}, ENTREGABLE_MOCK, popupStub);

        expect(popupStub.mostrarError).toHaveBeenCalledWith('fallo entrega', 'Error al agregar la entrega');
        mockEntregaService.crearEntrega.and.returnValue(of({}));
    });

    it('debe emitir la entrega seleccionada', () => {
        const seleccionarSpy = spyOn(component.seleccionado, 'emit');
        const entrega = { idEntrega: 3 } as any;

        component.seleccionarEntrega(entrega);

        expect(seleccionarSpy).toHaveBeenCalledWith(entrega);
    });

    it('debe registrar error cuando falla la eliminacion del entregable', () => {
        mockEntregableService.eliminarEntregable.and.returnValue(throwError(() => 'fallo eliminacion'));
        const logSpy = spyOn(Logger, 'logError');

        (component as any).eliminarEntregable();

        expect(logSpy).toHaveBeenCalledWith('Error al eliminar el entregable', 'fallo eliminacion');
        mockEntregableService.eliminarEntregable.and.returnValue(of({}));
    });

    it('debe mostrar error cuando la modificacion del entregable falla', () => {
        const popupStub = { mostrarError: jasmine.createSpy('mostrarError') } as any;
        const entregableModificado = { ...ENTREGABLE_MOCK, descEntregable: 'Error' };
        mockEntregableService.modificarEntregable.and.returnValue(throwError(() => 'error modificar'));

        (component as any).modificarEntregable(entregableModificado, popupStub);

        expect(popupStub.mostrarError).toHaveBeenCalledWith('error modificar');
        mockEntregableService.modificarEntregable.and.returnValue(of({}));
    });

    it('debe indicar solo para proveedores con entregas proximas', () => {
        component.entregable.proximoAVencerse = true;
        (component as any).seguridadService.obtenerTipoUsuario = () => TipoUsuario.PROVEEDOR;

        expect(component.fechaEntregaParaProveedor()).toBeTrue();

        component.entregable.proximoAVencerse = false;
        expect(component.fechaEntregaParaProveedor()).toBeFalse();
    });

    it('debe obtener la cantidad de entregas pendientes', () => {
        const entregable = {
            entregas: [
                { cantidadRecepcionAceptada: 1, cantidad: 2 },
                { cantidadRecepcionAceptada: 3, cantidad: 3 },
            ],
        } as any;

        const pendientes = component.obtenerCantidadEntregasPendientes(entregable);

        expect(pendientes).toBe(1);
    });

    it('debe delegar en el servicio las cantidades y unidades', () => {
        component.cantidadesPendienteEntrega();

        expect(mockEntregableService.cantidadesPendienteEntrega).toHaveBeenCalledWith(ENTREGABLE_MOCK, component.itemOrdenCompra);
    });

});

