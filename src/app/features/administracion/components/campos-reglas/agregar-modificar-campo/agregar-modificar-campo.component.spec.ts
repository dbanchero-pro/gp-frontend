import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { AgregarModificarCampoComponent } from './agregar-modificar-campo.component';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { CampoService } from '../../../services/campo.service';
import { OperadorHelperService } from '../../../services/operador-helper.service';

describe('AgregarModificarCampoComponent', () => {
  let component: AgregarModificarCampoComponent;
  let fixture: ComponentFixture<AgregarModificarCampoComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockCampoService: jasmine.SpyObj<CampoService>;
  let mockActualizarService: jasmine.SpyObj<ActualizarService>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      params: of({ idCampo: 1 })
    };
    mockCampoService = jasmine.createSpyObj('CampoService', [
      'obtenerTiposFuente',
      'obtenerTiposDato',
      'obtenerPorId',
      'crear',
      'actualizar'
    ]);
    mockActualizarService = jasmine.createSpyObj('ActualizarService', [
      'mensajeError',
      'mensajeCorrecto'
    ]);

    mockCampoService.obtenerTiposFuente.and.returnValue([]);
    mockCampoService.obtenerTiposDato.and.returnValue([]);

    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        ReactiveFormsModule,
        AgregarModificarCampoComponent,
      ],
      providers: [
        FormBuilder,
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: CampoService, useValue: mockCampoService },
        { provide: ActualizarService, useValue: mockActualizarService },
        { provide: OperadorHelperService, useValue: {} },
        { provide: BsModalService, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarModificarCampoComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
