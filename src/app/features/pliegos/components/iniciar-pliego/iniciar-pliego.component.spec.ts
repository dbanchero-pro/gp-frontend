import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FechaPipe } from 'src/app/shared/pipes/fecha.pipe';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { BandejaEntradaService } from '../../services/bandeja-entrada.service';
import { IniciarPliegoComponent } from './iniciar-pliego.component';
import { ModeloService } from 'src/app/features/administracion/services/modelo.service';

describe('IniciarPliegoComponent', () => {
  let component: IniciarPliegoComponent;
  let fixture: ComponentFixture<IniciarPliegoComponent>;

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
  const modeloServiceStub = jasmine.createSpyObj('ModeloService', ['buscarModelos']);
  modeloServiceStub.buscarModelos.and.returnValue(of([]));
  const bandejaEntradaServiceStub = jasmine.createSpyObj('BandejaEntradaService', ['buscarPliegos', 'obtenerProceso', 'asignarUsuariosYFinalizar', 'obtenerFiltrosIniciarPliego']);
  bandejaEntradaServiceStub.buscarPliegos.and.returnValue(of([]));
  bandejaEntradaServiceStub.obtenerProceso.and.returnValue(of({}));
  bandejaEntradaServiceStub.asignarUsuariosYFinalizar.and.returnValue(of({}));
  bandejaEntradaServiceStub.obtenerFiltrosIniciarPliego.and.returnValue(
    of({ incisos: [], unidadesEjecutoras: [], tiposCompra: [] })
  );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IniciarPliegoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: Location, useValue: locationStub },
        { provide: SnapshotGenericService, useValue: snapshotServiceStub },
        { provide: ModeloService, useValue: modeloServiceStub },
        { provide: BandejaEntradaService, useValue: bandejaEntradaServiceStub },
        FechaPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IniciarPliegoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
