import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { Logger } from 'src/app/shared/utils/logger';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { EntregableResumenPipe } from '../../../pipes/entregable-resumen.pipe';
import { EntregaService } from '../../../services/entrega.service';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { CantidadPorcentajeComponent } from '../../comun/cantidad-porcentaje/cantidad-porcentaje.component';
import { AgregarDocumentoPopupComponent } from '../agregar-documento-popup/agregar-documento-popup.component';
import { AgregarModificarEntregaObraPopupComponent } from './agregar-modificar-entrega-obra-popup.component';

class MockModalRef { hide = jasmine.createSpy('hide'); content: any = { documentoAgregado: { subscribe: (cb: any) => cb({ id: 1, nombre: 'a', mimeType: '' }) } }; }

class MockModalService {
  show() { return new MockModalRef(); }
}

const mockEntregaService = {
  descargarDocumento: (_idEntrega?: number, _idArchivo?: number) => ({ subscribe: () => {} })
};

const mockItemOrdenCompraService = {
  obtenerItemOrdenCompra: () => of({})
};

const mockEntregableService = {
  obtenerEntregable: jasmine.createSpy('obtenerEntregable').and.returnValue(of({}))
};

const mockDocumentosUtilService = {
  descargarDocumento: jasmine.createSpy('descargarDocumento'),
  obtenerDocumentosAMostrar: (docs: IArchivoDTO[]) => docs.filter(d => !d.eliminado),
  eliminarDocumento: jasmine.createSpy('eliminarDocumento'),
  getDocumentDate: () => new Date()
};

