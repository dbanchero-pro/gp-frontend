import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarUsuarioPopupComponent } from './agregar-usuario-popup.component';

describe('AgregarUsuarioPopupComponent', () => {
  let component: AgregarUsuarioPopupComponent;
  let fixture: ComponentFixture<AgregarUsuarioPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarUsuarioPopupComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AgregarUsuarioPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
