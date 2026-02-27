import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomDateValidators } from './custom-date-validator';

describe('CustomDateValidators', () => {
  let formBuilder: FormBuilder;
  let fixture: ComponentFixture<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
    });

    formBuilder = TestBed.inject(FormBuilder);
    fixture = TestBed.createComponent(DummyComponent); // Necesario para tener un control FormGroup en las pruebas
    fixture.detectChanges();
  });

  it('debe validar que toDate sea mayor que fromDate', () => {
    const formGroup: FormGroup = formBuilder.group({
      fromDate: [new Date('2022-01-01')],
      toDate: [new Date('2021-12-31')],
    }, { validators: CustomDateValidators.fromToDate('fromDate', 'toDate') });

    const toDateControl = formGroup.get('toDate');
    const fromDateControl = formGroup.get('fromDate');

    expect(toDateControl?.errors).toEqual({ fieldsMismatch: true });
    expect(fromDateControl?.errors).toBeNull();
    expect(formGroup.errors).toEqual({ fromToDate: true });
  });

  it('no debe validar cuando toDate es mayor que fromDate', () => {
    const formGroup: FormGroup = formBuilder.group({
      fromDate: [new Date('2021-12-31')],
      toDate: [new Date('2022-01-01')],
    }, { validators: CustomDateValidators.fromToDate('fromDate', 'toDate') });

    const toDateControl = formGroup.get('toDate');
    const fromDateControl = formGroup.get('fromDate');

    expect(toDateControl?.errors).toBeNull();
    expect(fromDateControl?.errors).toBeNull();
    expect(formGroup.errors).toBeNull();
  });

  it('no debe validar cuando toDate y fromDate son indefinidos', () => {
    const formGroup: FormGroup = formBuilder.group({
      fromDate: [undefined],
      toDate: [undefined],
    }, { validators: CustomDateValidators.fromToDate('fromDate', 'toDate') });

    const toDateControl = formGroup.get('toDate');
    const fromDateControl = formGroup.get('fromDate');

    expect(toDateControl?.errors).toBeNull();
    expect(fromDateControl?.errors).toBeNull();
    expect(formGroup.errors).toBeNull();
  });
});

// DummyComponent necesario para tener un control FormGroup en las pruebas
import { Component } from '@angular/core';

@Component({
    template: ''
})
class DummyComponent {}
