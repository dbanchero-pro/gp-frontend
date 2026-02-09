import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarSeccionComponent } from './agregar-modificar-seccion.component';

describe('AgregarModificarSeccionComponent', () => {
  let component: AgregarModificarSeccionComponent;
  let fixture: ComponentFixture<AgregarModificarSeccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarModificarSeccionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarModificarSeccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