describe('AgregarModificarEntregaObraPopupComponent', () => {
  let component: AgregarModificarEntregaObraPopupComponent;
  let fixture: ComponentFixture<AgregarModificarEntregaObraPopupComponent>;
  let modal: BsModalRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarEntregaObraPopupComponent, AgregarDocumentoPopupComponent, EntregableResumenPipe, CantidadPorcentajeComponent],
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
    fixture = TestBed.createComponent(AgregarModificarEntregaObraPopupComponent);
    component = fixture.componentInstance;
    mockEntregableService.obtenerEntregable.calls.reset();
    mockEntregableService.obtenerEntregable.and.returnValue(of({}));
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

  it('debe cargar datos al modificar', () => {
    component.esModificacion = true;
  component.entregaModificar = { idEntrega: 1, fechaEntrega: '2020-01-01', estado: 'entregado', responsable: 'a', documentos: [] } as any;
    component.ngOnInit();
    expect(component.form.get('estado')?.value).toBe('entregado');
  });

  it('ngOnInit establece la fecha por defecto cuando existe', () => {
    component.entregaModificar = undefined as any;
    component.itemOrdenCompra = { cantidadPendienteAsignar: 10, tipoUnidad: TipoUnidad.CANTIDAD, fechaComprometida: '2020-02-01' } as any;
    component.ngOnInit();
    expect(component.form.get('fechaComprometida')?.value).toBe('2020-02-01');
  });

  it('debe emitir entrega si el formulario es válido', () => {
    const spy = jasmine.createSpy('emit');
    component.guardarEvento.subscribe(spy);
    component.form.patchValue({ fechaComprometida: '2020-01-01', estado: 'entregado', cantidadPorcentaje: { tipo: TipoUnidad.CANTIDAD, valor: 1 } });
    spyOn(Logger, 'logInfo').and.callFake(() => {});
    component.guardar();
    expect(spy).toHaveBeenCalled();
  });

  it('no debería emitir si el formulario es inválido', () => {
    const spy = jasmine.createSpy('emit');
    spyOn(component, 'cerrarPopup')
    component.guardarEvento.subscribe(spy);
    component.guardar();
    expect(spy).not.toHaveBeenCalled();
    expect(component.cerrarPopup).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('agregarDocumento debe añadir un documento', () => {
    component.documentos = [];
    component.agregarDocumento();
    expect(component.documentos.length).toBe(1);
  });

  it('getDocumentDate devuelve la fecha actual si el índice no existe', () => {
    const now = new Date();
    const res = component.getDocumentDate(10);
    expect(res.getFullYear()).toBe(now.getFullYear());
  });

  it('la validez del formulario refleja su estado', () => {
    expect(component.form.valid).toBeFalse();
    component.form.patchValue({ fechaComprometida: 'a', estado: 'b', cantidadPorcentaje: { tipo: TipoUnidad.CANTIDAD, valor: 1 } });
    expect(component.form.valid).toBeTrue();
  });

  it('no debería permitir cantidad mayor a la pendiente', () => {
    const spy = jasmine.createSpy('emit');
    component.entregable = {
      cantidad: 5,
      cantidadPendienteAsignar: 1,
      tipoUnidad: TipoUnidad.CANTIDAD,
      entregas: []
    } as any;
    component.ngOnInit();
    component.guardarEvento.subscribe(spy);
    component.form.patchValue({ fechaComprometida: '2020-01-01', estado: 'entregado', cantidadPorcentaje: { tipo: TipoUnidad.CANTIDAD, valor: 2 } });
    component.form.get('cantidadPorcentaje')?.markAsTouched();
    component.form.get('cantidadPorcentaje')?.updateValueAndValidity();
    fixture.detectChanges();
    const error = fixture.nativeElement.querySelector('app-cantidad-porcentaje .invalid-feedback');
    expect(error?.textContent.trim()).toBe('La cantidad ingresada supera la cantidad pendiente por asignar');
    component.guardar();
    expect(spy).not.toHaveBeenCalled();
  });

  it('no debería permitir porcentaje mayor a la pendiente', () => {
  const spy = jasmine.createSpy('emit');
  // Simula entregas previas que suman 90%, se intenta agregar 20% -> excede 100
  component.entregable = {
    cantidad: 1,
    cantidadPendienteAsignar: 10,
    tipoUnidad: TipoUnidad.PORCENTAJE,
    entregas: [{ idEntrega: 2, cantidad: 90 }]
  } as any;
  component.ngOnInit();
  component.guardarEvento.subscribe(spy);
  component.form.patchValue({
    fechaComprometida: '2020-01-01',
    estado: 'entregado',
    cantidadPorcentaje: { tipo: TipoUnidad.PORCENTAJE, valor: 20 }
  });
  component.form.get('cantidadPorcentaje')?.markAsTouched();
  component.form.get('cantidadPorcentaje')?.updateValueAndValidity();
  expect(
    component.form.get('cantidadPorcentaje')?.errors?.['excedePendientePorcentaje']
  ).toBeTruthy();
  component.guardar();
  expect(spy).not.toHaveBeenCalled();
  });

  it('considera el valor original al modificar', () => {
    component.esModificacion = true;
    component.entregaModificar = { idEntrega: 1, cantidad: 2, tipoUnidad: TipoUnidad.CANTIDAD } as any;
    component.entregable = {
      cantidad: 5,
      cantidadPendienteAsignar: 1,
      tipoUnidad: TipoUnidad.CANTIDAD
    } as any;
    component.ngOnInit();
    component.form.patchValue({ fechaComprometida: '2020-01-01', estado: 'entregado', cantidadPorcentaje: { tipo: TipoUnidad.CANTIDAD, valor: 4 } });
    component.form.get('cantidadPorcentaje')?.markAsTouched();
    component.form.get('cantidadPorcentaje')?.updateValueAndValidity();
    expect(component.form.get('cantidadPorcentaje')?.errors?.['excedePendienteCantidad']).toBeTruthy();
  });

  it('debe filtrar documentos eliminados', () => {
    const docs = [{ id: 1 }, { id: 2, eliminado: true }] as any;
    component.documentos = docs;
    const resultado = component.obtenerDocumentosAMostrar();
    expect(resultado.length).toBe(1);
    expect(resultado[0].id).toBe(1);
  });

  it('eliminarDocumento debe quitar un documento nuevo', () => {
    const doc = { id: -1 } as any;
    component.documentos = [doc];
    mockDocumentosUtilService.eliminarDocumento.and.returnValue([]);
    component.eliminarDocumento(doc);
    expect(component.documentos.length).toBe(0);
  });

  it('descargarDocumento descarga un archivo modificado', () => {
    component.entregaModificar = { idEntrega: 5 } as any;
    const doc = { id: -1, modificado: true } as any;
    component.descargarDocumento(doc);
    expect(mockDocumentosUtilService.descargarDocumento).toHaveBeenCalledWith(doc,5);
  });

  it('descargarDocumento obtiene y descarga un archivo existente', () => {
    component.entregaModificar = { idEntrega: 5 } as any;
    const doc = { id: 3 } as any;
   
    component.descargarDocumento(doc);
    expect(mockDocumentosUtilService.descargarDocumento).toHaveBeenCalledWith(doc,5);
  });

  it('obtenerCantidadEntregasPendientes retorna las no aceptadas', () => {
    const entregable = { entregas: [{ cantidad: 1, cantidadRecepcionAceptada: 1 }, { cantidad: 1, cantidadRecepcionAceptada: 0 }] } as any;
    const res = component.obtenerCantidadEntregasPendientes(entregable);
    expect(res).toBe(1);
  });

  it('porcentajeHabilitado es verdadero cuando total es uno y no hay entregas', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { cantidad: 1 } as any;
    component.entregasExistentes = [];
    component.esModificacion = false;
    expect(component.porcentajeHabilitado).toBeTrue();
  });

  it('porcentajeHabilitado es falso cuando total mayor a uno sin entregable', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { cantidad: 2 } as any;
    component.entregasExistentes = [];
    expect(component.porcentajeHabilitado).toBeFalse();
  });

  it('porcentajeHabilitado usa el tipo del entregable en modificación', () => {
    component.esModificacion = true;
    component.entregable = { tipoUnidadEntregas: TipoUnidad.PORCENTAJE, cantidad: 2 } as any;
    expect(component.porcentajeHabilitado).toBeTrue();
  });

  it('cantidadHabilitada es verdadera cuando total es uno y no hay entregas', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { cantidad: 1, tipoUnidad: TipoUnidad.CANTIDAD } as any;
    component.entregasExistentes = [];
    component.esModificacion = false;
    expect(component.cantidadHabilitada).toBeTrue();
  });

  it('cantidadHabilitada retorna false cuando hay entregas y la unidad no es cantidad', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { cantidad: 2, tipoUnidad: TipoUnidad.PORCENTAJE } as any;
    component.entregasExistentes = [{} as any];
    expect(component.cantidadHabilitada).toBeFalse();
  });

  it('cantidadHabilitada depende del tipo en modificación', () => {
    component.esModificacion = true;
    component.entregable = { tipoUnidadEntregas: TipoUnidad.CANTIDAD, cantidad: 2 } as any;
    component.entregasExistentes = [];
    expect(component.cantidadHabilitada).toBeTrue();
  });

  it('esTipoUnidadPorcentaje reconoce el tipo del entregable', () => {
    component.entregable = { tipoUnidadEntregas: TipoUnidad.PORCENTAJE } as any;
    expect(component.esTipoUnidadPorcentaje()).toBeTrue();
  });

  it('esTipoUnidadCantidad usa la unidad del ítem cuando no hay entregable', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { tipoUnidad: TipoUnidad.CANTIDAD } as any;
    expect(component.esTipoUnidadCantidad()).toBeTrue();
  });

  it('esTipoUnidadPorcentaje retorna false cuando no hay entregable', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { tipoUnidad: TipoUnidad.CANTIDAD } as any;
    expect(component.esTipoUnidadPorcentaje()).toBeFalse();
  });

  it('validarCantidad marca error cuando porcentaje sin pendiente es menor a 1', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = {} as any;
    const control = { value: { tipo: TipoUnidad.PORCENTAJE, valor: 0 }, markAsTouched: () => {} } as any;
    const res = (component as any).validarCantidad(control);
    expect(res?.porcentajeRango).toBeTrue();
  });

  it('validarCantidad marca error cuando porcentaje sin pendiente excede 100', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = {} as any;
    const control = { value: { tipo: TipoUnidad.PORCENTAJE, valor: 101 }, markAsTouched: () => {} } as any;
    const res = (component as any).validarCantidad(control);
    expect(res?.excedePendientePorcentaje).toBeTrue();
  });

  it('validarCantidad requiere valor para cantidad', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { cantidad: 1 } as any;
    const control = { value: { tipo: TipoUnidad.CANTIDAD, valor: null } } as any;
    const res = (component as any).validarCantidad(control);
    expect(res?.cantidadRequerida).toBeTrue();
  });

  it('validarCantidad exige valor igual a uno cuando total es uno', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { cantidad: 1 } as any;
    const control = { value: { tipo: TipoUnidad.CANTIDAD, valor: 2 } } as any;
    const res = (component as any).validarCantidad(control);
    expect(res?.cantidadDebeSerUno).toBeTrue();
  });

  it('validarCantidad controla excedente cuando total es mayor a uno', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { cantidad: 5, cantidadPendienteAsignar: 3 } as any;
    const control = { value: { tipo: TipoUnidad.CANTIDAD, valor: 4 } } as any;
    const res = (component as any).validarCantidad(control);
    expect(res?.excedePendienteCantidad).toBeTrue();
  });

  it('fechaMinima devuelve la fecha de la orden de compra', () => {
    component.ordenCompra = { fechaOC: '2024-03-01' } as any;
    expect(component.fechaMinima).toBe('2024-03-01');
  });

  it('fechaMaxima utiliza la fecha del entregable', () => {
    component.entregable = { fechaComprometida: '2024-04-05' } as any;
    expect(component.fechaMaxima).toBe('2024-04-05');
  });

  it('cantidadFijaEnCantidad retorna uno cuando el total es uno', () => {
    component.entregable = undefined as any;
    component.itemOrdenCompra = { cantidad: 1 } as any;
    expect(component.cantidadFijaEnCantidad).toBe(1);
  });


});
