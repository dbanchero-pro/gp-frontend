import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, forwardRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { NuevoUsuarioUcPopupComponent } from './nuevo-usuario-uc-popup.component';

export const mockHttp = {
  get: jasmine.createSpy('get').and.returnValue({
    subscribe: (callback: any) => callback({ content: [] }),
  }),
  post: jasmine.createSpy('post').and.returnValue({
    subscribe: (callback: any) => callback({ id: '1' }),
  }),
};


@Component({
  selector: 'app-input-documento',
  template: '',
  standalone: false,
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
export class MockInputDocumentoComponent implements ControlValueAccessor, Validator {
  // no-op state
  writeValue(obj: any): void { /* no-op */ }
  registerOnChange(fn: any): void { /* no-op */ }
  registerOnTouched(fn: any): void { /* no-op */ }
  setDisabledState?(isDisabled: boolean): void { /* no-op */ }

  validate(control: AbstractControl): ValidationErrors | null {
    return null; // siempre válido
  }
}

@Component({
  selector: 'app-filtro-organismo',
  template: '',
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockFiltroOrganismoComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MockFiltroOrganismoComponent),
      multi: true
    }
  ]
})
export class MockFiltroOrganismoComponent implements ControlValueAccessor, Validator {
  // no-op state
  writeValue(obj: any): void { /* no-op */ }
  registerOnChange(fn: any): void { /* no-op */ }
  registerOnTouched(fn: any): void { /* no-op */ }
  setDisabledState?(isDisabled: boolean): void { /* no-op */ }

  validate(control: AbstractControl): ValidationErrors | null {
    return null; // siempre válido
  }
}
describe('NuevoUsuarioUcPopup', () => {
  let component: NuevoUsuarioUcPopupComponent;
  let fixture: ComponentFixture<NuevoUsuarioUcPopupComponent>;
  let bsModalRef: jasmine.SpyObj<BsModalRef>;
  let bsModalService: jasmine.SpyObj<BsModalService>;

  beforeEach(async () => {
    bsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
    bsModalService = jasmine.createSpyObj('BsModalService', ['show', 'hide', 'getModalsCount']);
    bsModalService.show.and.returnValue({ content: {}, hide: jasmine.createSpy('hide'), setClass: jasmine.createSpy('setClass') } as any);
    bsModalService.getModalsCount.and.returnValue(0);

    await TestBed.configureTestingModule({
      declarations: [NuevoUsuarioUcPopupComponent, MockInputDocumentoComponent, MockFiltroOrganismoComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: HttpClient, useValue: mockHttp },
        { provide: BsModalService, useValue: bsModalService }
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NuevoUsuarioUcPopupComponent);
    component = fixture.componentInstance;
    (component as any).usuarios = [];
    fixture.detectChanges();
  });

  it('debe crear los controles del formulario', () => {
    expect((component as any).form.get('usuario')).toBeTruthy();
  });

  it('guardar debe emitir cuando el formulario es válido', () => {

    spyOn(component.guardarEvento, 'emit');
    spyOn(component, 'cerrarPopup');
    (component as any).form.patchValue({
      nroDocumento: '1',
      usuario: 'uy-ci-1',
      esEditor: true,
    });
    (component as any).form.get('organismo')?.setValue({
      idInciso: 1,
      idUnidadEjecutora: 2,
      idUnidadCompra: 3,
    });
    component.guardar();
    expect(component.guardarEvento.emit).toHaveBeenCalled();
    expect(component.cerrarPopup).toHaveBeenCalled();
  });

  it('validarPopUpInvalido debe devolver true si es inválido', () => {
    (component as any).form.patchValue({ nroDocumento: '' });
    expect(component.validarPopUpInvalido()).toBeTrue();
  });

  it('onCambioFiltro carga usuarios cuando valido', () => {

    component.cargarUsuariosPorUnidadCompra = jasmine.createSpy() as any;
    (component as any).form.get('organismo')?.setValue({
      idInciso: 1,
      idUnidadEjecutora: 2,
      idUnidadCompra: 3,
    });
    component.onCambioFiltro({
      idInciso: 1,
      idUnidadEjecutora: 2,
      idUnidadCompra: 3,
    });
    expect(component.cargarUsuariosPorUnidadCompra).toHaveBeenCalled();
  });

  it('onCambioFiltro limpia cuando invalido', () => {

    (component as any).form.get('usuario')?.setValue('x');
    component.onCambioFiltro({});
    expect((component as any).usuarios.length).toBe(0);
    expect((component as any).form.get('usuario')?.value).toBe('');
  });

  it('cargarUsuariosPorUnidadCompra maneja exito', () => {

    (component as any).tipoPerfil = TipoPerfil.Recepcion;
    (component as any).usuarios = []; // Ensure usuarios is initialized
    const spy = spyOn(
      component['usuarioOrganismoService'],
      'obtenerUsuariosOrganismoNoExiste'
    ).and.returnValue(of([{ id: 1 }] as any));
    component.cargarUsuariosPorUnidadCompra(1, 1, 1);
    expect((component as any).usuarios.length).toBe(1);

    expect(spy).toHaveBeenCalled();
  });

  it('debe mostrar error cuando el usuario es requerido', () => {
    component.guardar();
    fixture.detectChanges();
    const errorSpan = fixture.nativeElement.querySelector('#usuario + span.texto-error');
    expect(errorSpan.style.visibility).toBe('visible');
    expect(component.campoVacio('usuario')).toBeTrue();
  });


  it('guardar no emite si formulario invalido', () => {
    spyOn(component.guardarEvento, 'emit');
    (component as any).form.get('usuario')?.setValue(null);
    component.guardar();
    expect(component.guardarEvento.emit).not.toHaveBeenCalled();
  });

  it('transformarNroDocumento debe anteponer el prefijo', () => {
    expect(component.transformarNroDocumento('5')).toBe('uy-ci-5');
  });
});
