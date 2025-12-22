import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { EntregableResumenPipe } from '../../../pipes/entregable-resumen.pipe';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { CantidadPorcentajeComponent } from '../../comun/cantidad-porcentaje/cantidad-porcentaje.component';
import { ConformidadEntregaPopupComponent } from './conformidad-entrega-popup.component';

class MockModalRef { hide = jasmine.createSpy('hide'); content: any = { documentoAgregado: { subscribe: (cb: any) => cb({ id: 1, nombre: 'a', mimeType: '' }) } }; }

class MockModalService {
  show() { return new MockModalRef(); }
}

const mockArchivoService = {
  descargar: jasmine.createSpy('descargar')
};



const mockItemOrdenCompraService = {
  obtenerItemOrdenCompra: () => of({})
};

const mockEntregableService = {
  obtenerEntregable: () => of({})
};

const mockDocumentosUtilService = {
  descargarDocumento: jasmine.createSpy('descargarDocumento'),
  eliminarDocumento: jasmine.createSpy('eliminarDocumento').and.callFake((docs: ArchivoDTO[], doc: ArchivoDTO) => docs.filter(d => d !== doc)),
  obtenerDocumentosAMostrar: jasmine.createSpy('obtenerDocumentosAMostrar').and.callFake((docs: ArchivoDTO[]) => docs),
  getDocumentDate: jasmine.createSpy('getDocumentDate').and.returnValue(new Date())
};

describe('RecepcionEntregaComponent', () => {
  let component: ConformidadEntregaPopupComponent;
  let fixture: ComponentFixture<ConformidadEntregaPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConformidadEntregaPopupComponent, EntregableResumenPipe, CantidadPorcentajeComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: BsModalRef, useValue: new MockModalRef() },
        { provide: BsModalService, useClass: MockModalService },
        { provide: DocumentosUtilService, useValue: mockDocumentosUtilService },
        { provide: ItemOrdenCompraService, useValue: mockItemOrdenCompraService },
        { provide: EntregableService, useValue: mockEntregableService },
        { provide: DocumentosUtilService, useValue: mockDocumentosUtilService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConformidadEntregaPopupComponent);
    component = fixture.componentInstance;
  TestBed.inject(BsModalRef);
  component.ordenCompra = {} as any;
  component.itemOrdenCompra = {} as any;
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

  it('recalcula la cantidad pendiente cuando la aceptada supera el total', () => {
    component.entrega = { cantidadRecepcionAceptada: 5 } as any;
    component.ngOnInit();
    component.form.get('cantidadAceptada')?.setValue(10);
    expect(component.form.get('cantidadPendiente')?.value).toBe(5);
  });

  it('marca error si la suma de aceptada y rechazada supera la cantidad total', () => {
    component.entrega = { cantidadRecepcionAceptada: 5 } as any;
    component.ngOnInit();
    component.form.get('cantidadAceptada')?.setValue(3);
    component.form.get('cantidadRechazada')?.setValue(3);
    expect(component.form.get('cantidadRechazada')?.errors?.['sumaTotalExcedida']).toBeTruthy();
  });

  it('emite el evento de guardado cuando el formulario es válido', () => {
    component.entrega = { idEntrega: 1, cantidadRecepcionAceptada: 5, fechaComprometida: '2023-01-01' } as any;
    component.itemOrdenCompra = {} as any;
    component.entregable = {} as any;
    component.ngOnInit();
    spyOn(component.guardarEvento, 'emit');
    component.form.get('cantidadAceptada')?.setValue(2);
    component.form.get('cantidadRechazada')?.setValue(1);
    component.form.get('fechaConformidad')?.setValue('2023-01-01');
    component.form.get('motivo')?.setValue('m');
    component.guardar();
    expect(component.guardarEvento.emit).toHaveBeenCalled();
  });

  it('detecta cuando la conformidad está fuera de fecha', () => {
    component.entrega = { fechaComprometida: '2023-01-01' } as any;
    component.ngOnInit();
    component.form.get('fechaConformidad')?.setValue('2023-01-02');
    expect(component.conformidadFueraFecha()).toBeTrue();
  });

  it('obtiene la cantidad por defecto para un entregable porcentual', () => {
    const entregable = { tipoUnidad: TipoUnidad.PORCENTAJE } as any;
    expect(component.getCantidad(entregable)).toBe('100 de 100');
  });

  it('usa valores por defecto cuando la entrega no tiene conformidad aceptada', () => {
    component.entrega = { cantidadRecepcionAceptada: 3 } as any;
    component.ngOnInit();
    expect(component.form.get('cantidadAceptada')?.value).toBe(3);
    expect(component.form.get('cantidadRechazada')?.value).toBe(0);
  });

  it('obtiene la unidad formateada del entregable', () => {
    const entregable = { itemOrdenCompra: { descUnidadMedida: 'kg' }, cantidadTotalMostrar: 2, tipoUnidadEntregas: TipoUnidad.CANTIDAD } as any;
    expect(component.getUnidad(entregable)).toBe(' (kg)');
  });

  it('descarga un documento usando el servicio', () => {
    component.entrega = { idEntrega: 10 } as any;
    const doc = {} as ArchivoDTO;
    component.descargarDocumento(doc);
    expect(mockDocumentosUtilService.descargarDocumento).toHaveBeenCalledWith(doc, 10);
  });

  it('elimina un documento de la lista', () => {
    const doc = { idArchivo: 1 } as ArchivoDTO;
    component.documentos = [doc];
    mockDocumentosUtilService.eliminarDocumento.and.returnValue([]);
    component.eliminarDocumento(doc);
    expect(mockDocumentosUtilService.eliminarDocumento).toHaveBeenCalledWith([doc], doc);
    expect(component.documentos.length).toBe(0);
  });

});
