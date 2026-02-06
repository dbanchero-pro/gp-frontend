import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaClausulasComponent } from './consulta-clausulas.component';

describe('ConsultaClausulasComponent', () => {
  let component: ConsultaClausulasComponent;
  let fixture: ComponentFixture<ConsultaClausulasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultaClausulasComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ConsultaClausulasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
