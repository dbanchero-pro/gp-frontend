import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { EntregableResumenPipe } from '../../../pipes/entregable-resumen.pipe';
import { EntregaService } from '../../../services/entrega.service';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { CantidadPorcentajeComponent } from '../cantidad-porcentaje/cantidad-porcentaje.component';
import { RecepcionDetalleComponent } from './recepcion-detalle.component';

class MockModalRef { hide = jasmine.createSpy('hide'); content: any = { documentoAgregado: { subscribe: (cb: any) => cb({ id: 1, nombre: 'a', mimeType: '' }) } }; }

class MockModalService {
  show() { return new MockModalRef(); }
}

const mockEntregaService = {
  descargarDocumento: (_idEntrega?: number, _idArchivo?: number) => ({ subscribe: () => { } }),
  recepcionFueraFecha: () => false
};
const mockDocumentosUtilService = {
  descargarDocumento:  jasmine.createSpy('descargarDocumento').and.returnValue(of({})),
};
const mockItemOrdenCompraService = {
  obtenerItemOrdenCompra: () => of({})
};

const mockEntregableService = {
  obtenerEntregable: () => of({}),
  recepcionFueraFecha: () => false
};

describe('RecepcionDetalleComponent', () => {
  let component: RecepcionDetalleComponent;
  let fixture: ComponentFixture<RecepcionDetalleComponent>;
  let modal: BsModalRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecepcionDetalleComponent, EntregableResumenPipe, CantidadPorcentajeComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: BsModalRef, useValue: new MockModalRef() },
        { provide: BsModalService, useClass: MockModalService },
        { provide: EntregaService, useValue: mockEntregaService },
        { provide: ItemOrdenCompraService, useValue: mockItemOrdenCompraService },
        { provide: EntregableService, useValue: mockEntregableService },
        { provide: DocumentosUtilService, useValue: mockDocumentosUtilService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionDetalleComponent);
    component = fixture.componentInstance;
    modal = TestBed.inject(BsModalRef);
    component.entrega = { cantidadTotalMostrar: 0, cantidadPendienteAsignar: 10, tipoUnidad: TipoUnidad.CANTIDAD } as any;
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

  it('descargarDocumento descarga un archivo modificado', () => {
    const doc = { id: -1, modificado: true } as any;
    component.entrega = { idEntrega: 5 } as any;
    component.descargarDocumento(doc);
    expect(mockDocumentosUtilService.descargarDocumento).toHaveBeenCalledWith(doc,5);
  });

  it('descargarDocumento obtiene y descarga un archivo existente', () => {
    component.entrega = { idEntrega: 5 } as any;
    const doc = { id: 3 } as any;
    component.descargarDocumento(doc);
    expect(mockDocumentosUtilService.descargarDocumento).toHaveBeenCalledWith(doc,5);
  });

  it('muestra documentos en una lista con botones accesibles', () => {
    component.entrega = {
      cantidadTotalMostrar: 0,
      cantidadPendienteAsignar: 10,
      tipoUnidad: TipoUnidad.CANTIDAD,
      documentosRecepcion: [{ id: 1, nombre: 'doc1' }]
    } as any;
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(1);
    const boton = items[0].querySelector('button');
    expect(boton.getAttribute('type')).toBe('button');
  });


  it('etiquetas cambian según si hay entregable', () => {
    component.entrega = { entregable: {} } as any;
    expect(component.etiquetaFecha).toBe('Fecha entrega');
    expect(component.etiquetaCantidad).toBe('Cantidad');
    component.entrega = {} as any;
    expect(component.etiquetaFecha).toBe('Fecha entrega prevista');
    expect(component.etiquetaCantidad).toBe('Cantidad prevista');
  });


});
