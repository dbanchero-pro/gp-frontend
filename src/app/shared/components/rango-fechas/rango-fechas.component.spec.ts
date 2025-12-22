import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RangoFechasComponent } from './rango-fechas.component';

describe('RangoFechasComponent', () => {
  let component: RangoFechasComponent;
  let fixture: ComponentFixture<RangoFechasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RangoFechasComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RangoFechasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario con valores vacíos', () => {
    expect((component as any).form.value).toEqual({ fechaDesde: '', fechaHasta: '' });
  });

  it('debería setear required en campos si se indican como obligatorios', () => {
    component.requiereFechaDesde = true;
    component.requiereFechaHasta = true;
    component.ngOnInit();

    const fechaDesdeCtrl = (component as any).form.get('fechaDesde');
    const fechaHastaCtrl = (component as any).form.get('fechaHasta');

    expect(fechaDesdeCtrl?.validator).toBeTruthy();
    expect(fechaHastaCtrl?.validator).toBeTruthy();
  });

  it('debería validar que fechaDesde sea anterior a fechaHasta', () => {
    const fechaDesde = new Date('2024-01-10').toISOString().substring(0, 10);
    const fechaHasta = new Date('2024-01-05').toISOString().substring(0, 10);

    (component as any).form.setValue({ fechaDesde: fechaDesde, fechaHasta: fechaHasta });
    component.validate((component as any).form);
    expect(component.errorFecha).toBe('Fecha desde debe ser anterior a fecha hasta');
  });

  it('debería no mostrar error si fechaDesde < fechaHasta', () => {
    const fechaDesde = new Date('2024-01-01').toISOString().substring(0, 10);
    const fechaHasta = new Date('2024-01-05').toISOString().substring(0, 10);

    (component as any).form.setValue({ fechaDesde, fechaHasta });
    component.validate((component as any).form);
    expect(component.errorFecha).toBeNull();
  });

  it('debería marcar como inválido si requiredDesde está activado y no se completa', () => {
    component.requiereFechaDesde = true;
    component.ngOnInit();
    (component as any).form.get('fechaDesde')?.setValue('');
    (component as any).form.get('fechaHasta')?.setValue('');

    const valid = component.validate((component as any).form);

    expect(valid).toEqual({ requiereFechaDesde: 'Fecha desde es obligatoria' });
    expect(component.errorFecha).toBe('Fecha desde no puede estar vacío');
  });

  it('marca error si ambos campos requeridos faltan', () => {
    component.requiereFechaDesde = true;
    component.requiereFechaHasta = true;
    component.ngOnInit();
    (component as any).form.setValue({ fechaDesde: '', fechaHasta: '' });
    const res = component.validate((component as any).form);
    expect(res).toEqual({ requiereFechaDesde: 'Fecha desde es obligatoria', requiereFechaHasta: 'La fecha hasta es obligatoria' });
    expect(component.errorFecha).toBe('Las fechas desde y hasta no pueden estar vacías');
  });

  it('debería aplicar writeValue correctamente', () => {
    const value = {
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-01-10'
    };

    component.writeValue(value);

    expect((component as any).form.value).toEqual(value);
  });

  it('debería setear disabled correctamente con setDisabledState', () => {
    component.setDisabledState!(true);
    expect(component.disabled).toBeTrue();
    expect((component as any).form.disabled).toBeTrue();
    component.setDisabledState!(false);
    expect(component.disabled).toBeFalse();
    expect((component as any).form.enabled).toBeTrue();
  });

  it('cambioFechaDesde valida y emite el nuevo valor', () => {
    const changeSpy = jasmine.createSpy('change');
    component.registerOnChange(changeSpy);
    spyOn(component, 'validate');
    component.cambioFechaDesde();
    expect(component.validate).toHaveBeenCalledWith((component as any).form);
    expect(changeSpy).toHaveBeenCalledWith((component as any).form.value);
  });

  it('cambioFechaHasta valida y emite el nuevo valor', () => {
    const changeSpy = jasmine.createSpy('change');
    component.registerOnChange(changeSpy);
    spyOn(component, 'validate');
    component.cambioFechaHasta();
    expect(component.validate).toHaveBeenCalledWith((component as any).form);
    expect(changeSpy).toHaveBeenCalledWith((component as any).form.value);
  });

  it('registerOnTouched marca el formulario y ejecuta la función', () => {
    const fn = jasmine.createSpy('touched');
    component.registerOnTouched(fn);
    (component as any).onTouched();
    expect((component as any).form.touched).toBeTrue();
    expect(fn).toHaveBeenCalled();
  });

  it('campoError debería devolver true si El es inválido y tocado', () => {
    component.requiereFechaDesde = true;
    component.ngOnInit();

    const control = (component as any).form.get('fechaDesde');
    control?.markAsTouched();
    control?.updateValueAndValidity();

    expect(component.campoError('fechaDesde')).toBeTrue();
  });

  it('markAsTouched debería marcar todo como tocado y decir que es inválido', () => {
    component.requiereFechaDesde = true;
    component.ngOnInit();

    component.markAsTouched();

    expect((component as any).form.touched).toBeTrue();
    expect((component as any).form.valid).toBeFalse();
  });
});
