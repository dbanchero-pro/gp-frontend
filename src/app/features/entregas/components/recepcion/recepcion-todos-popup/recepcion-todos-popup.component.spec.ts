import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { EntregaService } from '../../../services/entrega.service';
import { RecepcionTodosPopupComponent } from './recepcion-todos-popup.component';

describe('RecepcionTodosPopupComponent', () => {
  let component: RecepcionTodosPopupComponent;
  let fixture: ComponentFixture<RecepcionTodosPopupComponent>;
  let archivoService: any;

  beforeEach(async () => {
    archivoService = { descargar: jasmine.createSpy('descargar') };
    await TestBed.configureTestingModule({
      declarations: [RecepcionTodosPopupComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: BsModalService, useValue: { show: () => ({ content: {} as BsModalRef }), hide: () => {} } },
        { provide: ArchivoService, useValue: archivoService },
        DocumentosUtilService,
        { provide: EntregaService, useValue: { recepcionarItemsSeleccionados: () => of([]) } },
        { provide: ActualizarService, useValue: { popups: [], capturarErrores: true } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    AppConfig.settings = {
      apiCargaMasivaUrl: '',
      apiUrl: '',
      keycloak: { url: '', realm: '', clientId: '' },
      extensionesPermitidas: '',
      urlBaseFrontEnd: '',
      loggingLevel: 0 as any,
      archivosTamanoMaxBytes: 0,
      archivosCantidadMax: 10
    } as any;

    fixture = TestBed.createComponent(RecepcionTodosPopupComponent);
    component = fixture.componentInstance;
    component.ordenCompra = { fechaOC: '2020-01-01' } as any;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('guardar emite datos de items seleccionados', () => {
    const spy = jasmine.createSpy('emit');
    component.guardarEvento.subscribe(spy);
    component.itemsOrdenCompra = [{ idItem: 1 } as any];
    component.form.patchValue({
      fechaOperacion: component.fechaMaxima,
      aceptaOperacion: true,
      motivo: ''
    });
    component.guardar();
    expect(spy).toHaveBeenCalled();
    const req = spy.calls.mostRecent().args[0];
    expect(req.items.length).toBe(1);
  });

  it('guardar emite datos de entregas seleccionadas', () => {
    const spy = jasmine.createSpy('emit');
    component.guardarEvento.subscribe(spy);
    component.itemsOrdenCompra = null;
    component.entregas = [{ idEntrega: 1 } as any];
    component.form.patchValue({
      fechaOperacion: component.fechaMaxima,
      aceptaOperacion: true,
      motivo: ''
    });
    component.guardar();
    expect(spy).toHaveBeenCalled();
    const req = spy.calls.mostRecent().args[0];
    expect(req.entregas.length).toBe(1);
  });

  it('guardar no emite cuando el formulario es inválido', () => {
    const spy = jasmine.createSpy('emit');
    component.guardarEvento.subscribe(spy);
    component.form.patchValue({ fechaOperacion: '', aceptaOperacion: true });
    component.guardar();
    expect(spy).not.toHaveBeenCalled();
  });

  it('eliminarDocumento elimina y marca correctamente', () => {
    const nuevo = { id: -1 } as any;
    const existente = { id: 2 } as any;
    component.documentos = [nuevo, existente];
    (component as any).eliminarDocumento(nuevo);
    expect(component.documentos.length).toBe(1);
    (component as any).eliminarDocumento(existente);
    expect(component.documentos[0].eliminado).toBeTrue();
    expect(component.documentos[0].modificado).toBeTrue();
  });
  
  it('getDocumentDate retorna fecha del documento o actual', () => {
    component.documentos = [{ fecha: '2020-01-02' }, {}] as any;
    expect((component as any).getDocumentDate(0).getFullYear()).toBe(2020);
    const now = new Date().getFullYear();
    expect((component as any).getDocumentDate(1).getFullYear()).toBe(now);
  });

  it('getCantidad retorna 100 de 100 para porcentajes sin datos', () => {
    const ent = { tipoUnidad: TipoUnidad.PORCENTAJE } as any;
    expect(component.getCantidad(ent)).toBe('100 de 100');
  });

  it('motivo es requerido cuando no se acepta la recepción', () => {
    component.form.patchValue({ aceptaOperacion: false, motivo: '' });
    component.form.get('motivo')?.updateValueAndValidity();
    expect(component.form.get('motivo')?.valid).toBeFalse();
  });

  it('fechaOperacion fuera de rango produce error', () => {
    const min = component.fechaMinima;
    const date = new Date(min);
    date.setDate(date.getDate() - 1);
    component.form.patchValue({ fechaOperacion: date.toISOString().split('T')[0] });
    expect(component.form.get('fechaOperacion')?.valid).toBeFalse();
  });

  it('descargarDocumento descarga documentos modificados', () => {
    const doc = { id: -1, modificado: true } as any;
    (component as any).descargarDocumento(doc);
    expect(archivoService.descargar).toHaveBeenCalledWith(doc);
  });

  it('descargarDocumento usa el id de la entrega cuando corresponde', () => {
    const doc = { id: 5 } as any;
    const util = TestBed.inject(DocumentosUtilService);
    const spy = spyOn(util, 'descargarDocumento');
    component.entregas = [{ idEntrega: 7 } as any];
    (component as any).descargarDocumento(doc);
    expect(spy).toHaveBeenCalledWith(doc, 7);
  });

  it('getUnidad retorna cadena vacía si la unidad es vacía', () => {
    const ent = { itemOrdenCompra: {}, cantidad: 1 } as any;
    expect(component.getUnidad(ent)).toBe('');
  });

  it('getUnidad retorna cadena vacía si no hay tipo de unidad', () => {
    const ent = { itemOrdenCompra: { descUnidadMedida: 'kg' }, cantidad: 2 } as any;
    expect(component.getUnidad(ent)).toBe('');
  });

  it('getUnidad retorna la unidad formateada', () => {
    const ent = { itemOrdenCompra: { descUnidadMedida: 'kg' }, cantidad: 2, tipoUnidadEntregas: TipoUnidad.CANTIDAD } as any;
    expect(component.getUnidad(ent)).toBe(' (kg)');
  });

  it('getCantidad calcula cantidades pendientes', () => {
    const ent = { cantidadPendienteAsignar: 3, cantidadTotalMostrar: 5 } as any;
    expect(component.getCantidad(ent)).toBe('3 de 5');
  });

  it('fechaOperacion mayor a máxima produce error', () => {
    const date = new Date(component.fechaMaxima);
    date.setDate(date.getDate() + 1);
    component.form.patchValue({ fechaOperacion: date.toISOString().split('T')[0] });
    expect(component.form.get('fechaOperacion')?.valid).toBeFalse();
  });
});
