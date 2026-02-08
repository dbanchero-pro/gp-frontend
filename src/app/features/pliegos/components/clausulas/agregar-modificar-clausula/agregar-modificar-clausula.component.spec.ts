import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarClausulaComponent } from './agregar-modificar-clausula.component';

describe('AgregarModificarClausulaComponent', () => {
  let component: AgregarModificarClausulaComponent;
  let fixture: ComponentFixture<AgregarModificarClausulaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarModificarClausulaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarClausulaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
