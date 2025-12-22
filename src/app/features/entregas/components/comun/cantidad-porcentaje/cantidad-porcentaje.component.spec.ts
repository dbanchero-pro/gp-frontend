import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';

import { CantidadPorcentajeComponent } from './cantidad-porcentaje.component';

@Component({
  standalone: false,
  template: `<form [formGroup]="form"><app-cantidad-porcentaje formControlName="cp"></app-cantidad-porcentaje></form>`
})
class HostComponent {
  form = new FormGroup({ cp: new FormControl(null) });
}

describe('CantidadPorcentajeComponent', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CantidadPorcentajeComponent, HostComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance;
    expect(component).toBeTruthy();
  });

  it('debe mostrar el mensaje de error personalizado', () => {
    const control = fixture.componentInstance.form.get('cp');
    control?.setErrors({ excedePendienteCantidad: true });
    control?.markAsTouched();
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('app-cantidad-porcentaje .invalid-feedback');
    expect(error.textContent.trim()).toBe('La cantidad ingresada supera la cantidad pendiente por asignar');
  });

  it('tiene atributos ARIA en el campo numérico', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('app-cantidad-porcentaje input[type="number"]');
    expect(input.getAttribute('aria-label')).toBe('Valor');
  });

  it('marca el campo como inválido y referencia el mensaje de error', () => {
    const control = fixture.componentInstance.form.get('cp');
    control?.setErrors({ porcentajeRango: true });
    control?.markAsTouched();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('app-cantidad-porcentaje input[type="number"]');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toBe('errorCantidadPorcentaje');
  });

  it('normaliza a cantidad cuando el porcentaje está deshabilitado', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.porcentajeHabilitado = false;
    const result = component.normalizar({ tipo: TipoUnidad.PORCENTAJE, valor: 10 });
    expect(result.tipo).toBe(TipoUnidad.CANTIDAD);
  });

  it('normaliza a porcentaje cuando la cantidad está deshabilitada', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.cantidadHabilitada = false;
    const result = component.normalizar({ tipo: TipoUnidad.CANTIDAD, valor: null });
    expect(result.tipo).toBe(TipoUnidad.PORCENTAJE);
  });

  it('validate detecta porcentaje fuera de rango', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance;
    component.form.patchValue({ tipo: TipoUnidad.PORCENTAJE, valor: 150 });
    const error = component.validate(new FormControl());
    expect(error?.porcentajeRango).toBeTrue();
  });

  it('setDisabledState deshabilita y habilita el formulario', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance;
    component.setDisabledState(true);
    expect(component.form.disabled).toBeTrue();
    component.setDisabledState(false);
    expect(component.form.enabled).toBeTrue();
  });

  it('muestra mensajes de error según el tipo', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.ngControl = { errors: { porcentajeRango: true } };
    expect(component.errorMsg).toBe('El porcentaje debe estar entre 1 y 100');
    component.ngControl = { errors: { cantidadMin: true } };
    expect(component.errorMsg).toBe('La cantidad debe ser mayor a 0');
    component.ngControl = { errors: { porcentajeRequerido: true } };
    expect(component.errorMsg).toBe('Debe ingresar un porcentaje');
  });

  it('valorBloqueado es verdadero cuando la cantidad es fija', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.cantidadFijaEnCantidad = 5;
    component.form.patchValue({ tipo: TipoUnidad.CANTIDAD, valor: null });
    expect(component.valorBloqueado).toBeTrue();
  });


  it('normaliza la cantidad fija cuando corresponde', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.cantidadFijaEnCantidad = 3;
    const resultado = component.normalizar({ tipo: TipoUnidad.CANTIDAD, valor: null });
    expect(resultado.valor).toBe(3);
  });

  it('normaliza a porcentaje cuando la cantidad no está habilitada y falta valor', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.cantidadHabilitada = false;
    const resultado = component.normalizar({ tipo: TipoUnidad.CANTIDAD, valor: null });
    expect(resultado.tipo).toBe(TipoUnidad.PORCENTAJE);
    expect(resultado.valor).toBeNull();
  });

  it('validate retorna null para cantidad fija aunque no haya valor', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance;
    component.cantidadFijaEnCantidad = 5;
    component.form.patchValue({ tipo: TipoUnidad.CANTIDAD, valor: null });
    expect(component.validate(new FormControl())).toBeNull();
  });

  it('validate retorna null para porcentaje válido', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance;
    component.form.patchValue({ tipo: TipoUnidad.PORCENTAJE, valor: 50 });
    expect(component.validate(new FormControl())).toBeNull();
  });

  it('markAsTouched propaga el estado y ejecuta onTouched', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance;
    const spy = jasmine.createSpy('onTouched');
    component.registerOnTouched(spy);
    component.markAsTouched();
    expect(component.form.touched).toBeTrue();
    expect(spy).toHaveBeenCalled();
  });

  it('markAsDirty marca el formulario como sucio', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance;
    component.markAsDirty();
    expect(component.form.dirty).toBeTrue();
  });

  it('errorMsg contempla excedeSumaPorcentaje', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.ngControl = { errors: { excedeSumaPorcentaje: true } };
    expect(component.errorMsg).toBe('La suma de los porcentajes supera el 100%');
  });

  it('equals detecta diferencias de valor', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    expect(component.equals({ tipo: TipoUnidad.CANTIDAD, valor: 1 }, { tipo: TipoUnidad.CANTIDAD, valor: 2 })).toBeFalse();
  });

  it('aplicarValidadores omite min cuando la cantidad es fija', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.cantidadFijaEnCantidad = 2;
    component.form.patchValue({ tipo: TipoUnidad.CANTIDAD, valor: null });
    component['aplicarValidadores'](TipoUnidad.CANTIDAD);
    const validators = component.form.get('valor')?.validator?.({} as any);
    expect(validators).toBeUndefined();
  });

  it('errorMsg contempla cantidadDebeSerUno y cantidadRequerida', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    component.ngControl = { errors: { cantidadDebeSerUno: true } };
    expect(component.errorMsg).toBe('La cantidad debe ser 1');
    component.ngControl = { errors: { cantidadRequerida: true } };
    expect(component.errorMsg).toBe('Debe ingresar una cantidad');
  });

  it('equals retorna true cuando tipo y valor coinciden', () => {
    const component = fixture.debugElement.query(By.directive(CantidadPorcentajeComponent)).componentInstance as any;
    expect(component.equals({ tipo: TipoUnidad.CANTIDAD, valor: 5 }, { tipo: TipoUnidad.CANTIDAD, valor: 5 })).toBeTrue();
  });


});
