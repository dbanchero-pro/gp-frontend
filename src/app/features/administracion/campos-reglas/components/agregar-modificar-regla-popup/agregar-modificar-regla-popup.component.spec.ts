import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AgregarModificarReglaPopupComponent } from './agregar-modificar-regla-popup.component';

describe('AgregarModificarReglaPopupComponent', () => {
  let component: AgregarModificarReglaPopupComponent;
  let fixture: ComponentFixture<AgregarModificarReglaPopupComponent>;

  const bsModalServiceStub = {
    show: jasmine.createSpy('show').and.returnValue({ content: {}, hide: jasmine.createSpy('hide') })
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarReglaPopupComponent],
      imports: [ReactiveFormsModule],
      providers: [{ provide: BsModalService, useValue: bsModalServiceStub }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarReglaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
