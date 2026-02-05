import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarCampoPopupComponent } from './agregar-modificar-campo-popup.component';

describe('AgregarModificarCampoPopupComponent', () => {
  let component: AgregarModificarCampoPopupComponent;
  let fixture: ComponentFixture<AgregarModificarCampoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarCampoPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarCampoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
