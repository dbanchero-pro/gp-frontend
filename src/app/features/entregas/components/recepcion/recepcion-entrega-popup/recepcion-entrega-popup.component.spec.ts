import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { Logger } from 'src/app/shared/utils/logger';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { EntregableResumenPipe } from '../../../pipes/entregable-resumen.pipe';
import { EntregaService } from '../../../services/entrega.service';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { CantidadPorcentajeComponent } from '../../comun/cantidad-porcentaje/cantidad-porcentaje.component';
import { RecepcionEntregaPopupComponent } from './recepcion-entrega-popup.component';

class MockModalRef { hide = jasmine.createSpy('hide'); content: any = { documentoAgregado: { subscribe: (cb: any) => cb({ id: 1, nombre: 'a', mimeType: '' }) } }; }

class MockModalService {
  show() { return new MockModalRef(); }
}

const mockArchivoService = {
  descargar: jasmine.createSpy('descargar')
};

const mockEntregaService = {
  descargarDocumento: (_idEntrega?: number, _idArchivo?: number) => ({ subscribe: () => { } })
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

describe('RecepcionEntregaPopupComponent', () => {
  let component: RecepcionEntregaPopupComponent;
  let fixture: ComponentFixture<RecepcionEntregaPopupComponent>;
  let modal: BsModalRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecepcionEntregaPopupComponent, EntregableResumenPipe, CantidadPorcentajeComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: BsModalRef, useValue: new MockModalRef() },
        { provide: BsModalService, useClass: MockModalService },
        { provide: ArchivoService, useValue: mockArchivoService },
        { provide: EntregaService, useValue: mockEntregaService },
        { provide: ItemOrdenCompraService, useValue: mockItemOrdenCompraService },
        { provide: EntregableService, useValue: mockEntregableService },
        { provide: DocumentosUtilService, useValue: mockDocumentosUtilService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepcionEntregaPopupComponent);
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

  it('debe emitir entrega si el formulario es válido', () => {
    const spy = jasmine.createSpy('emit');
    component.guardarEvento.subscribe(spy);
    component.entrega = { cantidad: 1 }
    component.form.patchValue({
      fechaComprometida: '2020-01-01',
      estado: 'entregado',
      cantidadPorcentaje: { tipo: TipoUnidad.CANTIDAD, valor: 1 },
      cantidadRechazada: 0,
      cantidadAceptada: 1
    });
    spyOn(Logger, 'logInfo').and.callFake(() => { });
    component.guardar();
    expect(spy).toHaveBeenCalled();
  });

  it('getDocumentDate devuelve la fecha actual si el índice no existe', () => {
    const now = new Date();
    const res = component.getDocumentDate(10);
    expect(res.getFullYear()).toBe(now.getFullYear());
  });

  it('la validez del formulario refleja su estado', () => {
    component.entrega = { cantidad: 1, tipoUnidad: TipoUnidad.CANTIDAD } as any;

    component.form.patchValue({
      cantidadAceptada: null,
      cantidadRechazada: null
    });

    fixture.detectChanges();

    expect(component.form.valid).toBeFalse();

    component.form.patchValue({
      cantidadAceptada: 1,
      cantidadRechazada: 0
    });

    expect(component.form.valid).toBeTrue();
  });


  it('descargarDocumento descarga un archivo modificado', () => {
    component.entrega = { idEntrega: 5 } as any;
    const doc = { id: -1, modificado: true } as any;
    component.descargarDocumento(doc);
    expect(mockDocumentosUtilService.descargarDocumento).toHaveBeenCalledWith(doc, 5);
  });

  it('descargarDocumento obtiene y descarga un archivo existente', () => {
    component.entrega = { idEntrega: 5 } as any;
    const doc = { id: 3 } as any;
    component.descargarDocumento(doc);
    expect(mockDocumentosUtilService.descargarDocumento).toHaveBeenCalledWith(doc, 5);
  });


  it('esTipoUnidadPorcentaje reconoce el tipo del entregable', () => {
    component.entregable = { tipoUnidadEntregas: TipoUnidad.PORCENTAJE } as any;
    expect(component.esPorcentaje).toBeTrue();
  });

  it('esTipoUnidadCantidad usa la unidad del ítem cuando no hay entregable', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { tipoUnidad: TipoUnidad.CANTIDAD } as any;
    expect(component.esPorcentaje).toBeFalse();
  });

  it('esTipoUnidadPorcentaje retorna false cuando no hay entregable', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { tipoUnidad: TipoUnidad.CANTIDAD } as any;
    expect(component.esPorcentaje).toBeFalse();
  });

  it('guardar no emite cuando el formulario es inválido', () => {
    const spy = jasmine.createSpy('emit');
    component.guardarEvento.subscribe(spy);
    component.form.patchValue({ fechaRecepcion: '' });
    component.guardar();
    expect(spy).not.toHaveBeenCalled();
  });

  it('eliminarDocumento actúa según el origen', () => {
    const nuevo = { id: -1 } as any;
    const existente = { id: 5 } as any;
    component.documentos = [nuevo, existente];
    mockDocumentosUtilService.eliminarDocumento.and.returnValue([existente]);
    component.eliminarDocumento(nuevo);
    expect(component.documentos.length).toBe(1);
    mockDocumentosUtilService.eliminarDocumento.and.returnValue([]);
    component.eliminarDocumento(existente);
  });

  it('usa valores por defecto cuando la entrega no tiene cantidad recepcionada', () => {
    component.entrega = { cantidad: 5 } as any;
    component.ngOnInit();
    expect(component.form.get('cantidadAceptada')?.value).toBe(5);
    expect(component.form.get('cantidadRechazada')?.value).toBe(0);
  });

  it('campoVacio refleja el estado del control', () => {
    const control = component.form.get('fechaRecepcion');
    control?.markAsTouched();
    control?.setValue('');
    expect(component.campoVacio('fechaRecepcion')).toBeTrue();
  });

  it('motivo requerido si hay rechazo', () => {
    component.form.patchValue({ cantidadRechazada: 1, motivo: '' });
    component.form.get('motivo')?.updateValueAndValidity();
    expect(component.form.get('motivo')?.valid).toBeFalse();
  });

  it('actualiza la obligación del motivo al cambiar la cantidad rechazada', () => {
    component.form.patchValue({ cantidadRechazada: 1, motivo: '' });
    expect(component.form.get('motivo')?.valid).toBeFalse();
    component.form.get('cantidadRechazada')?.setValue(0);
    expect(component.form.get('motivo')?.valid).toBeTrue();
  });

  it('actualiza la validación de aceptada cuando cambia la rechazada', () => {
    component.entrega = { cantidad: 10 } as any;
    component.ngOnInit();
    component.form.get('cantidadAceptada')?.setValue(3);
    component.form.get('cantidadRechazada')?.setValue(8);
    expect(component.form.get('cantidadAceptada')?.errors?.['sumaTotalExcedida']).toBeTruthy();
    component.form.get('cantidadRechazada')?.setValue(7);
    expect(component.form.get('cantidadAceptada')?.errors).toBeNull();
  });

  it('recalcula la cantidad pendiente sin valores negativos', () => {
    component.entrega = { cantidad: 5 } as any;
    component.ngOnInit();
    component.form.get('cantidadAceptada')?.setValue(10);
    expect(component.form.get('cantidadPendiente')?.value).toBe(5);
  });

  it('obtenerCantidadTotal retorna cero cuando no hay entrega', () => {
    component.entrega = undefined as any;
    expect((component as any).obtenerCantidadTotal()).toBe(0);
  });

  it('getUnidad retorna vacío si falta información', () => {
    expect(component.getUnidad({} as any)).toBe('');
  });

  it('getCantidad muestra 100 de 100 para porcentajes sin datos', () => {
    const ent = { tipoUnidad: TipoUnidad.PORCENTAJE, cantidad: 100 } as any;
    expect(component.getCantidad(ent)).toBe('100 de 100');
  });

  it('obtenerItemOrdenCompra llama al servicio cuando hay ids', () => {
    component.ordenCompra = { idOC: 1 } as any;
    component.itemOrdenCompra = { idItem: 2, idVariacion: 0 } as any;
    const spy = spyOn(mockItemOrdenCompraService, 'obtenerItemOrdenCompra').and.returnValue(of({}));
    component.obtenerItemOrdenCompra();
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.argsFor(0) as any).toEqual([1, 2, 0]);
  });

  it('obtenerEntregable llama al servicio cuando hay id', () => {
    component.entregable = { idEntregable: 5 } as any;
    const spy = spyOn(mockEntregableService, 'obtenerEntregable').and.returnValue(of({}));
    component.obtenerEntregable();
    expect(spy).toHaveBeenCalled();
    expect(spy.calls.argsFor(0) as any).toEqual([5]);
  });


  it('tipoUnidadRecepcion respeta la prioridad de origen', () => {
    component.entrega = { tipoUnidad: TipoUnidad.CANTIDAD } as any;
    expect(component.tipoUnidadRecepcion).toBe(TipoUnidad.CANTIDAD);
    component.entrega = undefined as any;
    component.entregable = { tipoUnidadEntregas: TipoUnidad.PORCENTAJE } as any;
    expect(component.tipoUnidadRecepcion).toBe(TipoUnidad.PORCENTAJE);
    component.entregable = undefined as any;
    component.itemOrdenCompra = { tipoUnidad: TipoUnidad.CANTIDAD } as any;
    expect(component.tipoUnidadRecepcion).toBe(TipoUnidad.CANTIDAD);
  });

  it('fechaMinima devuelve vacío si no hay orden', () => {
    component.ordenCompra = undefined as any;
    expect(component.fechaMinimaRecepcion).toBe('');
   
  });

});