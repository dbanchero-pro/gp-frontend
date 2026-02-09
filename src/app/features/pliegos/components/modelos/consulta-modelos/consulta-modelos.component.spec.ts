import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaModelosComponent } from './consulta-modelos.component';

describe('ConsultaModelosComponent', () => {
  let component: ConsultaModelosComponent;
  let fixture: ComponentFixture<ConsultaModelosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaModelosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaModelosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
