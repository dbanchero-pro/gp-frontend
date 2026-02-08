import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarRedaccionComponent } from './agregar-modificar-redaccion.component';

describe('AgregarModificarRedaccionComponent', () => {
  let component: AgregarModificarRedaccionComponent;
  let fixture: ComponentFixture<AgregarModificarRedaccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarRedaccionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarRedaccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
