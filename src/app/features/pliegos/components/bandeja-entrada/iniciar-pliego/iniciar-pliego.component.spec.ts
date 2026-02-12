import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IniciarPliegoComponent } from './iniciar-pliego.component';

describe('IniciarPliegoComponent', () => {
  let component: IniciarPliegoComponent;
  let fixture: ComponentFixture<IniciarPliegoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IniciarPliegoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IniciarPliegoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
