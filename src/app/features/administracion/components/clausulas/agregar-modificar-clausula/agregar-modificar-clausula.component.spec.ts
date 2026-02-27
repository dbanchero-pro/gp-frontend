import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { AgregarModificarClausulaComponent } from './agregar-modificar-clausula.component';
import { ClausulaService } from '../../../services/clausula.service';

describe('AgregarModificarClausulaComponent', () => {
  let component: AgregarModificarClausulaComponent;
  let fixture: ComponentFixture<AgregarModificarClausulaComponent>;

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
  const clausulaServiceStub = jasmine.createSpyObj('ClausulaService', ['obtenerFiltrosClausula', 'obtenerClausulaPorId', 'crearClausula', 'actualizarClausula', 'aprobarClausula']);
  clausulaServiceStub.obtenerFiltrosClausula.and.returnValue(of({
    incisos: [],
    unidadesEjecutoras: [],
    tiposCompra: [],
    subtiposCompra: [],
    familias: [],
    subfamilias: [],
    clases: [],
    subclases: [],
    articulos: []
  }));
  clausulaServiceStub.obtenerClausulaPorId.and.returnValue(of(undefined));
  clausulaServiceStub.crearClausula.and.returnValue(of({}));
  clausulaServiceStub.actualizarClausula.and.returnValue(of({}));
  clausulaServiceStub.aprobarClausula.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarClausulaComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: SnapshotGenericService, useValue: snapshotServiceStub },
        { provide: ClausulaService, useValue: clausulaServiceStub }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarClausulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
