import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { CampoService } from '../../services/campo.service';
import { OperadorHelperService } from '../../services/operador-helper.service';
import { ConsultaCamposReglasComponent } from './consulta-campos-reglas.component';

describe('ConsultaCamposReglasComponent', () => {
  let component: ConsultaCamposReglasComponent;
  let fixture: ComponentFixture<ConsultaCamposReglasComponent>;

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
    path: jasmine.createSpy('path').and.returnValue(''),
    replaceState: jasmine.createSpy('replaceState')
  };
  const bsModalServiceStub = {
    show: jasmine.createSpy('show').and.returnValue({ content: {}, hide: jasmine.createSpy('hide') })
  };
  const snapshotServiceStub = {
    load: jasmine.createSpy('load').and.returnValue(null),
    save: jasmine.createSpy('save'),
    clear: jasmine.createSpy('clear')
  };
  const campoServiceStub = jasmine.createSpyObj('CampoService', ['obtenerTiposFuente', 'obtenerTodosPaginado', 'puedeModificar', 'puedeEliminar', 'eliminar']);
  campoServiceStub.obtenerTiposFuente.and.returnValue([]);
  campoServiceStub.obtenerTodosPaginado.and.returnValue(of({ content: [], totalElements: 0 }));
  campoServiceStub.puedeModificar.and.returnValue(true);
  campoServiceStub.puedeEliminar.and.returnValue(true);
  campoServiceStub.eliminar.and.returnValue(of({}));
  const operadorHelperStub = jasmine.createSpyObj('OperadorHelperService', ['obtenerNombreOperador']);
  operadorHelperStub.obtenerNombreOperador.and.returnValue('Operador');
  const seguridadServiceStub = jasmine.createSpyObj('SeguridadService', ['tienePermiso']);
  seguridadServiceStub.tienePermiso.and.returnValue(true);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultaCamposReglasComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: Location, useValue: locationStub },
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: SnapshotGenericService, useValue: snapshotServiceStub },
        { provide: CampoService, useValue: campoServiceStub },
        { provide: OperadorHelperService, useValue: operadorHelperStub },
        { provide: SeguridadService, useValue: seguridadServiceStub }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaCamposReglasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
