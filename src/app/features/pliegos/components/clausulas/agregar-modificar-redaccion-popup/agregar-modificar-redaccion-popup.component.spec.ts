import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarRedaccionPopupComponent } from './agregar-modificar-redaccion-popup.component';

describe('AgregarModificarRedaccionPopupComponent', () => {
  let component: AgregarModificarRedaccionPopupComponent;
  let fixture: ComponentFixture<AgregarModificarRedaccionPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarModificarRedaccionPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarRedaccionPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
