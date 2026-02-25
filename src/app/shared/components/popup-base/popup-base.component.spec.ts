import { ElementRef } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ErrorInterceptor } from '../../interceptors/error.interceptor';
import { ActualizarService } from '../../services/common/actualizar.service';
import { PopupBaseComponent } from './popup-base.component';

class TestPopup extends PopupBaseComponent {
  constructor() { super(); }
  publicoProcesar(error: any, msg?: string) { this.procesarError(error, msg); }
  publicoDeshabilitar() { this.deshabilitarCapturaErrores(); }
}

describe('PopupBaseComponent', () => {
  let comp: TestPopup;
  const actualizar = { capturarErrores: true } as any;
  let hostElement: HTMLElement;

  beforeEach(() => {
    actualizar.capturarErrores = true;
    hostElement = document.createElement('div');
    const bsModalServiceStub = jasmine.createSpyObj('BsModalService', ['show', 'hide', 'getModalsCount']);
    bsModalServiceStub.show.and.returnValue({ content: {}, hide: jasmine.createSpy('hide') });
    bsModalServiceStub.getModalsCount.and.returnValue(0);
    TestBed.configureTestingModule({
      providers: [{ provide: ActualizarService, useValue: actualizar },
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: ElementRef, useFactory: () => new ElementRef(hostElement) }
      ]
    });
    comp = TestBed.runInInjectionContext(() => new TestPopup());
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
    const err = { status: 409, error: { mensajes: [{ descripcion: 'msg' }] } };
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

  it('redirige el foco al popup cuando el target está fuera', () => {
    const modal = document.createElement('div');
    const primerBoton = document.createElement('button');
    const segundoBoton = document.createElement('button');
    modal.appendChild(primerBoton);
    modal.appendChild(segundoBoton);
    comp.modalRoot = new ElementRef(modal);

    actualizar.popups = [{content: { elementRef: new ElementRef(modal) }} as any];
    comp.ngAfterViewInit();
    spyOn(primerBoton, 'focus');

    comp.onDocumentFocusIn({ target: document.createElement('input') } as any);
    expect(primerBoton.focus).toHaveBeenCalled();
  });

  it('deja el foco dentro del popup si el target ya pertenece al modal', () => {
    const modal = document.createElement('div');
    const primerBoton = document.createElement('button');
    const segundoBoton = document.createElement('button');
    modal.appendChild(primerBoton);
    modal.appendChild(segundoBoton);
    comp.modalRoot = new ElementRef(modal);
    actualizar.popups = [{content: { elementRef: new ElementRef(modal) }} as any];
    comp.ngAfterViewInit();
    spyOn(primerBoton, 'focus');

    comp.onDocumentFocusIn({ target: segundoBoton } as any);
    expect(primerBoton.focus).not.toHaveBeenCalled();
  });

  it('no reencamina foco si el popup no está abierto', () => {
    const spyFocus = spyOn<any>(comp, 'focusFirstElement');
    comp.onDocumentFocusIn({ target: document.createElement('input') } as any);
    expect(spyFocus).not.toHaveBeenCalled();
  });

  it('trapFocus mueve el foco hacia atrás cuando está en el primero', () => {
    const modal = document.createElement('div');
    const first = document.createElement('button');
    const last = document.createElement('button');
    modal.append(first, last);
    comp.modalRoot = new ElementRef(modal);
    const event = { key: 'Tab', shiftKey: true, preventDefault: jasmine.createSpy() } as any;
    spyOnProperty(document, 'activeElement', 'get').and.returnValue(first);
    spyOn(last, 'focus');

    actualizar.popups = [{content: { elementRef: new ElementRef(modal) }} as any];
    comp.handleKeyboardEvent(event);

    expect(last.focus).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('trapFocus mueve el foco al primero cuando está en el último', () => {
    const modal = document.createElement('div');
    const first = document.createElement('button');
    const middle = document.createElement('input');
    const last = document.createElement('button');
    modal.append(first, middle, last);
    comp.modalRoot = new ElementRef(modal);
    const event = { key: 'Tab', shiftKey: false, preventDefault: jasmine.createSpy() } as any;
    spyOnProperty(document, 'activeElement', 'get').and.returnValue(last);
    spyOn(first, 'focus');

    actualizar.popups = [{content: { elementRef: new ElementRef(modal) }} as any];
    comp.handleKeyboardEvent(event);

    expect(first.focus).toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('maneja ausencia de elementos focusables sin lanzar error', () => {
    comp.modalRoot = new ElementRef(document.createElement('div'));
    const event = { key: 'Tab', shiftKey: false, preventDefault: jasmine.createSpy() } as any;

    expect(() => comp.handleKeyboardEvent(event)).not.toThrow();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('usa el host como fallback cuando no hay modalRoot', () => {
    (comp as any).modalRoot = undefined;
    const fallback = (comp as any).getModalElement();
    expect(fallback).toBe(hostElement);
  });
});
