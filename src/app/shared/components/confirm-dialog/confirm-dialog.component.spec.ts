import { EventEmitter, Injectable } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { BehaviorSubject } from 'rxjs';

import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActualizarService } from '../../services/common/actualizar.service';
import { LoggerService } from '../../services/common/logger.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';

@Injectable()
class StubbedModalService {
    onShown = new EventEmitter<void>();
    show(): any {
        const ref = new BsModalRef<any>();
        ref.hide = jasmine.createSpy('hide');
        ref.onHide = new EventEmitter<any>();
        ref.setClass = () => {};
        return ref;
    }
}

@Injectable()
class StubbedActualizarService {
    confirmar$ = new BehaviorSubject<[string[], any, any] | []>([]);
    confirmar(
        pregunta: string | string[],
        fn: any,
        cancel: any = () => {},
    ): void {
        if (pregunta instanceof Array) {
            this.confirmar$.next([pregunta, fn, cancel]);
        } else {
            this.confirmar$.next([[pregunta], fn, cancel]);
        }
    }
}

@Injectable()
class StubLoggerService {
    logDebug() {
        // Stub method for logging debug messages
    }
}

describe('ConfirmDialogComponent', () => {
    let component: ConfirmDialogComponent;
    let fixture: ComponentFixture<ConfirmDialogComponent>;
    let modalService: StubbedModalService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ConfirmDialogComponent],
            providers: [
                {
                    provide: ActualizarService,
                    useClass: StubbedActualizarService,
                },
                { provide: BsModalService, useClass: StubbedModalService },
                { provide: LoggerService, useClass: StubLoggerService }.provide,
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ConfirmDialogComponent);
        component = fixture.componentInstance;
        modalService = fixture.debugElement.injector.get(BsModalService) as any;
        spyOn(document, 'querySelector').and.returnValue({
            focus: () => {},
        } as any);
        fixture.detectChanges();
    });

    it('debería reaccionar a los eventos del servicio y abrir el modal', () => {
        const svc = TestBed.inject(
            ActualizarService,
        ) as StubbedActualizarService;
        const showSpy = spyOn(modalService, 'show').and.callThrough();
        svc.confirmar(
            'pregunta',
            () => {},
            () => {},
        );
        expect(component.messages).toEqual(['pregunta']);
        expect(showSpy).toHaveBeenCalled();
        expect(component.modalRefs.length).toBe(1);
    });

    it('confirmar debería ocultar el modal y ejecutar la función', fakeAsync(() => {
        const modalRef: any = { hide: jasmine.createSpy('hide') };
        component.modalRefs = [modalRef];
        const fn = jasmine.createSpy('fn');
        component.funcionConfirmar = fn;
        component.confirmar();
        expect(component.procesando).toBeTrue();
        expect(modalRef.hide).toHaveBeenCalled();
        tick(500);
        expect(fn).toHaveBeenCalled();
    }));

    it('cerrar debería ocultar el modal y ejecutar cancelación', fakeAsync(() => {
        const modalRef: any = { hide: jasmine.createSpy('hide') };
        component.modalRefs = [modalRef];
        const fn = jasmine.createSpy('cancel');
        component.funcionCancelar = fn;
        component.cerrar();
        expect(modalRef.hide).toHaveBeenCalled();
        tick(500);
        expect(fn).toHaveBeenCalled();
    }));

    it('openModal debería registrar el modal y reaccionar al hide', () => {
        const spyClose = spyOn(component, 'cerrar');
        const ref = modalService.show();
        spyOn(modalService, 'show').and.returnValue(ref);
        component.openModal({} as any);
        expect(component.modalRefs.length).toBe(1);
        ref.onHide?.emit('close');
        expect(spyClose).toHaveBeenCalled();
    });
});
