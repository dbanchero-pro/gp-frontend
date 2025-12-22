import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { TipoUnidad } from 'src/app/features/entregas/enum/tipo-unidad.enum';
import { ItemOrdenCompraService } from 'src/app/features/entregas/services/item-orden-compra.service';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { EstadoAjuste } from '../../enum/estado-ajuste.enum';
import { IAjusteDTO } from '../../models/ajuste.model';
import { AjusteService } from '../../services/ajuste.service';
import { ResolucionAjustePopupComponent } from './resolucion-ajuste-popup.component';

class MockModalRef { hide = jasmine.createSpy('hide'); content: any = { documentoAgregado: { subscribe: (cb: any) => cb({ id: 1, nombre: 'a', mimeType: '' }) } }; }

class MockModalService {
  show() { return new MockModalRef(); }
}

const mockArchivoService = {
  descargar: jasmine.createSpy('descargar')
};

const mockAjusteService = {
  rechazar: (_dto: IAjusteDTO) => ({ subscribe: () => { } }),
  aprobar: (_dto: IAjusteDTO) => ({ subscribe: () => { } }),
  aprobarAjuste: (dto: IAjusteDTO) => ({ subscribe: () => dto }),
  rechazarAjuste: (dto: IAjusteDTO) => ({ subscribe: () => dto }),
};

const mockDocumentosUtilService = {
  descargarDocumento: jasmine.createSpy('descargarDocumento').and.returnValue(of({})),
  getDocumentDate: () => new Date(),
  eliminarDocumento: jasmine.createSpy('eliminarDocumento')
};

const mockItemOrdenCompraService = {
  obtenerItemOrdenCompra: () => of({})
};

const mockEntregableService = {
  obtenerEntregable: () => of({})
};

describe('ResolucionAjustePopupComponent', () => {
  let component: ResolucionAjustePopupComponent;
  let fixture: ComponentFixture<ResolucionAjustePopupComponent>;
  let modal: BsModalRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResolucionAjustePopupComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: BsModalRef, useValue: new MockModalRef() },
        { provide: BsModalService, useClass: MockModalService },
        { provide: ArchivoService, useValue: mockArchivoService },
        { provide: AjusteService, useValue: mockAjusteService },
        { provide: ItemOrdenCompraService, useValue: mockItemOrdenCompraService },
        { provide: DocumentosUtilService, useValue: mockDocumentosUtilService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ResolucionAjustePopupComponent);
    component = fixture.componentInstance;
    modal = TestBed.inject(BsModalRef);
    component.itemOrdenCompra = { cantidadTotalMostrar: 0, cantidadPendienteAsignar: 10, tipoUnidad: TipoUnidad.CANTIDAD } as any;
    // Mock de settings requerido por el template (settings.archivosCantidadMax)
    AppConfig.settings = {
      apiCargaMasivaUrl: '',
      apiUrl: '',
      keycloak: { url: '', realm: '', clientId: '' },
      extensionesPermitidas: '',
      urlBaseFrontEnd: '',
      loggingLevel: 0 as any,
      archivosTamanoMaxBytes: 0,
      archivosCantidadMax: 10,
      contenidoInicio: ''
    };
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('deberia marcar los campos cuando el formulario es invalido', () => {
    const aprobarSpy = spyOn(component.aprobarEvento, 'emit');
    const rechazarSpy = spyOn(component.rechazarEvento, 'emit');
    component.ajuste = { idAjuste: 10, } as IAjusteDTO;
    
    component.form.setValue({ resolucion: false, motivoResolucion: '' });
    component.seleccionarResolucion(false);
    component.guardar();

    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('resolucion')?.touched).toBeTrue();
    expect(component.form.get('motivoResolucion')?.touched).toBeTrue();
    expect(aprobarSpy).not.toHaveBeenCalled();
    expect(rechazarSpy).not.toHaveBeenCalled();
  });

  it('deberia emitir aprobacion cuando se selecciona aceptar', () => {
    component.ajuste = { idAjuste: 10 } as IAjusteDTO;
    component.form.setValue({ resolucion: true, motivoResolucion: 'Aprobado' });
    mockAjusteService.aprobarAjuste = jasmine.createSpy('aprobarAjuste').and.returnValue(of({
      resolucion: true,
      motivoResolucion: 'Aprobado',
      estado: EstadoAjuste.APROBADO
    }));
    const aprobarSpy = spyOn(component.aprobarEvento, 'emit');
    const rechazarSpy = spyOn(component.rechazarEvento, 'emit');

    component.guardar();

    expect(aprobarSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      idAjuste: 10,
      motivoResolucion: 'Aprobado',
      estado: EstadoAjuste.APROBADO
    }));
    expect(rechazarSpy).not.toHaveBeenCalled();
  });

  it('deberia emitir rechazo cuando se selecciona rechazar', () => {
    component.ajuste = { idAjuste: 20 } as IAjusteDTO;
    component.form.setValue({ resolucion: false, motivoResolucion: 'No corresponde' });
    mockAjusteService.rechazarAjuste = jasmine.createSpy('aprobarAjuste').and.returnValue(of({
       idAjuste: 20,
      resolucion: true,
      motivoResolucion: 'No corresponde'
    }));
    const aprobarSpy = spyOn(component.aprobarEvento, 'emit');
    const rechazarSpy = spyOn(component.rechazarEvento, 'emit');

    component.guardar();

    expect(rechazarSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      idAjuste: 20,
      motivoResolucion: 'No corresponde'
    }));
    expect(aprobarSpy).not.toHaveBeenCalled();
  });
});
