import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { TipoArchivoRepositorio } from 'src/app/shared/enum/tipo-archivo-repositorio.enum';
import { DocumentoRepositorioDTO } from 'src/app/shared/models/pliego/documento-repositorio.model';
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
      declarations: [],
      imports: [
        ReactiveFormsModule,
        AgregarModificarRepositorioArchivoComponent,
      ],
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

  it('deberia crearse', () => {
    expect(component).toBeTruthy();
  });

  it('incluye los controles de tipo y subtipo de compra en el formulario', () => {
    expect(component.form.get('tipoCompraId')).toBeTruthy();
    expect(component.form.get('subtipoCompraId')).toBeTruthy();
  });

  it('usa el archivo existente cuando se modifica sin seleccionar un archivo nuevo', () => {
    const archivoExistente = new ArchivoDTO(1, 'manual.pdf', 'application/pdf', 'base64', false, false, new Date());
    component.documentoExistente = new DocumentoRepositorioDTO(
      1,
      10,
      'Inciso',
      20,
      'Unidad',
      'Documento',
      'Descripcion',
      TipoArchivoRepositorio.OTRO,
      archivoExistente,
      new Date(),
      new Date()
    );
    component.esModificacion = true;
    component.form.patchValue({
      organismo: { idInciso: 10, idUnidadEjecutora: 20 },
      nombreDocumento: 'Documento',
      descripcionDocumento: 'Descripcion',
      tipoArchivo: TipoArchivoRepositorio.OTRO
    });

    component.guardar();

    expect(documentoServiceStub.actualizar).toHaveBeenCalled();
    const documentoGuardado = documentoServiceStub.actualizar.calls.mostRecent().args[0] as DocumentoRepositorioDTO;
    expect(documentoGuardado.archivo).toBe(archivoExistente);
  });

  it('muestra error si se intenta guardar sin archivo y sin documento existente', () => {
    const mensajeSpy = spyOn(component['actualizarService'], 'mensajeError');
    component.esModificacion = true;
    component.documentoExistente = undefined;
    component.form.patchValue({
      organismo: { idInciso: 10, idUnidadEjecutora: 20 },
      nombreDocumento: 'Documento',
      descripcionDocumento: 'Descripcion',
      tipoArchivo: TipoArchivoRepositorio.OTRO
    });

    component.guardar();

    expect(mensajeSpy).toHaveBeenCalled();
    expect(documentoServiceStub.actualizar).not.toHaveBeenCalled();
  });
});
