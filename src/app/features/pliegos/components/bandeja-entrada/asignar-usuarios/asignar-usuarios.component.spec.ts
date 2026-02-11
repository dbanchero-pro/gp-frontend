import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignarUsuariosComponent } from './asignar-usuarios.component';

describe('AsignarUsuariosComponent', () => {
  let component: AsignarUsuariosComponent;
  let fixture: ComponentFixture<AsignarUsuariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AsignarUsuariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignarUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
