import { Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { BandejaEntradaService } from '../../../services/bandeja-entrada.service';
import { AgregarUsuarioPopupComponent } from './agregar-usuario-popup.component';

@Component({
  selector: 'app-input-documento',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockInputDocumentoComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MockInputDocumentoComponent),
      multi: true
    }
  ]
})
class MockInputDocumentoComponent implements ControlValueAccessor, Validator {
  writeValue(_obj: any): void { /* no-op */ }
  registerOnChange(_fn: any): void { /* no-op */ }
  registerOnTouched(_fn: any): void { /* no-op */ }
  setDisabledState?(_isDisabled: boolean): void { /* no-op */ }
  validate(_control: AbstractControl): ValidationErrors | null {
    return null;
  }
}

describe('AgregarUsuarioPopupComponent', () => {
  let component: AgregarUsuarioPopupComponent;
  let fixture: ComponentFixture<AgregarUsuarioPopupComponent>;

  const bsModalServiceStub = jasmine.createSpyObj('BsModalService', ['show']);
  bsModalServiceStub.show.and.returnValue({ content: {}, hide: jasmine.createSpy('hide') });
  const bandejaEntradaServiceStub = jasmine.createSpyObj('BandejaEntradaService', ['buscarUsuariosParaAsignacion']);
  bandejaEntradaServiceStub.buscarUsuariosParaAsignacion.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarUsuarioPopupComponent, MockInputDocumentoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: BandejaEntradaService, useValue: bandejaEntradaServiceStub }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarUsuarioPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
