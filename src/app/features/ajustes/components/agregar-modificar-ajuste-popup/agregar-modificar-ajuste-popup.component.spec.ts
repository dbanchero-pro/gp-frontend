import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { PuntosRecepcionService } from 'src/app/features/administracion/puntos-recepcion/services/puntosRecepcion.service';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { EstadoAjuste } from '../../enum/estado-ajuste.enum';
import { TipoAjuste } from '../../enum/tipo-ajuste.enum';
import { IAjusteDTO } from '../../models/ajuste.model';
import { AjusteService } from '../../services/ajuste.service';
import { AgregarModificarAjustePopupComponent } from './agregar-modificar-ajuste-popup.component';

class MockModalRef {
    hide = jasmine.createSpy('hide');
}

class ActualizarServiceStub {
    popups: any[] = [];
    capturarErrores = true;
    confirmar = jasmine.createSpy('confirmar').and.callFake((_mensaje: string, aceptar: () => void) => aceptar());
    mensajeError = jasmine.createSpy('mensajeError');
    mensajeOcultar = jasmine.createSpy('mensajeOcultar');
}

class DocumentosUtilServiceStub {
    eliminarDocumento(documentos: ArchivoDTO[], documento: ArchivoDTO): ArchivoDTO[] {
        if (!documento) {
            return documentos;
        }
        if (documento.id && documento.id < 0) {
            return documentos.filter(d => d.id !== documento.id);
        }
        documento.modificado = true;
        documento.eliminado = true;
        return [...documentos];
    }

    obtenerDocumentosAMostrar(documentos: ArchivoDTO[]): ArchivoDTO[] {
        return documentos.filter(d => d.eliminado !== true);
    }
}

class BsModalServiceStub {
    contentFactory: () => any = () => ({ documentoAgregado: { subscribe: () => undefined } });
    show = jasmine.createSpy('show').and.callFake((_component, _config) => ({
        content: this.contentFactory(),
        hide: jasmine.createSpy('hide'),
    }));
}

