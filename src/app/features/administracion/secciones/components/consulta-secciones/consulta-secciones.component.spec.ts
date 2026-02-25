import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FechaPipe } from 'src/app/shared/pipes/fecha.pipe';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { SeccionService } from '../../services/seccion.service';
import { ConsultaSeccionesComponent } from './consulta-secciones.component';

describe('ConsultaSeccionesComponent', () => {
  let component: ConsultaSeccionesComponent;
  let fixture: ComponentFixture<ConsultaSeccionesComponent>;

  const activatedRouteStub = {
    snapshot: {
      queryParamMap: { get: (_key: string) => null },
      params: {},
      paramMap: { get: (_key: string) => null }
    }
  };
  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };
  const locationStub = {
    back: jasmine.createSpy('back'),
    path: jasmine.createSpy('path').and.returnValue(''),
    replaceState: jasmine.createSpy('replaceState')
  };
  const snapshotServiceStub = {
    load: jasmine.createSpy('load').and.returnValue(null),
    save: jasmine.createSpy('save'),
    clear: jasmine.createSpy('clear')
  };
  const seccionServiceStub = jasmine.createSpyObj('SeccionService', ['buscarSecciones', 'eliminarSeccion']);
  seccionServiceStub.buscarSecciones.and.returnValue(of([]));
  seccionServiceStub.eliminarSeccion.and.returnValue(of({ exitoso: true, mensaje: '' }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultaSeccionesComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: Location, useValue: locationStub },
        { provide: SnapshotGenericService, useValue: snapshotServiceStub },
        { provide: SeccionService, useValue: seccionServiceStub },
        FechaPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaSeccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
