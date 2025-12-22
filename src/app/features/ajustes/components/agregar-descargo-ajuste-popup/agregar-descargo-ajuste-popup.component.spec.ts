import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { ItemOrdenCompraService } from 'src/app/features/entregas/services/item-orden-compra.service';
import { AjusteService } from '../../services/ajuste.service';
import { AgregarDescargoAjustePopupComponent } from './agregar-descargo-ajuste-popup.component';

class MockModalRef {
  hide = jasmine.createSpy('hide');
}

describe('AgregarDescargoPopupComponent', () => {
  let component: AgregarDescargoAjustePopupComponent;
  let fixture: ComponentFixture<AgregarDescargoAjustePopupComponent>;
  let modal: MockModalRef;
  let ajusteService: jasmine.SpyObj<AjusteService>;
  let itemOrdenCompraService: jasmine.SpyObj<ItemOrdenCompraService>;

  beforeEach(async () => {
    modal = new MockModalRef();
    ajusteService = jasmine.createSpyObj('AjusteService', ['agregarDescargo']);
    itemOrdenCompraService = jasmine.createSpyObj('ItemOrdenCompraService', ['itemOrdenCompraService']);
    
    ajusteService.agregarDescargo.and.returnValue(of({} as any));

    await TestBed.configureTestingModule({
      declarations: [AgregarDescargoAjustePopupComponent],
      imports: [ReactiveFormsModule],
      providers: [FormBuilder, { provide: BsModalRef, useValue: modal },
        BsModalService,
        { provide: AjusteService, useValue: ajusteService },
        { provide: ItemOrdenCompraService, useValue: itemOrdenCompraService },
      
      ],
      schemas: [NO_ERRORS_SCHEMA]

    }).compileComponents();
   
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarDescargoAjustePopupComponent);
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
    component.ajuste = {idAjuste: 1} as any;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe emitir documento si el formulario es válido', () => {
    const spy = jasmine.createSpy('emit');
    spyOn(component, 'cerrarPopup');
    
    ajusteService.agregarDescargo.and.returnValue(of({}));
    component.descargoAgregado.subscribe(spy);
    
    component.ajuste = {idAjuste: 1}
    component.form.patchValue(  { comentario: '123',archivo: 'a', nombre: 'a' } );
    component.guardar();
    expect(spy).toHaveBeenCalled();
    expect(component.cerrarPopup).toHaveBeenCalled();
  });

  it('no emite si el formulario es inválido', () => {
    const spy = jasmine.createSpy('emit');
    spyOn(component, 'cerrarPopup');
    component.descargoAgregado.subscribe(spy);
    component.guardar();
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
