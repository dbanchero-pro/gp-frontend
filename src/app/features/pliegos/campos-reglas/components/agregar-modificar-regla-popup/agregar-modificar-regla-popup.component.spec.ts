import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarReglaPopupComponent } from './agregar-modificar-regla-popup.component';

describe('AgregarModificarReglaPopupComponent', () => {
  let component: AgregarModificarReglaPopupComponent;
  let fixture: ComponentFixture<AgregarModificarReglaPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarReglaPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarReglaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
