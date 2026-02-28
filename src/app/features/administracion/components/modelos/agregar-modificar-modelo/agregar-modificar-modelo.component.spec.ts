import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { AgregarModificarModeloComponent } from './agregar-modificar-modelo.component';
import { ModeloService } from '../../../services/modelo.service';

describe('AgregarModificarModeloComponent', () => {
  let component: AgregarModificarModeloComponent;
  let fixture: ComponentFixture<AgregarModificarModeloComponent>;

  const activatedRouteStub = {
    params: of({}),
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
  const modeloServiceStub = jasmine.createSpyObj('ModeloService', ['obtenerModeloPorId', 'crearModelo', 'actualizarModelo']);
  modeloServiceStub.obtenerModeloPorId.and.returnValue(of(undefined));
  modeloServiceStub.crearModelo.and.returnValue(of({}));
  modeloServiceStub.actualizarModelo.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        ReactiveFormsModule,
        AgregarModificarModeloComponent,
      ],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: SnapshotGenericService, useValue: snapshotServiceStub },
        { provide: ModeloService, useValue: modeloServiceStub }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarModificarModeloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
