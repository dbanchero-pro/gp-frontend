import { Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { ConsultaRepositorioArchivosComponent } from './consulta-repositorio-archivos.component';
import { DocumentoRepositorioService } from '../../../services/documento-repositorio.service';

@Component({
  selector: 'app-filtro-organismo',
  template: '',
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
class MockFiltroOrganismoComponent implements ControlValueAccessor, Validator {
  writeValue(_obj: any): void { /* no-op */ }
  registerOnChange(_fn: any): void { /* no-op */ }
  registerOnTouched(_fn: any): void { /* no-op */ }
  setDisabledState?(_isDisabled: boolean): void { /* no-op */ }
  validate(_control: AbstractControl): ValidationErrors | null {
    return null;
  }
}

describe('ConsultaRepositorioArchivosComponent', () => {
  let component: ConsultaRepositorioArchivosComponent;
  let fixture: ComponentFixture<ConsultaRepositorioArchivosComponent>;

  const activatedRouteStub = {
    snapshot: {
      params: {},
      paramMap: { get: (_key: string) => null },
      queryParamMap: { get: (_key: string) => null }
    }
  };
  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };
  const bsModalServiceStub = {
    show: jasmine.createSpy('show').and.returnValue({ content: {}, hide: jasmine.createSpy('hide') })
  };
  const snapshotServiceStub = {
    load: jasmine.createSpy('load').and.returnValue(null),
    save: jasmine.createSpy('save'),
    clear: jasmine.createSpy('clear')
  };
  const documentoServiceStub = jasmine.createSpyObj('DocumentoRepositorioService', ['obtenerTiposArchivo', 'obtenerTodos', 'descargar', 'eliminar']);
  documentoServiceStub.obtenerTiposArchivo.and.returnValue([]);
  documentoServiceStub.obtenerTodos.and.returnValue(of({ content: [], totalElements: 0 }));
  documentoServiceStub.descargar.and.returnValue(of({}));
  documentoServiceStub.eliminar.and.returnValue(of({}));
  const archivoServiceStub = jasmine.createSpyObj('ArchivoService', ['descargar']);
  const seguridadServiceStub = jasmine.createSpyObj('SeguridadService', ['tienePermiso']);
  seguridadServiceStub.tienePermiso.and.returnValue(true);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultaRepositorioArchivosComponent, MockFiltroOrganismoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: SnapshotGenericService, useValue: snapshotServiceStub },
        { provide: DocumentoRepositorioService, useValue: documentoServiceStub },
        { provide: ArchivoService, useValue: archivoServiceStub },
        { provide: SeguridadService, useValue: seguridadServiceStub }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaRepositorioArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
