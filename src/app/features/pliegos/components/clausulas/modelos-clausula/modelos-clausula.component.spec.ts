import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModelosClausulaComponent } from './modelos-clausula.component';

describe('ModelosClausulaComponent', () => {
  let component: ModelosClausulaComponent;
  let fixture: ComponentFixture<ModelosClausulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ModelosClausulaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ModelosClausulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
