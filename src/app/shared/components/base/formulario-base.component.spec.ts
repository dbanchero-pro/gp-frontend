import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { FormularioBaseComponent } from './formulario-base.component';

class ModalServiceStub {
  show = jasmine.createSpy('show').and.callFake(() => {
    const ref = new BsModalRef();
    ref.content = {};
    return ref;
  });
}

@Component({ selector: 'app-dummy', template: '' })
class DummyComponent extends FormularioBaseComponent {
  override form = new FormGroup({ campo: new FormControl('valor', Validators.required) });
 
}

describe('FormularioBaseComponent', () => {
  let component: DummyComponent;
  let fixture: ComponentFixture<DummyComponent>;
  let modalService: ModalServiceStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, DummyComponent],
      providers: [{ provide: BsModalService, useClass: ModalServiceStub }]
    });
    fixture = TestBed.createComponent(DummyComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(BsModalService) as any;
    fixture.detectChanges();
  });


  it('campoVacio devuelve true solo si control es inválido y tocado', () => {
    const control = component.form.get('campo') as FormControl;
    control.markAsTouched();
    control.setValue('');
    expect(component.campoVacio('campo')).toBeTrue();
    expect(component.campoVacio('otro')).toBeFalse();
  });

  it('campoError chequea estado del control', () => {
    const control = component.form.get('campo') as FormControl;
    control.markAsTouched();
    control.setValue('');
    expect(component.campoError('campo')).toBeTrue();
  });

  it('abrirPopup utiliza modalService y retorna el contenido', () => {
    const contenido = {};
    const result = component.abrirPopup(contenido, 'Enviar');
    expect(modalService.show).toHaveBeenCalled();
    expect(result).toEqual({});
    expect(component.cerrarPopup).toBeDefined();
  });
});
