import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarArchivoRepositorioComponent } from './agregar-modificar-archivo-repositorio.component';

describe('AgregarModificarArchivoRepositorioComponent', () => {
  let component: AgregarModificarArchivoRepositorioComponent;
  let fixture: ComponentFixture<AgregarModificarArchivoRepositorioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarArchivoRepositorioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarArchivoRepositorioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
