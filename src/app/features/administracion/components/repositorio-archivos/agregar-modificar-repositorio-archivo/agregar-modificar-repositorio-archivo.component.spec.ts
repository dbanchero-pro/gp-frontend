import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AgregarModificarRepositorioArchivoComponent } from './agregar-modificar-repositorio-archivo.component';
import { DocumentoRepositorioService } from '../../../services/documento-repositorio.service';

describe('AgregarModificarRepositorioArchivoComponent', () => {
  let component: AgregarModificarRepositorioArchivoComponent;
  let fixture: ComponentFixture<AgregarModificarRepositorioArchivoComponent>;

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
  const bsModalServiceStub = {
    show: jasmine.createSpy('show').and.returnValue({ content: {}, hide: jasmine.createSpy('hide') })
  };
  const documentoServiceStub = jasmine.createSpyObj('DocumentoRepositorioService', ['obtenerPorId', 'crear', 'actualizar']);
  documentoServiceStub.obtenerPorId.and.returnValue(of({}));
  documentoServiceStub.crear.and.returnValue(of({}));
  documentoServiceStub.actualizar.and.returnValue(of({}));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarRepositorioArchivoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: Router, useValue: routerStub },
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: DocumentoRepositorioService, useValue: documentoServiceStub }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarRepositorioArchivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('incluye los controles de tipo y subtipo de compra en el formulario', () => {
    expect(component.form.get('tipoCompraId')).toBeTruthy();
    expect(component.form.get('subtipoCompraId')).toBeTruthy();
  });
});

