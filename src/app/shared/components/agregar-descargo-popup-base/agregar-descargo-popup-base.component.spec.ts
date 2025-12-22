import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { ItemOrdenCompraService } from 'src/app/features/entregas/services/item-orden-compra.service';
import { AgregarDescargoPopupBaseComponent } from './agregar-descargo-popup-base.component';

class MockModalRef {
  hide = jasmine.createSpy('hide');
}
@Component({
  selector: 'app-test-popup',
  standalone: false,
  template: ''
})
class TestPopup extends AgregarDescargoPopupBaseComponent {
  
  constructor(protected override readonly fb: FormBuilder) { super(fb); }
  guardar: () => void = jasmine.createSpy('guardar');
}

describe('AgregarDescargoPopupBaseComponent', () => {
  let component: AgregarDescargoPopupBaseComponent;
  let fixture: ComponentFixture<AgregarDescargoPopupBaseComponent>;
  let modal: MockModalRef;
  let itemOrdenCompraService: jasmine.SpyObj<ItemOrdenCompraService>;

  beforeEach(async () => {
    modal = new MockModalRef();
    itemOrdenCompraService = jasmine.createSpyObj('ItemOrdenCompraService', ['itemOrdenCompraService']);
    

    await TestBed.configureTestingModule({
      declarations: [TestPopup],
      imports: [ReactiveFormsModule],
      providers: [FormBuilder, { provide: BsModalRef, useValue: modal },
        BsModalService,
        { provide: ItemOrdenCompraService, useValue: itemOrdenCompraService },
      
      ],
      schemas: [NO_ERRORS_SCHEMA]

    }).compileComponents();
   
  });

  beforeEach(() => {
    
    fixture = TestBed.createComponent(TestPopup);
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
    
    component.descargoAgregado.subscribe(spy);
    
    component.form.patchValue(  { comentario: '123',archivo: 'a', nombre: 'a' } );
    component.guardarInterno((dto: any) => of(dto),1);
    expect(spy).toHaveBeenCalled();
    expect(component.cerrarPopup).toHaveBeenCalled();
  });

  it('no emite si el formulario es inválido', () => {
    const spy = jasmine.createSpy('emit');
    spyOn(component, 'cerrarPopup');
    component.descargoAgregado.subscribe(spy);
    component.guardarInterno((dto: any) => of(dto),1);
    expect(spy).not.toHaveBeenCalled();
    expect(component.cerrarPopup).not.toHaveBeenCalled();
  });

  it('onArchivoSeleccionado actualiza el nombre y archivo cuando no hay nombre previo', () => {
    spyOn(component as any, 'onArchivoSeleccionadoInterno').and.callFake((_e: any, cb: any) => cb('archivo.txt'));
    const event = { target: { value: 'C/archivo.txt' } };
    component.onArchivoSeleccionado(event);
    expect(component.form.value).toEqual({ comentario: '', archivo: 'C/archivo.txt', nombre: 'archivo.txt' });
  });

  it('onArchivoSeleccionado mantiene el nombre existente si ya está informado', () => {
    component.form.patchValue({ nombre: 'existente' });
    spyOn(component as any, 'onArchivoSeleccionadoInterno').and.callFake((_e: any, cb: any) => cb('archivo.txt'));
    const event = { target: { value: 'C/archivo.txt' } };
    component.onArchivoSeleccionado(event);
    expect(component.form.value.nombre).toBe('existente');
    expect(component.form.value.archivo).toBe('C/archivo.txt');
  });
});
