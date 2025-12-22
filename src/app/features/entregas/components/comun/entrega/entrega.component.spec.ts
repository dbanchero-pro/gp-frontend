import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of, throwError } from 'rxjs';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoEntrega } from '../../../enum/estado-entrega.enum';
import { EntregaService } from '../../../services/entrega.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { EntregaComponent } from './entrega.component';

describe('EntregaComponent', () => {
    let component: EntregaComponent;
    let fixture: ComponentFixture<EntregaComponent>;
    let actualizarService: jasmine.SpyObj<ActualizarService>;
    let entregaService: jasmine.SpyObj<EntregaService>;
    let seguridadService: jasmine.SpyObj<SeguridadService>;
    let documentosUtilService: jasmine.SpyObj<DocumentosUtilService>;
    let ordenCompraService: jasmine.SpyObj<OrdenCompraService>;
    let itemOrdenCompraService: jasmine.SpyObj<ItemOrdenCompraService>;

    beforeEach(async () => {
        actualizarService = jasmine.createSpyObj('ActualizarService', ['confirmar', 'mensajeCorrecto', 'mensajeError', 'mensajeOcultar']);
        actualizarService.popups = [];
        actualizarService.capturarErrores = false;
        entregaService = jasmine.createSpyObj('EntregaService', [
            'eliminarEntrega',
            'descargarDocumento',
            'modificarEntrega',
            'mostrarCheck',
            'recepcionFueraFecha',
            'eliminarRecepcion',
            'eliminarConformidad',
            'modificarRecepcion',
            'recepcionEntrega',
            'modificarConformidad',
            'darConformidadEntrega',
            'tieneSoloEntrega',
            'tieneSoloRecepcion',
            'tieneConformidad',
            'tieneRecepcion',
            'tieneRechazosUObservaciones'
        ]);
        entregaService.mostrarCheck.and.returnValue(false);
        entregaService.tieneSoloEntrega.and.returnValue(true);
        entregaService.tieneSoloRecepcion.and.returnValue(false);
        entregaService.tieneConformidad.and.callFake((entrega: any) => !!entrega?.cantidadConformidadAceptada);
        entregaService.tieneRecepcion.and.callFake((entrega: any) => !!entrega?.cantidadRecepcionAceptada);
        seguridadService = jasmine.createSpyObj('SeguridadService', ['obtenerTipoUsuario', 'tienePermiso', 'usuarioLogueadoEsUsuarioProveedor']);
        seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.ORGANISMO);
        seguridadService.usuarioLogueadoEsUsuarioProveedor.and.returnValue(false);
        seguridadService.tienePermiso.and.returnValue(true);
        documentosUtilService = jasmine.createSpyObj('DocumentosUtilService', ['descargarDocumento']);
        ordenCompraService = jasmine.createSpyObj('OrdenCompraService', ['obtenerPorId', 'usuarioLogueadoTienePermisosRecepcion']);
        ordenCompraService.usuarioLogueadoTienePermisosRecepcion.and.returnValue(of(false));
        ordenCompraService.obtenerPorId.and.returnValue(of({ idOC: 1 } as any));
        itemOrdenCompraService = jasmine.createSpyObj('ItemOrdenCompraService', ['obtenerItemOrdenCompra']);
        itemOrdenCompraService.obtenerItemOrdenCompra.and.returnValue(of({ idItem: 1 } as any));
        await TestBed.configureTestingModule({
            declarations: [EntregaComponent],
            imports: [ReactiveFormsModule],
            providers: [
                FormBuilder,
                { provide: Router, useValue: {} },
                {
                    provide: ActivatedRoute,
                    useValue: { snapshot: { paramMap: { get: () => null } } }
                },
                { provide: ActualizarService, useValue: actualizarService },
                { provide: SeguridadService, useValue: seguridadService },
        
                { provide: ItemOrdenCompraService, useValue: itemOrdenCompraService },
                { provide: EntregaService, useValue: entregaService },
                { provide: DocumentosUtilService, useValue: documentosUtilService },
                { provide: BsModalService, useValue: jasmine.createSpyObj('BsModalService', ['show']) },
                { provide: OrdenCompraService, useValue: ordenCompraService }
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(EntregaComponent);
        component = fixture.componentInstance;
        component.entrega = {
            idEntrega: 1, estado: EstadoEntrega.EN_TRANSITO
        } as any;
        component.ordenCompra = { idOC: 1 } as any;
        component.itemOrdenCompra = { tieneAjustesBloqueantes: false } as any;
        fixture.detectChanges();
    });

    it('obtenerAccionesEntrega devuelve acciones para EN_TRANSITO', () => {
        component.entrega = { estado: EstadoEntrega.EN_TRANSITO } as any;
        component.sePuedeGestionarEntregasYRecepcionar = jasmine.createSpy('sePuedeGestionarEntregasYRecepcionar').and.returnValue(true);
        const acciones = component.obtenerAcciones();
        expect(acciones.length).toBe(2);
        expect(acciones[0].nombre).toBe('Modificar entrega');
    });

    it('obtenerAccionesEntrega devuelve acciones para EN_CURSO', () => {
        component.entrega = { idEntrega: 1, estado: EstadoEntrega.EN_CURSO } as any;
        component.sePuedeGestionarEntregasYRecepcionar = jasmine.createSpy('sePuedeGestionarEntregasYRecepcionar').and.returnValue(true);
        const acciones = component.obtenerAcciones();
        expect(acciones.length).toBe(2);
        expect(acciones[0].nombre).toBe('Modificar entrega');
    });

    it('descargarDocumento delega en DocumentosUtilService cuando existe id de entrega', () => {
        const documento = { id: 1 } as any;
        component.entrega = { idEntrega: 1 } as any;

        component.descargarDocumento(documento);

        expect(documentosUtilService.descargarDocumento).toHaveBeenCalledWith(documento, 1);
    });

    it('muestra documentos en una lista con botones accesibles', () => {
        component.entrega = {
            idEntrega: 1,
            estado: EstadoEntrega.EN_TRANSITO,
            descargos: [
                { id: 1, archivo: { id: 1, nombre: 'doc1' } },
                { id: 2, archivo: { id: 2, nombre: 'doc2' } }
            ]
        } as any;
        fixture.detectChanges();
        const elementos: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('.border-bottom div');
        const items = Array.from(elementos).filter(el => el.innerText == 'Adjunto');

        expect(items.length).toBe(2);
    });

    it('obtenerAccionesEntrega maneja estados adicionales y permisos de proveedor', () => {
        component.tipoUsuario = TipoUsuario.PROVEEDOR;

        component.entrega = { estado: EstadoEntrega.EN_TRANSITO } as any;
        const accionesTransito = component.obtenerAcciones();
        expect(accionesTransito[0].permisos).toEqual([]);

        component.entrega = { estado: EstadoEntrega.EN_PREPARACION } as any;
        const accionesPreparacion = component.obtenerAcciones();
        expect(accionesPreparacion.length).toBe(2);
        expect(accionesPreparacion[1].permisos).toEqual([]);

        component.entrega = { estado: EstadoEntrega.ENTREGADO } as any;
        const accionesEntregado = component.obtenerAcciones();
        expect(accionesEntregado.length).toBe(2);
        expect(accionesEntregado[1].permisos).toEqual([]);
    });

    it('descargarDocumento envía undefined como id cuando no existe en la entrega', () => {
        const documento = { id: 1 } as any;
        component.entrega = {} as any;

        component.descargarDocumento(documento);

        expect(documentosUtilService.descargarDocumento).toHaveBeenCalledWith(documento, undefined);
    });

    it('modificarEntrega loguea error cuando no existe el id de la entrega', () => {
        spyOn(Logger, 'logError');
        component.entrega = undefined as any;
        (component as any).modificarEntrega({} as any);
        expect(Logger.logError).toHaveBeenCalled();
    });

    it('modificarEntrega actualiza cuando existe id de entrega', () => {
        component.entrega = { idEntrega: 3 } as any;
        entregaService.modificarEntrega.and.returnValue({ subscribe: (obs: any) => obs.next() } as any);
        spyOn(component.actualizarEvento, 'emit');

        (component as any).modificarEntrega({} as any);

        expect(entregaService.modificarEntrega).toHaveBeenCalled();
        expect(component.actualizarEvento.emit).toHaveBeenCalledWith({ idEntrega: 3 });
    });

    it('ngOnInit establece datos de usuario y etiqueta cuando hay entregable', () => {
        seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.PROVEEDOR);
        seguridadService.usuarioLogueadoEsUsuarioProveedor.and.returnValue(true);
        component.entrega = { entregable: {} } as any;

        component.ngOnInit();

        expect(component.tipoUsuario).toBe(TipoUsuario.PROVEEDOR);
        expect(component.esUsuarioProveedor).toBeTrue();
        expect(component.etiquetaCantidad).toBe('Cantidad');
    });

    it('ngOnInit define etiqueta por defecto cuando no hay entregable', () => {
        seguridadService.obtenerTipoUsuario.and.returnValue(TipoUsuario.ORGANISMO);
        seguridadService.usuarioLogueadoEsUsuarioProveedor.and.returnValue(false);
        component.entrega = {} as any;

        component.ngOnInit();

        expect(component.etiquetaCantidad).toBe('Cantidad prevista');
        expect(component.esUsuarioProveedor).toBeFalse();
    });

    it('eliminarEntrega llama al servicio y emite evento cuando confirma', () => {
        actualizarService.confirmar.and.callFake((_m: any, cb: Function) => cb());
        entregaService.eliminarEntrega.and.returnValue({
            subscribe: (fn: any) => {
                if (typeof fn === 'function') {
                    fn();
                } else if (fn && typeof fn.next === 'function') {
                    fn.next();
                }
                return { unsubscribe: () => {} };
            } 
        } as any);
        spyOn(component.actualizarEvento, 'emit');
        component.entrega = { idEntrega: 7 } as any;

        component.eliminarEntrega();

        expect(entregaService.eliminarEntrega).toHaveBeenCalledWith(7, component.tipoUsuario);
        expect(component.actualizarEvento.emit).toHaveBeenCalledWith({ idEntrega: 7, idItem: undefined });
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    });

    it('abrirPopupAgregarModificarEntrega retorna sin llamar al popup si falta la entrega', () => {
        spyOn(component as any, 'abrirPopup');
        component.entrega = undefined as any;
        (component as any).abrirPopupAgregarModificarEntrega();
        expect((component as any).abrirPopup).not.toHaveBeenCalled();
    });

    it('obtenerAcciones agrega opción de descargo para proveedores con observaciones', () => {
        component.tipoUsuario = TipoUsuario.PROVEEDOR;
        entregaService.tieneSoloEntrega.and.returnValue(false);
        entregaService.tieneSoloRecepcion.and.returnValue(false);
        entregaService.tieneRecepcion.and.returnValue(false);
        entregaService.tieneConformidad.and.returnValue(false);
        entregaService.tieneRechazosUObservaciones.and.returnValue(true);
        component.entrega = { puedeRecepcionEntregas: false } as any;

        const acciones = component.obtenerAcciones();

        expect(acciones.some(a => a.nombre === 'Realizar descargo')).toBeTrue();
    });

    it('obtenerAcciones agrega acción de dar conformidad cuando solo hay recepción', () => {
        entregaService.tieneSoloEntrega.and.returnValue(false);
        entregaService.tieneSoloRecepcion.and.returnValue(true);
        component.entrega = { cantidadRecepcionAceptada: 2, puedeConformidadEntregas: true } as any;

        const acciones = component.obtenerAcciones();

        expect(acciones.some(a => a.nombre === 'Dar conformidad')).toBeTrue();
    });

    it('obtenerAcciones agrega acciones de recepción cuando no hay conformidad', () => {
        entregaService.tieneSoloEntrega.and.returnValue(false);
        entregaService.tieneSoloRecepcion.and.returnValue(false);
        entregaService.tieneRecepcion.and.returnValue(true);
        entregaService.tieneConformidad.and.returnValue(false);
        component.entrega = { puedeRecepcionEntregas: true } as any;

        const acciones = component.obtenerAcciones();

        expect(acciones.find(a => a.nombre === 'Modificar recepción')).toBeDefined();
        expect(acciones.find(a => a.nombre === 'Eliminar recepción')).toBeDefined();
    });

    it('obtenerAcciones agrega acciones de conformidad cuando está habilitada', () => {
        entregaService.tieneSoloEntrega.and.returnValue(false);
        entregaService.tieneSoloRecepcion.and.returnValue(false);
        entregaService.tieneRecepcion.and.returnValue(false);
        entregaService.tieneConformidad.and.returnValue(true);
        component.entrega = { puedeConformidadEntregas: true } as any;

        const acciones = component.obtenerAcciones();

        expect(acciones.find(a => a.nombre === 'Modificar conformidad')).toBeDefined();
        expect(acciones.find(a => a.nombre === 'Eliminar conformidad')).toBeDefined();
    });

    it('eliminarRecepcion ejecuta el servicio y emite el evento correspondiente', () => {
        actualizarService.confirmar.and.callFake((_m: any, cb: Function) => cb());
        entregaService.eliminarRecepcion.and.returnValue(of({} as any));
        spyOn(component.actualizarEvento, 'emit');
        component.entrega = { idEntrega: 9 } as any;

        (component as any).eliminarRecepcion();

        expect(entregaService.eliminarRecepcion).toHaveBeenCalledWith(9);
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalledWith('La recepción se ha eliminado de forma exitosa');
        expect(component.actualizarEvento.emit).toHaveBeenCalledWith({ idEntrega: 9, idItem: undefined });
    });

    it('eliminarConformidad ejecuta el servicio y muestra el mensaje de éxito', () => {
        actualizarService.confirmar.and.callFake((_m: any, cb: Function) => cb());
        entregaService.eliminarConformidad.and.returnValue(of({} as any));
        spyOn(component.actualizarEvento, 'emit');
        component.entrega = { idEntrega: 12 } as any;

        (component as any).eliminarConformidad();

        expect(entregaService.eliminarConformidad).toHaveBeenCalledWith(12);
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalledWith('La conformidad se ha eliminado de forma exitosa');
        expect(component.actualizarEvento.emit).toHaveBeenCalledWith({ idEntrega: 12, idItem: undefined });
    });

    it('eliminarRecepcionConformidad registra un error cuando falta el identificador', () => {
        actualizarService.confirmar.and.callFake((_m: any, cb: Function) => cb());
        const accion = jasmine.createSpy('accion');
        component.entrega = {} as any;
        spyOn(Logger, 'logError');

        (component as any).eliminarRecepcionConformidad(true, accion);

        expect(accion).not.toHaveBeenCalled();
        expect(Logger.logError).toHaveBeenCalledWith('No se puede eliminar la recepción: identififcador de entrega no válido');
    });

    it('abrirPopupAgregarDescargo emite el evento de actualización tras guardar', () => {
        const modalRef = { descargoAgregado: new EventEmitter<any>() } as any;
        spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
        spyOn(component.actualizarEvento, 'emit');
        component.entrega = { idEntrega: 15, cantidad: 3 } as any;

        component.abrirPopupAgregarDescargo();
        modalRef.descargoAgregado.emit({});

        expect(component.actualizarEvento.emit).toHaveBeenCalledWith({ idEntrega: 15 });
    });

    it('abrirPopupAgregarModificarEntrega invoca modificarEntrega cuando se guarda', () => {
        const modalRef = { guardarEvento: new EventEmitter<any>() } as any;
        spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
        const modificarSpy = spyOn<any>(component, 'modificarEntrega');
        component.entrega = { cantidad: 4 } as any;

        component.abrirPopupAgregarModificarEntrega();
        const dto = { idEntrega: 20 } as any;
        modalRef.guardarEvento.emit(dto);

        expect(modificarSpy).toHaveBeenCalledWith(dto, modalRef);
    });

    it('abrirPopupModificarEntregaObra invoca modificarEntrega tras la confirmación', () => {
        const modalRef = { guardarEvento: new EventEmitter<any>() } as any;
        spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
        const modificarSpy = spyOn<any>(component, 'modificarEntrega');
        component.entrega = { cantidad: 5 } as any;
        component.entregable = { idEntregable: 1 } as any;

        component.abrirPopupModificarEntregaObra();
        const dto = { idEntrega: 21 } as any;
        modalRef.guardarEvento.emit(dto);

        expect(modificarSpy).toHaveBeenCalledWith(dto, modalRef);
    });

    it('abrirPopupAgregarModificarRecepcion usa el servicio correcto cuando es modificación', () => {
        const modalRef = { guardarEvento: new EventEmitter<any>() } as any;
        spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
        const modificarSpy = spyOn<any>(component, 'modificarRecepcionarDarConformidadEntrega').and.callFake((dto: any, accion: any) => {
            accion(5, dto);
        });
        entregaService.modificarRecepcion.and.returnValue(of({} as any));
        component.entrega = { cantidad: 6 } as any;

        component.abrirPopupAgregarModificarRecepcion(true);
        const dto = { dato: 'recepción' } as any;
        modalRef.guardarEvento.emit(dto);

        expect(modificarSpy).toHaveBeenCalled();
        expect(entregaService.modificarRecepcion).toHaveBeenCalledWith(5, dto);
    });

    it('abrirPopupAgregarModificarRecepcion usa el servicio correcto cuando es alta', () => {
        const modalRef = { guardarEvento: new EventEmitter<any>() } as any;
        spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
        const modificarSpy = spyOn<any>(component, 'modificarRecepcionarDarConformidadEntrega').and.callFake((dto: any, accion: any) => {
            accion(7, dto);
        });
        entregaService.recepcionEntrega.and.returnValue(of({} as any));
        component.entrega = { cantidad: 7 } as any;

        component.abrirPopupAgregarModificarRecepcion(false);
        const dto = { dato: 'alta' } as any;
        modalRef.guardarEvento.emit(dto);

        expect(modificarSpy).toHaveBeenCalled();
        expect(entregaService.recepcionEntrega).toHaveBeenCalledWith(7, dto);
    });

    it('abrirPopupAgregarModificarConformidad usa el servicio correcto cuando es modificación', () => {
        const modalRef = { guardarEvento: new EventEmitter<any>() } as any;
        spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
        const modificarSpy = spyOn<any>(component, 'modificarRecepcionarDarConformidadEntrega').and.callFake((dto: any, accion: any) => {
            accion(8, dto);
        });
        entregaService.modificarConformidad.and.returnValue(of({} as any));
        component.entrega = { cantidad: 8 } as any;

        component.abrirPopupAgregarModificarConformidad(true);
        const dto = { dato: 'conf' } as any;
        modalRef.guardarEvento.emit(dto);

        expect(modificarSpy).toHaveBeenCalled();
        expect(entregaService.modificarConformidad).toHaveBeenCalledWith(8, dto);
    });

    it('abrirPopupAgregarModificarConformidad usa el servicio correcto cuando es alta', () => {
        const modalRef = { guardarEvento: new EventEmitter<any>() } as any;
        spyOn(component as any, 'abrirPopupGrande').and.returnValue(modalRef);
        const modificarSpy = spyOn<any>(component, 'modificarRecepcionarDarConformidadEntrega').and.callFake((dto: any, accion: any) => {
            accion(9, dto);
        });
        entregaService.darConformidadEntrega.and.returnValue(of({} as any));
        component.entrega = { cantidad: 9 } as any;

        component.abrirPopupAgregarModificarConformidad(false);
        const dto = { dato: 'alta conf' } as any;
        modalRef.guardarEvento.emit(dto);

        expect(modificarSpy).toHaveBeenCalled();
        expect(entregaService.darConformidadEntrega).toHaveBeenCalledWith(9, dto);
    });

    it('modificarRecepcionarDarConformidadEntrega maneja la respuesta exitosa', fakeAsync(() => {
        const dto = { dato: 'ok' } as any;
        const accion = jasmine.createSpy('accion').and.returnValue(of({}));
        spyOn(component, 'cerrarPopup');
        const emitirSpy = spyOn(component.actualizarEvento, 'emit');
        component.entrega = { idEntrega: 25 } as any;

        (component as any).modificarRecepcionarDarConformidadEntrega(dto, accion, 'Éxito total', 'Error grave');

        expect(accion).toHaveBeenCalledWith(25, dto);
        expect(component.cerrarPopup).toHaveBeenCalled();
        expect(actualizarService.capturarErrores).toBeFalse();
        expect(emitirSpy).toHaveBeenCalledWith({ idEntrega: 25 });

        tick();
        expect(actualizarService.mensajeOcultar).toHaveBeenCalled();
        tick(100);
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalledWith('Éxito total');
    }));

    it('modificarRecepcionarDarConformidadEntrega gestiona los errores del servicio', () => {
        const dto = { dato: 'error' } as any;
        const popup = { procesarError: jasmine.createSpy('procesarError') } as any;
        const accion = jasmine.createSpy('accion').and.returnValue(throwError(() => 'fallo'));
        spyOn(Logger, 'logError');
        spyOn(component.actualizarEvento, 'emit');
        component.entrega = { idEntrega: 30 } as any;

        (component as any).modificarRecepcionarDarConformidadEntrega(dto, accion, 'Éxito', 'Mensaje de error', popup);

        expect(accion).toHaveBeenCalledWith(30, dto);
        expect(Logger.logError).toHaveBeenCalledWith('Mensaje de error', 'fallo');
        expect(popup.procesarError).toHaveBeenCalledWith('fallo', 'Mensaje de error');
        expect(component.actualizarEvento.emit).not.toHaveBeenCalled();
    });

    it('funciones de estado retornan los valores esperados', () => {
        expect(component.estadoAmarillo(EstadoEntrega.EN_CURSO)).toBeTrue();
        expect(component.estadoAmarillo(EstadoEntrega.EN_TRANSITO)).toBeTrue();
        expect(component.estadoAmarillo(EstadoEntrega.EN_PREPARACION)).toBeTrue();
        expect(component.estadoAmarillo(EstadoEntrega.ENTREGADO)).toBeTrue();
        expect(component.estadoAmarillo(EstadoEntrega.CONFORMIDAD_EMITIDA)).toBeFalse();

        expect(component.estadoRojo(EstadoEntrega.CONFORMIDAD_PARCIAL)).toBeTrue();
        expect(component.estadoRojo(EstadoEntrega.CONFORMIDAD_RECHAZADA)).toBeTrue();
        expect(component.estadoRojo(EstadoEntrega.ENTREGA_RECHAZADA)).toBeTrue();
        expect(component.estadoRojo(EstadoEntrega.ENTREGA_PARCIAL)).toBeTrue();
        expect(component.estadoRojo(EstadoEntrega.EN_CURSO)).toBeFalse();

        expect(component.estadoVerde(EstadoEntrega.CONFORMIDAD_EMITIDA)).toBeTrue();
        expect(component.estadoVerde(EstadoEntrega.ENTREGA_ACEPTADA)).toBeTrue();
        expect(component.estadoVerde(EstadoEntrega.EN_CURSO)).toBeFalse();

        component.entrega = { cantidadConformidadAceptada: 1 } as any;
        expect(component.tieneConformidad()).toBeTrue();
        component.entrega.cantidadConformidadAceptada = undefined;
        expect(component.tieneConformidad()).toBeFalse();

        component.entrega.cantidadRecepcionAceptada = 1;
        expect(component.tieneRecepcion()).toBeTrue();
        component.entrega.cantidadRecepcionAceptada = undefined;
        expect(component.tieneRecepcion()).toBeFalse();
    });

    it('no muestra acciones de modificación/eliminación de recepción para proveedor', () => {
       
        component.tipoUsuario = TipoUsuario.PROVEEDOR;
        component.entrega = { estado: EstadoEntrega.EN_CURSO, puedeRecepcionEntregas: true, cantidadRecepcionAceptada: 1 } as any;
        entregaService.tieneSoloEntrega.and.returnValue(false);
        entregaService.tieneRecepcion.and.returnValue(true);
        const acciones = component.obtenerAcciones();
        expect(acciones.some(a => (a.nombre || '').toLowerCase().includes('recep'))).toBeFalse();
    });

    it('ejecutarConCabezalActualizado actualiza los datos antes de abrir el popup', () => {
        component.ordenCompra = { idOC: 7 } as any;
        component.itemOrdenCompra = { idOC: 7, idItem: 3, idVariacion: 2 } as any;
        ordenCompraService.obtenerPorId.and.returnValue(of({ idOC: 11 } as any));
        itemOrdenCompraService.obtenerItemOrdenCompra.and.returnValue(of({ idItem: 30 } as any));
        const accion = jasmine.createSpy('accion');

        (component as any).ejecutarConCabezalActualizado(accion, 'ctx');

        expect(ordenCompraService.obtenerPorId).toHaveBeenCalledWith(7);
        expect(itemOrdenCompraService.obtenerItemOrdenCompra).toHaveBeenCalledWith(7, 3, 2);
        expect(accion).toHaveBeenCalled();
        expect(component.ordenCompra).toEqual(jasmine.objectContaining({ idOC: 11 }));
        expect(component.itemOrdenCompra).toEqual(jasmine.objectContaining({ idItem: 30 }));
    });

    it('ejecutarConCabezalActualizado muestra un error si falla la actualización', () => {
        component.ordenCompra = { idOC: 9 } as any;
        const accion = jasmine.createSpy('accion');
        ordenCompraService.obtenerPorId.and.returnValue(throwError(() => 'fallo'));
        const logErrorSpy = spyOn(Logger, 'logError');

        (component as any).ejecutarConCabezalActualizado(accion, 'contexto');

        expect(accion).not.toHaveBeenCalled();
        expect(actualizarService.mensajeError).toHaveBeenCalledWith('No fue posible obtener los datos actualizados.');
        expect(logErrorSpy).toHaveBeenCalledWith('contexto', 'fallo');
    });

});
