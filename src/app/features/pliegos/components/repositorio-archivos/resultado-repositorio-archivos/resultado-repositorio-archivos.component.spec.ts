import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResultadoRepositorioArchivosComponent } from './resultado-repositorio-archivos.component';

describe('ResultadoRepositorioArchivosComponent', () => {
  let component: ResultadoRepositorioArchivosComponent;
  let fixture: ComponentFixture<ResultadoRepositorioArchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResultadoRepositorioArchivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResultadoRepositorioArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