describe('AgregarModificarAjustePopupComponent', () => {
    let fixture: ComponentFixture<AgregarModificarAjustePopupComponent>;
    let component: AgregarModificarAjustePopupComponent;
    let actualizarServiceStub: ActualizarServiceStub;
    let puntosRecepcionServiceSpy: jasmine.SpyObj<PuntosRecepcionService>;
    let documentosUtilServiceStub: DocumentosUtilServiceStub;
    let archivoServiceSpy: jasmine.SpyObj<ArchivoService>;
    let modalServiceStub: BsModalServiceStub;
    let seguridadServiceSpy: jasmine.SpyObj<SeguridadService>;
    let usuarioServiceSpy: jasmine.SpyObj<UsuarioService>;
    let ajusteServiceSpy: jasmine.SpyObj<AjusteService>;

    const toDateInput = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fechaRelativa = (diasDesdeHoy: number): string => {
        const date = new Date();
        date.setDate(date.getDate() + diasDesdeHoy);
        return toDateInput(date);
    };

    beforeEach(async () => {
        actualizarServiceStub = new ActualizarServiceStub();
        puntosRecepcionServiceSpy = jasmine.createSpyObj<PuntosRecepcionService>('PuntosRecepcionService', [
            'obtenerZonasPorOrdenCompra',
            'obtenerPuntosPorOrdenCompraYZona',
        ]);
        documentosUtilServiceStub = new DocumentosUtilServiceStub();
        archivoServiceSpy = jasmine.createSpyObj<ArchivoService>('ArchivoService', ['descargar', 'obtener']);
        modalServiceStub = new BsModalServiceStub();
        seguridadServiceSpy = jasmine.createSpyObj<SeguridadService>('SeguridadService', ['obtenerUsuarioLogueado']);
        usuarioServiceSpy = jasmine.createSpyObj<UsuarioService>('UsuarioService', ['obtenerUsuarioPorId']);
        ajusteServiceSpy = jasmine.createSpyObj<AjusteService>('AjusteService', ['descargarDocumento']);
        seguridadServiceSpy.obtenerUsuarioLogueado.and.returnValue('usuario-1');
        usuarioServiceSpy.obtenerUsuarioPorId.and.returnValue(of({ id: 'usuario-1' } as UsuarioDTO));
        ajusteServiceSpy.descargarDocumento.and.returnValue(of({ id: 1, nombre: 'archivo.pdf', contenido: 'YQ==' } as ArchivoDTO));

        await TestBed.configureTestingModule({
            declarations: [AgregarModificarAjustePopupComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: BsModalService, useValue: modalServiceStub },
                { provide: BsModalRef, useValue: new MockModalRef() },
                { provide: ActualizarService, useValue: actualizarServiceStub },
                { provide: PuntosRecepcionService, useValue: puntosRecepcionServiceSpy },
                { provide: DocumentosUtilService, useValue: documentosUtilServiceStub },
                { provide: ArchivoService, useValue: archivoServiceSpy },
                { provide: SeguridadService, useValue: seguridadServiceSpy },
                { provide: UsuarioService, useValue: usuarioServiceSpy },
                { provide: AjusteService, useValue: ajusteServiceSpy },
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        puntosRecepcionServiceSpy.obtenerZonasPorOrdenCompra.and.returnValue(of([]));
        puntosRecepcionServiceSpy.obtenerPuntosPorOrdenCompraYZona.and.returnValue(of([]));

        fixture = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        component = fixture.componentInstance;
        component.tipoUsuario = TipoUsuario.ORGANISMO;
        component.consultaParaItem = false;
        component.modo = 'agregar';
        component.ordenCompra = { idOC: 1, fechaComprometida: '2025-05-10' } as any;
        component.ajuste = { idAjuste: 1 } as any;

        fixture.detectChanges();

        actualizarServiceStub.confirmar.calls.reset();
        actualizarServiceStub.mensajeError.calls.reset();
        actualizarServiceStub.mensajeOcultar.calls.reset();
        puntosRecepcionServiceSpy.obtenerZonasPorOrdenCompra.calls.reset();
        puntosRecepcionServiceSpy.obtenerPuntosPorOrdenCompraYZona.calls.reset();
        modalServiceStub.show.calls.reset();
        archivoServiceSpy.descargar.calls.reset();
        archivoServiceSpy.obtener.calls.reset();
        seguridadServiceSpy.obtenerUsuarioLogueado.calls.reset();
        usuarioServiceSpy.obtenerUsuarioPorId.calls.reset();
    });

    it('deberia inicializar formulario y valores por defecto', () => {
        expect(component.form).toBeTruthy();
        expect(component.tiposAjuste.length).toBe(0);
        expect(component.form.get('solicitadoPor')?.value).toBe(TipoUsuario.ORGANISMO);
    });

    it('deberia construir el titulo segun usuario y tipo', () => {
        expect(component.tituloVentana).toBe('Ajuste Orden de Compra');

        const fixtureProveedor = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compProveedor = fixtureProveedor.componentInstance;
        compProveedor.tipoUsuario = TipoUsuario.PROVEEDOR;
        compProveedor.consultaParaItem = true;
        compProveedor.itemOrdenCompra = { idItem: 5, fechaComprometida: '2025-07-01', cantidadPendienteAsignar: 3 } as any;
        compProveedor.ordenCompra = { idOC: 8, fechaComprometida: '2025-07-01' } as any;
        fixtureProveedor.detectChanges();

        expect(compProveedor.tituloVentana).toBe('Solicitud de Ajuste Ítem Orden de Compra');
    });

    
    it('deberia marcar error si la nueva fecha OC no adelanta la fecha actual', () => {
        component.form.patchValue({
            tipoAjuste: TipoAjuste.OC_CAMBIAR_FECHA,
            nuevaFecha: '2025-05-01',
        });

        component.guardar();

        expect(component.form.get('nuevaFecha')?.hasError('fechaNoAdelantada')).toBeTrue();
    });

    it('deberia emitir ajuste valido para cambio de fecha de OC', () => {
        const spyEmit = spyOn(component.ajusteGuardado, 'emit');

        component.documentos = [{ id: -1, nombre: 'doc.pdf' } as ArchivoDTO];

        component.form.patchValue({
            tipoAjuste: TipoAjuste.OC_CAMBIAR_FECHA,
            nuevaFecha: '2025-05-11',
        });

        component.guardar();

        expect(spyEmit).toHaveBeenCalled();
        const ajusteEmitido = spyEmit.calls.mostRecent()?.args?.[0] as IAjusteDTO;
        expect(ajusteEmitido).toBeTruthy();
        expect(ajusteEmitido.tipoAjuste).toBe(TipoAjuste.OC_CAMBIAR_FECHA);
        expect(ajusteEmitido.fechaNueva).toBe('2025-05-11');
        expect(ajusteEmitido.ordenCompra?.idOC).toBe(1);
        expect(ajusteEmitido.archivo).toEqual(jasmine.objectContaining({ nombre: 'doc.pdf' }));
        expect(actualizarServiceStub.mensajeOcultar).toHaveBeenCalled();
    });

    it('deberia mostrar error cuando no se agrega documento', fakeAsync(() => {
        const spyEmit = spyOn(component.ajusteGuardado, 'emit');

        component.form.patchValue({
            tipoAjuste: TipoAjuste.OC_CAMBIAR_FECHA,
            nuevaFecha: '2025-05-11',
        });

        component.guardar();
        tick(500);

        expect(spyEmit).not.toHaveBeenCalled();
        expect(component.showMsg).toBeTrue();
        expect(component.resultMsg).toContain('Debe adjuntar al menos un documento.');
    }));

   

    it('no deberia mostrar errores al seleccionar automaticamente el unico tipo de ajuste con fecha o cantidad', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.modo = 'agregar';
        compItem.itemOrdenCompra = {
            idItem: 10,
            puedeAgregarAjusteCantidad: true,
            puedeAgregarAjusteFecha: true,
            cantidad: 5,
            cantidadPendienteAsignar: 2,
            fechaComprometida: '2025-05-10',
        } as any;
        compItem.ordenCompra = { idOC: 3, fechaComprometida: '2025-05-10' } as any;

        fixtureItem.detectChanges();

        expect(compItem.form.get('tipoAjuste')?.value).toBe(TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD);
        expect(compItem.campoInvalido('nuevaFecha')).toBeFalse();
        expect(compItem.campoInvalido('nuevaCantidad')).toBeFalse();

        const mensajes = Array.from(fixtureItem.nativeElement.querySelectorAll('.texto-error')) as HTMLElement[];
        const hayMensajeRequerido = mensajes.some(msg => msg.textContent?.includes('Debe completar al menos la fecha o la cantidad.'));
        expect(hayMensajeRequerido).toBeFalse();
    });

    it('deberia mostrar error de requerimiento luego de interactuar con la fecha en ajuste unico', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.modo = 'agregar';
        compItem.itemOrdenCompra = {
            idItem: 11,
            puedeAgregarAjusteCantidad: true,
            puedeAgregarAjusteFecha: true,
            cantidad: 6,
            cantidadPendienteAsignar: 3,
            fechaComprometida: '2025-05-10',
        } as any;
        compItem.ordenCompra = { idOC: 4, fechaComprometida: '2025-05-10' } as any;

        fixtureItem.detectChanges();

        const controlFecha = compItem.form.get('nuevaFecha');
        controlFecha?.markAsTouched();
        controlFecha?.updateValueAndValidity({ emitEvent: false });
        fixtureItem.detectChanges();

        const mensajes = Array.from(fixtureItem.nativeElement.querySelectorAll('.texto-error')) as HTMLElement[];
        const hayMensajeRequerido = mensajes.some(msg => msg.textContent?.includes('Debe completar al menos la fecha o la cantidad.'));
        expect(hayMensajeRequerido).toBeTrue();
    });

   
    it('deberia validar cantidad segun pendiente', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.itemOrdenCompra = {
            idItem: 1,
            cantidad: 10,
            cantidadPendienteAsignar: 4,
            fechaComprometida: '2025-04-01',
        } as any;
        compItem.ordenCompra = { idOC: 2, fechaComprometida: '2025-04-01' } as any;
        fixtureItem.detectChanges();

        spyOn(compItem.ajusteGuardado, 'emit');

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_CANTIDAD,
            nuevaFecha: '2025-03-20',
            nuevaCantidad: 5,
        });

        compItem.guardar();

        expect(compItem.form.get('nuevaCantidad')?.hasError('cantidadInvalida')).toBeTrue();
        expect(compItem.ajusteGuardado.emit).not.toHaveBeenCalled();
    });

    it('deberia marcar error cuando la nueva cantidad es igual a la actual', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.itemOrdenCompra = {
            idItem: 11,
            cantidad: 10,
            cantidadPendienteAsignar: 4,
            fechaComprometida: '2025-04-01',
        } as any;
        compItem.ordenCompra = { idOC: 12, fechaComprometida: '2025-04-01' } as any;

        fixtureItem.detectChanges();

        const spyEmit = spyOn(compItem.ajusteGuardado, 'emit');

        compItem.documentos = [{ id: -7, nombre: 'doc.pdf' } as ArchivoDTO];

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_CANTIDAD,
            nuevaCantidad: 10,
        });

        compItem.guardar();

        const control = compItem.form.get('nuevaCantidad');
        expect(control?.hasError('cantidadInvalida')).toBeTrue();
        expect(spyEmit).not.toHaveBeenCalled();
    });

    it('deberia ocultar el campo de cantidad cuando no hay pendiente por asignar', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.modo = 'agregar';
        compItem.itemOrdenCompra = {
            idItem: 21,
            puedeAgregarAjusteCantidad: true,
            cantidad: 10,
            cantidadPendienteAsignar: 0,
            tipoArticulo: 'B',
        } as any;
        compItem.ordenCompra = { idOC: 6, fechaComprometida: '2025-04-01' } as any;

        fixtureItem.detectChanges();

        compItem.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_CANTIDAD });
        fixtureItem.detectChanges();

        expect(compItem.mostrarCampoCantidad).toBeFalse();
        expect(compItem.form.get('nuevaCantidad')?.errors).toBeNull();
        const inputCantidad = fixtureItem.nativeElement.querySelector('#nuevaCantidad');
        expect(inputCantidad).toBeNull();
    });

    it('deberia ocultar el campo de cantidad para servicios de una sola unidad', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.modo = 'agregar';
        compItem.itemOrdenCompra = {
            idItem: 22,
            puedeAgregarAjusteCantidad: true,
            cantidad: 1,
            cantidadPendienteAsignar: 1,
            tipoArticulo: 's',
        } as any;
        compItem.ordenCompra = { idOC: 7, fechaComprometida: '2025-04-01' } as any;

        fixtureItem.detectChanges();

        compItem.form.patchValue({ tipoAjuste: TipoAjuste.ITEM_CAMBIAR_CANTIDAD });
        fixtureItem.detectChanges();

        expect(compItem.mostrarCampoCantidad).toBeFalse();
        const inputCantidad = fixtureItem.nativeElement.querySelector('#nuevaCantidad');
        expect(inputCantidad).toBeNull();
    });

    it('deberia permitir cantidades dentro del rango permitido', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.itemOrdenCompra = {
            idItem: 3,
            cantidad: 12,
            cantidadPendienteAsignar: 5,
            fechaComprometida: '2025-04-01',
        } as any;
        compItem.ordenCompra = { idOC: 4, fechaComprometida: '2025-04-01' } as any;
        fixtureItem.detectChanges();

        compItem.documentos = [{ id: -5, nombre: 'doc.pdf' } as ArchivoDTO];
        const spyEmit = spyOn(compItem.ajusteGuardado, 'emit');

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_CANTIDAD,
            nuevaCantidad: 8,
        });

        compItem.guardar();

        expect(compItem.form.get('nuevaCantidad')?.hasError('cantidadInvalida')).toBeFalse();
        expect(spyEmit).toHaveBeenCalled();
        const ajusteEmitido = spyEmit.calls.mostRecent()?.args?.[0] as IAjusteDTO;
        expect(ajusteEmitido.cantidadNueva).toBe(8);
    });

    it('deberia marcar error cuando la fecha del item no adelanta la actual', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.itemOrdenCompra = {
            idItem: 2,
            fechaComprometida: '2025-04-20',
            cantidadPendienteAsignar: 3,
        } as any;
        compItem.ordenCompra = { idOC: 9, fechaComprometida: '2025-04-25' } as any;
        fixtureItem.detectChanges();

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA,
            nuevaFecha: '2025-04-18',
        });

        compItem.guardar();

        expect(compItem.form.get('nuevaFecha')?.hasError('fechaNoAdelantada')).toBeTrue();
    });

    it('deberia marcar error cuando la nueva fecha del item supera la fecha de la OC', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.itemOrdenCompra = {
            idItem: 21,
            fechaComprometida: '2025-04-20',
            cantidadPendienteAsignar: 0,
        } as any;
        compItem.ordenCompra = { idOC: 9, fechaComprometida: '2025-04-20', fechaOC: '2025-04-25' } as any;
        fixtureItem.detectChanges();

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA,
            nuevaFecha: '2025-05-02',
        });

        const control = compItem.form.get('nuevaFecha');
        expect(control?.hasError('max')).toBeTrue();
    });

    it('deberia exponer la fecha maxima igual a la fecha OC para items', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.itemOrdenCompra = {
            idItem: 22,
            fechaComprometida: '2025-04-20',
            cantidadPendienteAsignar: 0,
        } as any;
        compItem.ordenCompra = { idOC: 10, fechaComprometida: '2025-04-20', fechaOC: '2025-04-30' } as any;
        fixtureItem.detectChanges();

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA,
        });

        expect(compItem.fechaMaxima).toBe('2025-04-20');
    });

    it('deberia marcar error cuando la nueva fecha del item no es posterior a hoy', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;

        const fechaComprometida = fechaRelativa(-30);
        const fechaNoValida = fechaRelativa(-1);

        compItem.itemOrdenCompra = {
            idItem: 8,
            fechaComprometida,
            cantidad: 10,
            cantidadPendienteAsignar: 0,
            puedeAgregarAjusteFecha: true,
        } as any;
        compItem.ordenCompra = { idOC: 21, fechaComprometida } as any;
        fixtureItem.detectChanges();

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA,
            nuevaFecha: fechaNoValida,
        });

        compItem.guardar();

        const control = compItem.form.get('nuevaFecha');
        expect(control?.hasError('fechaNoAdelantada')).toBeTrue();
    });

    it('deberia aceptar una nueva fecha de item posterior a hoy y a la comprometida', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;

        const fechaComprometida = fechaRelativa(-30);
        const fechaValida = fechaRelativa(10);
        const fechaMaxima = fechaRelativa(60);

        compItem.itemOrdenCompra = {
            idItem: 9,
            fechaComprometida,
            cantidad: 10,
            cantidadPendienteAsignar: 0,
            puedeAgregarAjusteFecha: true,
        } as any;
        compItem.ordenCompra = { idOC: 22, fechaComprometida: fechaMaxima } as any;
        fixtureItem.detectChanges();

        compItem.documentos = [{ id: -10, nombre: 'doc.pdf' } as ArchivoDTO];
        const spyEmit = spyOn(compItem.ajusteGuardado, 'emit');

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA,
            nuevaFecha: fechaValida,
        });

        compItem.guardar();

        const control = compItem.form.get('nuevaFecha');
        expect(control?.hasError('fechaNoAdelantada')).toBeFalse();
        expect(spyEmit).toHaveBeenCalled();
    });

    it('deberia rechazar una nueva fecha de item igual a la fecha comprometida', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;

        const fechaReferencia = fechaRelativa(12);

        compItem.itemOrdenCompra = {
            idItem: 11,
            fechaComprometida: fechaReferencia,
            cantidad: 5,
            cantidadPendienteAsignar: 0,
            puedeAgregarAjusteFecha: true,
        } as any;
        compItem.ordenCompra = { idOC: 31, fechaComprometida: fechaReferencia } as any;
        fixtureItem.detectChanges();

        compItem.documentos = [{ id: -11, nombre: 'adjunto.pdf' } as ArchivoDTO];

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA,
            nuevaFecha: fechaReferencia,
        });

        compItem.guardar();

        const control = compItem.form.get('nuevaFecha');
        expect(control?.hasError('fechaNoAdelantada')).toBeTrue();
    });

    it('deberia aceptar una nueva fecha de item igual a hoy cuando la comprometida es anterior', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;

        const fechaComprometida = fechaRelativa(-7);
        const fechaHoy = fechaRelativa(0);

        compItem.itemOrdenCompra = {
            idItem: 12,
            fechaComprometida,
            cantidad: 8,
            cantidadPendienteAsignar: 0,
            puedeAgregarAjusteFecha: true,
        } as any;
        compItem.ordenCompra = { idOC: 32, fechaComprometida } as any;
        fixtureItem.detectChanges();

        compItem.documentos = [{ id: -12, nombre: 'adjunto.pdf' } as ArchivoDTO];

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA,
            nuevaFecha: fechaHoy,
        });

        compItem.guardar();

        const control = compItem.form.get('nuevaFecha');
        expect(control?.hasError('fechaNoAdelantada')).toBeFalse();
    });

    it('deberia exigir completar fecha o cantidad en ajuste combinado', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.itemOrdenCompra = {
            idItem: 6,
            cantidad: 15,
            cantidadPendienteAsignar: 5,
            fechaComprometida: '2025-06-10',
        } as any;
        compItem.ordenCompra = { idOC: 6, fechaComprometida: '2025-06-15' } as any;
        fixtureItem.detectChanges();

        compItem.documentos = [{ id: -6, nombre: 'doc.pdf' } as ArchivoDTO];
        const spyEmit = spyOn(compItem.ajusteGuardado, 'emit');

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
        });

        compItem.guardar();

        expect(compItem.form.get('nuevaFecha')?.hasError('requeridoAlMenosUno')).toBeTrue();
        expect(compItem.form.get('nuevaCantidad')?.hasError('requeridoAlMenosUno')).toBeTrue();
        expect(spyEmit).not.toHaveBeenCalled();
    });

    it('deberia permitir ajuste combinado solo con fecha', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        const fechaReferencia = fechaRelativa(15);
        const nuevaFecha = fechaRelativa(30);
        const fechaMaxima = fechaRelativa(45);
        compItem.itemOrdenCompra = {
            idItem: 7,
            cantidad: 12,
            cantidadPendienteAsignar: 4,
            fechaComprometida: fechaReferencia,
        } as any;
        compItem.ordenCompra = { idOC: 7, fechaComprometida: fechaMaxima } as any;
        fixtureItem.detectChanges();

        compItem.documentos = [{ id: -7, nombre: 'doc.pdf' } as ArchivoDTO];
        const spyEmit = spyOn(compItem.ajusteGuardado, 'emit');

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
            nuevaFecha: nuevaFecha,
        });

        compItem.guardar();

        expect(compItem.form.get('nuevaFecha')?.hasError('requeridoAlMenosUno')).toBeFalse();
        expect(compItem.form.get('nuevaCantidad')?.hasError('requeridoAlMenosUno')).toBeFalse();
        const ajusteEmitido = spyEmit.calls.mostRecent()?.args?.[0] as IAjusteDTO;
        expect(ajusteEmitido.fechaNueva).toBe(nuevaFecha);
        expect(ajusteEmitido.cantidadNueva).toBeNull();
    });

    it('deberia permitir ajuste combinado solo con cantidad', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        compItem.itemOrdenCompra = {
            idItem: 8,
            cantidad: 10,
            cantidadPendienteAsignar: 4,
            fechaComprometida: '2025-07-01',
        } as any;
        compItem.ordenCompra = { idOC: 8, fechaComprometida: '2025-07-05' } as any;
        fixtureItem.detectChanges();

        compItem.documentos = [{ id: -8, nombre: 'doc.pdf' } as ArchivoDTO];
        const spyEmit = spyOn(compItem.ajusteGuardado, 'emit');

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
            nuevaCantidad: 7,
        });

        compItem.guardar();

        expect(compItem.form.get('nuevaFecha')?.hasError('requeridoAlMenosUno')).toBeFalse();
        expect(compItem.form.get('nuevaCantidad')?.hasError('requeridoAlMenosUno')).toBeFalse();
        const ajusteEmitido = spyEmit.calls.mostRecent()?.args?.[0] as IAjusteDTO;
        expect(ajusteEmitido.cantidadNueva).toBe(7);
        expect(ajusteEmitido.fechaNueva).toBeNull();
    });

    it('deberia emitir ajuste combinado con fecha y cantidad', () => {
        const fixtureItem = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compItem = fixtureItem.componentInstance;
        compItem.tipoUsuario = TipoUsuario.ORGANISMO;
        compItem.consultaParaItem = true;
        const fechaReferencia = fechaRelativa(5);
        const nuevaFecha = fechaRelativa(20);
        const fechaMaxima = fechaRelativa(45);
        compItem.itemOrdenCompra = {
            idItem: 1,
            cantidad: 10,
            cantidadPendienteAsignar: 8,
            fechaComprometida: fechaReferencia,
        } as any;
        compItem.ordenCompra = { idOC: 2, fechaComprometida: fechaMaxima } as any;
        fixtureItem.detectChanges();

        const spyEmit = spyOn(compItem.ajusteGuardado, 'emit');

        compItem.form.patchValue({
            tipoAjuste: TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD,
            nuevaFecha: nuevaFecha,
            nuevaCantidad: 5,
        });

        compItem.documentos = [{ id: -3, nombre: 'ajuste.pdf' } as ArchivoDTO];

        compItem.guardar();

        expect(spyEmit).toHaveBeenCalled();
        expect(actualizarServiceStub.mensajeOcultar).toHaveBeenCalled();
        const ajusteEmitido = spyEmit.calls.mostRecent()?.args?.[0] as IAjusteDTO;
        expect(ajusteEmitido).toBeTruthy();
        expect(ajusteEmitido.tipoAjuste).toBe(TipoAjuste.ITEM_CAMBIAR_FECHA_O_CANTIDAD);
        expect(ajusteEmitido.fechaNueva).toBe(nuevaFecha);
        expect(ajusteEmitido.cantidadNueva).toBe(5);
    });

    it('deberia asignar al proveedor como solicitante al guardar', () => {
        const fixtureProveedor = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compProveedor = fixtureProveedor.componentInstance;
        compProveedor.tipoUsuario = TipoUsuario.PROVEEDOR;
        compProveedor.consultaParaItem = false;
        compProveedor.ordenCompra = { idOC: 3, fechaComprometida: '2025-05-15' } as any;
        fixtureProveedor.detectChanges();

        const spyEmit = spyOn(compProveedor.ajusteGuardado, 'emit');

        compProveedor.documentos = [{ id: -4, nombre: 'doc.pdf' } as ArchivoDTO];

        compProveedor.form.patchValue({
            tipoAjuste: TipoAjuste.OC_CAMBIAR_FECHA,
            nuevaFecha: '2025-05-20',
        });

        compProveedor.guardar();

        expect(spyEmit).toHaveBeenCalled();
        expect(actualizarServiceStub.mensajeOcultar).toHaveBeenCalled();
        const ajusteEmitido = spyEmit.calls.mostRecent()?.args?.[0] as IAjusteDTO;
        expect(ajusteEmitido.tipoSolicitante).toBe(TipoUsuario.PROVEEDOR);
        expect(ajusteEmitido.usuarioSolicitante).toEqual(compProveedor.usuarioLogueadoDto);
        expect(actualizarServiceStub.confirmar).not.toHaveBeenCalled();
    });

    it('deberia alternar la visibilidad de fuerza mayor segun el solicitante', () => {
        component.tipoUsuario = TipoUsuario.AMBOS;
        component.consultaParaItem = false;
        component.ordenCompra = { idOC: 12, fechaComprometida: '2025-08-10' } as any;
        fixture.detectChanges();

        expect(component.mostrarCampoFuerzaMayor).toBeFalse();

        component.form.get('solicitadoPor')?.setValue(TipoUsuario.PROVEEDOR);
        expect(component.mostrarCampoFuerzaMayor).toBeTrue();

        component.form.get('fuerzaMayor')?.setValue(true);
        component.form.get('solicitadoPor')?.setValue(TipoUsuario.ORGANISMO);
        expect(component.mostrarCampoFuerzaMayor).toBeFalse();
        expect(component.form.get('fuerzaMayor')?.value).toBeFalse();
    });

    it('deberia cargar departamentos al seleccionar un ajuste de punto de recepcion', () => {
        const zonas = [{ id: 4, nombre: 'Zona central' } as any];
        puntosRecepcionServiceSpy.obtenerZonasPorOrdenCompra.and.returnValue(of(zonas));

        component.form.patchValue({
            tipoAjuste: TipoAjuste.OC_CAMBIAR_PR,
        });

        expect(puntosRecepcionServiceSpy.obtenerZonasPorOrdenCompra).toHaveBeenCalledWith(1);
        expect(component.departamentos).toEqual(zonas);
        expect(component.form.get('departamento')?.value).toBeNull();
    });

    it('no deberia consultar departamentos cuando no hay orden de compra', () => {
        component.ordenCompra = undefined;

        component.form.patchValue({
            tipoAjuste: TipoAjuste.OC_CAMBIAR_PR,
        });

        expect(puntosRecepcionServiceSpy.obtenerZonasPorOrdenCompra).not.toHaveBeenCalled();
        expect(component.departamentos).toEqual([]);
    });

    it('deberia limpiar el punto de recepcion cuando la zona no tiene puntos disponibles', () => {
        const zona = { id: 6, nombre: 'Zona norte' } as any;
        puntosRecepcionServiceSpy.obtenerZonasPorOrdenCompra.and.returnValue(of([zona]));
        puntosRecepcionServiceSpy.obtenerPuntosPorOrdenCompraYZona.and.returnValue(of([]));

        component.form.patchValue({
            tipoAjuste: TipoAjuste.OC_CAMBIAR_PR,
        });
        component.form.get('nuevoPuntoRecepcion')?.setValue({ id: 99 } as any);

        component.form.get('departamento')?.setValue(zona);

        expect(puntosRecepcionServiceSpy.obtenerPuntosPorOrdenCompraYZona).toHaveBeenCalledWith(1, zona.id);
        expect(component.puntosRecepcion).toEqual([]);
        expect(component.form.get('nuevoPuntoRecepcion')?.value).toBeNull();
    });

    it('deberia preparar documento existente cuando el ajuste posee archivo', () => {
        const fixtureConAjuste = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const comp = fixtureConAjuste.componentInstance;
        comp.tipoUsuario = TipoUsuario.ORGANISMO;
        comp.consultaParaItem = false;
        comp.modo = 'modificar';
        comp.ordenCompra = { idOC: 1, fechaComprometida: '2025-05-10' } as any;
        comp.ajuste = {
            idAjuste: 15,
            tipoAjuste: TipoAjuste.OC_CAMBIAR_FECHA,
            archivo: { id: 99, nombre: 'original.pdf' } as any,
        } as any;

        fixtureConAjuste.detectChanges();

        expect(comp.documentos.length).toBe(1);
        expect(comp.documentos[0].nombre).toBe('original.pdf');
        expect(comp.documentos[0].modificado).toBeFalse();
        expect(comp.documentos[0].eliminado).toBeFalse();
    });

    it('deberia agregar un documento cuando se cierra el popup con exito', () => {
        const nuevoDocumento: ArchivoDTO = { id: -1, nombre: 'nuevo.pdf', modificado: true };
        modalServiceStub.contentFactory = () => ({
            documentoAgregado: { subscribe: (cb: (doc: ArchivoDTO) => void) => cb(nuevoDocumento) },
        });

        component.agregarDocumento();

        expect(modalServiceStub.show).toHaveBeenCalled();
        expect(component.documentos).toContain(nuevoDocumento);
    });

    it('deberia marcar documento como eliminado mediante el servicio util', () => {
        const documento: ArchivoDTO = { id: 5, nombre: 'existente.pdf' };
        component.documentos = [documento];
        const eliminarSpy = spyOn(documentosUtilServiceStub, 'eliminarDocumento').and.callThrough();

        component.eliminarDocumento(documento);

        expect(eliminarSpy).toHaveBeenCalledWith([documento], documento);
        expect(component.documentos[0].eliminado).toBeTrue();
    });

    it('deberia incluir documentos y archivo al guardar', () => {
        const documento: ArchivoDTO = { id: -999, nombre: 'adjunto.pdf', contenido: 'X', modificado: true };
        component.documentos = [documento];
        const spyEmit = spyOn(component.ajusteGuardado, 'emit');
        spyOn(component, 'cerrarPopup');

        component.form.patchValue({
            tipoAjuste: TipoAjuste.OC_CAMBIAR_FECHA,
            nuevaFecha: '2025-05-11',
        });

        component.guardar();

        expect(spyEmit).toHaveBeenCalled();
        const ajusteEmitido = spyEmit.calls.mostRecent()?.args?.[0] as IAjusteDTO;
        expect(ajusteEmitido).toBeTruthy();
        expect(ajusteEmitido.archivo).toEqual(jasmine.objectContaining({ nombre: 'adjunto.pdf', contenido: 'X' }));
    });

    it('deberia descargar documento cuando contiene contenido inline', () => {
        const documento: ArchivoDTO = { id: 10, nombre: 'inline.pdf' };
        const recuperado = { id: 10, nombre: 'inline.pdf', contenido: 'base64' } as ArchivoDTO;
        ajusteServiceSpy.descargarDocumento.and.returnValue(of(recuperado));

        component.descargarDocumento(documento);

        expect(ajusteServiceSpy.descargarDocumento).toHaveBeenCalledWith(1, 10);
        expect(archivoServiceSpy.descargar).toHaveBeenCalledWith(recuperado);
        expect(archivoServiceSpy.obtener).not.toHaveBeenCalled();
    });

    it('deberia descargar documento recuperado desde el servicio', () => {
        const documento: ArchivoDTO = { id: 50, nombre: 'servidor.pdf' };
        const recuperado = { id: 50, nombre: 'servidor.pdf', contenido: 'abc' } as ArchivoDTO;
        ajusteServiceSpy.descargarDocumento.and.returnValue(of(recuperado));

        component.descargarDocumento(documento);

        expect(ajusteServiceSpy.descargarDocumento).toHaveBeenCalledWith(1, 50);
        expect(archivoServiceSpy.descargar).toHaveBeenCalledWith(recuperado);
        expect(archivoServiceSpy.obtener).not.toHaveBeenCalled();
    });

    it('deberia preseleccionar departamento y punto al modificar ajuste de punto de recepcion', () => {
        const fixtureMod = TestBed.createComponent(AgregarModificarAjustePopupComponent);
        const compMod = fixtureMod.componentInstance;
        compMod.tipoUsuario = TipoUsuario.PROVEEDOR;
        compMod.consultaParaItem = false;
        compMod.modo = 'modificar';
        // Debe permitir el ajuste de punto de recepción para que el tipo esté disponible
        compMod.ordenCompra = { idOC: 15, fechaComprometida: '2025-08-01', puedeAgregarAjustePuntoRecepcion: true } as any;
        compMod.ajuste = {
            idAjuste: 123,
            tipoAjuste: TipoAjuste.OC_CAMBIAR_PR,
            puntoRecepcionNuevo: { id: 20, nombre: 'Punto X', zona: { id: 5, descripcionZona: 'Centro' } } as any,
            estado: EstadoAjuste.EN_PROCESO,
        } as any;

        const zonas = [{ id: 5, descripcionZona: 'Centro' } as any, { id: 6, descripcionZona: 'Norte' } as any];
        const puntos = [
            { id: 18, nombre: 'Otro', zona: { id: 5 } },
            { id: 20, nombre: 'Punto X', zona: { id: 5 } },
        ] as any;
        puntosRecepcionServiceSpy.obtenerZonasPorOrdenCompra.and.returnValue(of(zonas));
        puntosRecepcionServiceSpy.obtenerPuntosPorOrdenCompraYZona.and.returnValue(of(puntos));

        fixtureMod.detectChanges();

        // Debe cargar zonas y puntos correspondientes y preseleccionar ambos
        expect(puntosRecepcionServiceSpy.obtenerZonasPorOrdenCompra).toHaveBeenCalledWith(15);
        expect(puntosRecepcionServiceSpy.obtenerPuntosPorOrdenCompraYZona).toHaveBeenCalledWith(15, 5);
        const deptoSel = compMod.form.get('departamento')?.value;
        const puntoSel = compMod.form.get('nuevoPuntoRecepcion')?.value;
        expect(deptoSel?.id).toBe(5);
        expect(puntoSel?.id).toBe(20);
    });
});


