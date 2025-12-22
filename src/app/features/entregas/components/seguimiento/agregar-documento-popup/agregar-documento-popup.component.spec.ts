import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AppConfig } from 'src/app/app.config';
import { AgregarDocumentoPopupComponent } from './agregar-documento-popup.component';

class MockModalRef {
  hide = jasmine.createSpy('hide');
}

describe('AgregarDocumentoPopupComponent', () => {
  let component: AgregarDocumentoPopupComponent;
  let fixture: ComponentFixture<AgregarDocumentoPopupComponent>;
  let modal: MockModalRef;

  beforeEach(async () => {
    modal = new MockModalRef();
    await TestBed.configureTestingModule({
      declarations: [AgregarDocumentoPopupComponent],
      imports: [ReactiveFormsModule],
      providers: [FormBuilder, { provide: BsModalRef, useValue: modal },
        BsModalService
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarDocumentoPopupComponent);
    component = fixture.componentInstance;
    AppConfig.settings = {
      apiCargaMasivaUrl: '',
      apiUrl: '',
      keycloak: { url: '', realm: '', clientId: '' },
      extensionesPermitidas: '.pdf,.txt',
      urlBaseFrontEnd: '',
      loggingLevel: 0 as any,
      archivosTamanoMaxBytes: 1048576,
      archivosCantidadMax: 10
    } as any;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });


  it('debe emitir documento si el formulario es válido', () => {
    const spy = jasmine.createSpy('emit');
    spyOn(component, 'cerrarPopup');
    component.documentoAgregado.subscribe(spy);
    component.form.patchValue({ archivo: 'a', nombre: 'a' });
    component.aceptar();
    expect(spy).toHaveBeenCalled();
    expect(component.cerrarPopup).toHaveBeenCalled();
  });

  it('no emite si el formulario es inválido', () => {
    const spy = jasmine.createSpy('emit');
    spyOn(component, 'cerrarPopup');
    component.documentoAgregado.subscribe(spy);
    component.aceptar();
    expect(spy).not.toHaveBeenCalled();
    expect(component.cerrarPopup).not.toHaveBeenCalled();
  });

  it('deberia completar el nombre cuando el campo esta vacio', () => {
    spyOn<any>(component, 'onArchivoSeleccionadoInterno').and.callFake((_event: any, accion: (nombre: string) => void) => accion('reporte.pdf'));
    component.form.patchValue({ archivo: '', nombre: '' });

    component.onArchivoSeleccionado({ target: { value: 'ruta/reporte.pdf' } });

    expect(component.form.get('archivo')?.value).toBe('ruta/reporte.pdf');
    expect(component.form.get('nombre')?.value).toBe('reporte.pdf');
  });

  it('deberia respetar el nombre indicado por el usuario al seleccionar archivo', () => {
    spyOn<any>(component, 'onArchivoSeleccionadoInterno').and.callFake((_event: any, accion: (nombre: string) => void) => accion('adjunto.docx'));
    component.form.patchValue({ archivo: '', nombre: 'Manual interno' });

    component.onArchivoSeleccionado({ target: { value: 'otra/adjunto.docx' } });

    expect(component.form.get('archivo')?.value).toBe('otra/adjunto.docx');
    expect(component.form.get('nombre')?.value).toBe('Manual interno');
  });
});
