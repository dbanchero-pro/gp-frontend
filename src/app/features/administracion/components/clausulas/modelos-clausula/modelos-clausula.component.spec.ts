import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FechaPipe } from 'src/app/shared/pipes/fecha.pipe';
import { ModelosClausulaComponent } from './modelos-clausula.component';
import { ClausulaService } from '../../../services/clausula.service';

describe('ModelosClausulaComponent', () => {
  let component: ModelosClausulaComponent;
  let fixture: ComponentFixture<ModelosClausulaComponent>;

  const activatedRouteStub = {
    snapshot: {
      paramMap: { get: (_key: string) => null },
      params: {},
      queryParamMap: { get: (_key: string) => null }
    }
  };
  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };
  const locationStub = {
    back: jasmine.createSpy('back')
  };
  const clausulaServiceStub = jasmine.createSpyObj('ClausulaService', ['obtenerClausula', 'obtenerModelosPorClausula']);
  clausulaServiceStub.obtenerClausula.and.returnValue(of({ denominacion: '' }));
  clausulaServiceStub.obtenerModelosPorClausula.and.returnValue(of([]));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: Location, useValue: locationStub },
        { provide: ClausulaService, useValue: clausulaServiceStub },
        FechaPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        ModelosClausulaComponent,
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelosClausulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
