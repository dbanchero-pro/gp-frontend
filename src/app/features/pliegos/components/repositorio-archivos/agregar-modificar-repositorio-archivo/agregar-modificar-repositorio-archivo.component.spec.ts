import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarModificarRepositorioArchivoComponent } from './agregar-modificar-repositorio-archivo.component';

describe('AgregarModificarRepositorioArchivoComponent', () => {
  let component: AgregarModificarRepositorioArchivoComponent;
  let fixture: ComponentFixture<AgregarModificarRepositorioArchivoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarRepositorioArchivoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgregarModificarRepositorioArchivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
