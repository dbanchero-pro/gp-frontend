import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaCamposReglasComponent } from './consulta-campos-reglas.component';

describe('ConsultaCamposReglasComponent', () => {
  let component: ConsultaCamposReglasComponent;
  let fixture: ComponentFixture<ConsultaCamposReglasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultaCamposReglasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaCamposReglasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
