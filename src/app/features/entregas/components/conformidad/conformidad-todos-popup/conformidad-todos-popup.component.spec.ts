import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { EntregaService } from '../../../services/entrega.service';
import { ConformidadTodosPopupComponent } from './conformidad-todos-popup.component';

describe('RecepcionTodosPopupComponent', () => {
  let component: ConformidadTodosPopupComponent;
  let fixture: ComponentFixture<ConformidadTodosPopupComponent>;
  let archivoService: any;

  beforeEach(async () => {
    archivoService = { descargar: jasmine.createSpy('descargar') };
    await TestBed.configureTestingModule({
      declarations: [ConformidadTodosPopupComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: BsModalService, useValue: { show: () => ({ content: {} as BsModalRef }), hide: () => {} } },
        { provide: ArchivoService, useValue: archivoService },
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

    fixture = TestBed.createComponent(ConformidadTodosPopupComponent);
    component = fixture.componentInstance;
 
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('deberia marcar el formulario cuando se intenta guardar sin datos obligatorios', () => {
    component.form.get('aceptaOperacion')?.setValue(false);
    component.form.get('motivo')?.setValue('');
    const emitirSpy = spyOn(component.guardarEvento, 'emit');

    component.guardar();

    expect(component.form.invalid).toBeTrue();
    expect(component.form.get('motivo')?.errors?.['required']).toBeTrue();
    expect(emitirSpy).not.toHaveBeenCalled();
  });

  it('deberia emitir la conformidad para los items seleccionados', () => {
    const fecha = component.form.get('fechaOperacion')?.value;
    component.itemsOrdenCompra = [{ idItem: 1 } as any];
    component.entregas = null as any;
    component.documentos = [{ id: 99 } as any];
    component.form.setValue({
      fechaOperacion: fecha,
      aceptaOperacion: true,
      motivo: '',
      tipoObservacion: null,
      observacion: ''
    });

    const emitirSpy = spyOn(component.guardarEvento, 'emit');

    component.guardar();

    expect(emitirSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      items: component.itemsOrdenCompra,
      aceptaConformidad: true,
      motivo: '',
      documentos: component.documentos
    }));
  });

  it('deberia emitir la conformidad para las entregas cuando no hay items', () => {
    const fecha = component.form.get('fechaOperacion')?.value;
    component.itemsOrdenCompra = null;
    component.entregas = [{ idEntrega: 5 } as any];
    component.documentos = [];
    component.form.setValue({
      fechaOperacion: fecha,
      aceptaOperacion: false,
      motivo: 'Faltan piezas',
      tipoObservacion: null,
      observacion: ''
    });

    const emitirSpy = spyOn(component.guardarEvento, 'emit');

    component.guardar();

    expect(emitirSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      entregas: component.entregas,
      aceptaConformidad: false,
      motivo: 'Faltan piezas'
    }));
  });

  it('deberia exigir observacion cuando se selecciona un tipo de observacion', () => {
    component.form.get('tipoObservacion')?.setValue(component.tiposObservacion[0]);
    component.form.get('observacion')?.setValue('');
    component.form.get('observacion')?.updateValueAndValidity();

    expect(component.form.get('observacion')?.errors?.['required']).toBeTrue();

    component.form.get('observacion')?.setValue('Detalle agregado');
    component.form.get('observacion')?.updateValueAndValidity();

    expect(component.form.get('observacion')?.errors).toBeNull();
  });

});
