import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AppConfig } from 'src/app/app.config';
import { ErrorInterceptor } from '../../interceptors/error.interceptor';
import { ActualizarService } from '../../services/common/actualizar.service';
import { ArchivoPopupBaseComponent } from './archivo-popup-base.component';

class TestPopup extends ArchivoPopupBaseComponent {
    override cerrarPopup = jasmine.createSpy('cerrarPopup');
    constructor() {
        super();
    }
    publicoProcesar(error: any, msg?: string) {
        this.procesarError(error, msg);
    }
    publicoDeshabilitar() {
        this.deshabilitarCapturaErrores();
    }
}

describe('ArchivoPopupBaseComponent', () => {
    let comp: TestPopup;
    const actualizar = { capturarErrores: true, popups: [] } as any;
    let hostElement: HTMLElement;

    beforeEach(() => {
        actualizar.capturarErrores = true;
        hostElement = document.createElement('div');
        const bsModalServiceStub = jasmine.createSpyObj('BsModalService', [
            'show',
            'hide',
            'getModalsCount',
        ]);
        bsModalServiceStub.show.and.returnValue({
            content: {},
            hide: jasmine.createSpy('hide'),
        });
        bsModalServiceStub.getModalsCount.and.returnValue(0);
        TestBed.configureTestingModule({
            providers: [
                { provide: ActualizarService, useValue: actualizar },
                { provide: BsModalService, useValue: bsModalServiceStub },
                {
                    provide: ElementRef,
                    useFactory: () => new ElementRef(hostElement),
                },
            ],
        });
        AppConfig.settings = {
            extensionesPermitidas: '.pdf',
            archivosTamanoMaxBytes: 1024,
        } as any;
        comp = TestBed.runInInjectionContext(() => new TestPopup());
        AppConfig.settings = {
            extensionesPermitidas: 'pdf',
            archivosTamanoMaxBytes: 1000,
        } as any;
    });

    it('deshabilitarCapturaErrores cambia bandera', () => {
        comp.publicoDeshabilitar();
        expect(actualizar.capturarErrores).toBeFalse();
    });

    it('procesarError maneja string', fakeAsync(() => {
        comp.publicoProcesar('error');
        tick(600);
        expect(comp.showMsg).toBeTrue();
        expect(comp.resultMsg[0]).toBe('error');
    }));

    it('procesarError maneja error 409 con mensaje', fakeAsync(() => {
        const err = {
            status: 409,
            error: { mensajes: [{ descripcion: 'msg' }] },
        };
        comp.publicoProcesar(err, 'def');
        tick(600);
        expect(comp.resultMsg[0]).toBe('msg');
    }));

    it('procesarError usa mensaje por defecto', fakeAsync(() => {
        const err = { status: 500 };
        spyOn(ErrorInterceptor, 'procesarErrorMessage').and.returnValue('otro');
        comp.publicoProcesar(err, 'defecto');
        tick(600);
        expect(comp.resultMsg[0]).toBe('otro');
        expect(ErrorInterceptor.procesarErrorMessage).toHaveBeenCalledWith(err);
    }));

    it('actualizarTextoErrorSize genera mensaje adecuado', () => {
        comp.actualizarTextoErrorSize(500);
        expect(comp.errorMaxSize).toContain('500');
    });

    it('onArchivoSeleccionadoInterno ignora evento sin archivos', () => {
        const accion = jasmine.createSpy('accion');
        comp.onArchivoSeleccionadoInterno(null as any, accion);
        expect(accion).not.toHaveBeenCalled();
    });

    it('cancelar y cerrar invocan cerrarPopup', () => {
        comp.cancelar();
        comp.cerrar();
        expect(comp.cerrarPopup).toHaveBeenCalledTimes(2);
    });

    it('ngOnInit carga extensiones permitidas', () => {
        comp.ngOnInit();
        expect(comp.extensionesPermitidas).toBe('pdf');
    });

    it('actualizarTextoErrorSize arma el mensaje correcto', () => {
        comp.actualizarTextoErrorSize(512);
        expect(comp.errorMaxSize).toBe(
            'El tamaño del archivo es de 512 Bytes y el máximo permitido es de 1000 Bytes.',
        );
    });

    it('onArchivoSeleccionadoInterno procesa archivo válido', () => {
        const file = new File(['hola'], 'test.txt', { type: 'text/plain' });
        const accion = jasmine.createSpy('accion');
        const mockReader = {
            result: 'data:text/plain;base64,ZmFrZQ==',
            readAsDataURL: jasmine.createSpy().and.callFake(() => {
                mockReader.onload();
            }),
            onload: () => {},
        } as any;
        spyOn(window as any, 'FileReader').and.returnValue(mockReader);
        comp.onArchivoSeleccionadoInterno(
            { target: { files: [file] } },
            accion,
        );
        expect(accion).toHaveBeenCalledWith('test.txt');
        expect(comp.mimeType).toBe('text/plain');
        expect(comp.base64).toBe('ZmFrZQ==');
        expect(comp.mostrarErrorMaxSize).toBeFalse();
    });

    it('onArchivoSeleccionadoInterno marca error si el archivo es grande', () => {
        const file = new File(['a'.repeat(2048)], 'grande.txt', {
            type: 'text/plain',
        });
        const mockReader = {
            result: 'data:text/plain;base64,',
            readAsDataURL: jasmine.createSpy().and.callFake(() => {
                mockReader.onload();
            }),
            onload: () => {},
        } as any;
        spyOn(window as any, 'FileReader').and.returnValue(mockReader);
        comp.onArchivoSeleccionadoInterno(
            { target: { files: [file] } },
            () => {},
        );
        expect(comp.mostrarErrorMaxSize).toBeTrue();
    });

    it('onArchivoSeleccionadoInterno ignora eventos sin archivos', () => {
        const accion = jasmine.createSpy('accion');
        comp.onArchivoSeleccionadoInterno({}, accion);
        expect(accion).not.toHaveBeenCalled();
    });

    it('cancelar llama a cerrarPopup', () => {
        comp.cancelar();
        expect(comp.cerrarPopup).toHaveBeenCalled();
    });

    it('cerrar llama a cerrarPopup', () => {
        comp.cerrar();
        expect(comp.cerrarPopup).toHaveBeenCalled();
    });
});
