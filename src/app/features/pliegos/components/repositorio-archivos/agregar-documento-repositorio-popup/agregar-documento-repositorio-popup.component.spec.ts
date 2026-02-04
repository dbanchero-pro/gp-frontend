import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarDocumentoRepositorioPopupComponent } from './agregar-documento-repositorio-popup.component';

describe('AgregarDocumentoRepositorioPopupComponent', () => {
  let component: AgregarDocumentoRepositorioPopupComponent;
  let fixture: ComponentFixture<AgregarDocumentoRepositorioPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarDocumentoRepositorioPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarDocumentoRepositorioPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
