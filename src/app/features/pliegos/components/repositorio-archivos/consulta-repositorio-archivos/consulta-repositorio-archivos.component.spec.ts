import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaRepositorioArchivosComponent } from './consulta-repositorio-archivos.component';

describe('ConsultaRepositorioArchivosComponent', () => {
  let component: ConsultaRepositorioArchivosComponent;
  let fixture: ComponentFixture<ConsultaRepositorioArchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConsultaRepositorioArchivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaRepositorioArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
