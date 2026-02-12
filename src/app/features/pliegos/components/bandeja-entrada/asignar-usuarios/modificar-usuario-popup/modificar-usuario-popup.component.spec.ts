import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModificarUsuarioPopupComponent } from './modificar-usuario-popup.component';

describe('ModificarUsuarioPopupComponent', () => {
  let component: ModificarUsuarioPopupComponent;
  let fixture: ComponentFixture<ModificarUsuarioPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModificarUsuarioPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModificarUsuarioPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
