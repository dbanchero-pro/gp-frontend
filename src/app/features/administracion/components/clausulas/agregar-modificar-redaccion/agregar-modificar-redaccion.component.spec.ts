import { Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { FechaPipe } from 'src/app/shared/pipes/fecha.pipe';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { AgregarModificarRedaccionComponent } from './agregar-modificar-redaccion.component';

@Component({
  selector: 'app-text-editor',
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockTextEditorComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MockTextEditorComponent),
      multi: true
    }
  ]
})
class MockTextEditorComponent implements ControlValueAccessor, Validator {
  writeValue(_obj: any): void { /* no-op */ }
  registerOnChange(_fn: any): void { /* no-op */ }
  registerOnTouched(_fn: any): void { /* no-op */ }
  setDisabledState?(_isDisabled: boolean): void { /* no-op */ }
  validate(_control: AbstractControl): ValidationErrors | null {
    return null;
  }
}

describe('AgregarModificarRedaccionComponent', () => {
  let component: AgregarModificarRedaccionComponent;
  let fixture: ComponentFixture<AgregarModificarRedaccionComponent>;

  const activatedRouteStub = {
    snapshot: {
      paramMap: { get: (_key: string) => null },
      queryParamMap: { get: (_key: string) => null },
      params: {}
    },
    queryParams: of({}),
    params: of({})
  };
  const routerStub = {
    navigate: jasmine.createSpy('navigate'),
    getCurrentNavigation: () => null
  };
  const locationStub = {
    back: jasmine.createSpy('back')
  };
  const bsModalServiceStub = {
    show: jasmine.createSpy('show').and.returnValue({ content: {}, hide: jasmine.createSpy('hide') })
  };
  const snapshotServiceStub = {
    load: jasmine.createSpy('load').and.returnValue(null),
    save: jasmine.createSpy('save'),
    clear: jasmine.createSpy('clear')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        ReactiveFormsModule,
        AgregarModificarRedaccionComponent,
        MockTextEditorComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: Location, useValue: locationStub },
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: SnapshotGenericService, useValue: snapshotServiceStub },
        FechaPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarRedaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
