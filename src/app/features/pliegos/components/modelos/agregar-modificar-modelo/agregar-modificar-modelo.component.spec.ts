import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarModeloComponent } from './agregar-modificar-modelo.component';

describe('AgregarModificarModeloComponent', () => {
  let component: AgregarModificarModeloComponent;
  let fixture: ComponentFixture<AgregarModificarModeloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarModificarModeloComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarModificarModeloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
