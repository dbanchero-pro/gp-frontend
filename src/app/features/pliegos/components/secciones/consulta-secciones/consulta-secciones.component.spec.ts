import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaSeccionesComponent } from './consulta-secciones.component';

describe('ConsultaSeccionesComponent', () => {
  let component: ConsultaSeccionesComponent;
  let fixture: ComponentFixture<ConsultaSeccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaSeccionesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaSeccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
