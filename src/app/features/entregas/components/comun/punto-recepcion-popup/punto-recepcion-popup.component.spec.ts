import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { PuntoRecepcionPopupComponent } from './punto-recepcion-popup.component';

class ModalServiceStub {
  show = jasmine.createSpy('show').and.callFake(() => {
    const ref = new BsModalRef();
    ref.content = {};
    return ref;
  });
  hide = jasmine.createSpy('hide')
}

describe('PuntoRecepcionPopupComponent', () => {
  
  let component: PuntoRecepcionPopupComponent;
  let fixture: ComponentFixture<PuntoRecepcionPopupComponent>;
  let modalRef: BsModalRef = new ModalServiceStub() as any;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PuntoRecepcionPopupComponent],
      providers: [
        { provide: BsModalRef, useValue: modalRef },
        { provide: BsModalService, useClass: ModalServiceStub },
        { provide: ActualizarService, useValue: { capturarErrores: true } }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(PuntoRecepcionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener título por defecto', () => {
    expect(component.titulo).toBe('Detalle del punto de recepción');
  });

  it('debería permitir cambiar el título', () => {
    component.titulo = 'Nuevo título';
    expect(component.titulo).toBe('Nuevo título');
  });

});
