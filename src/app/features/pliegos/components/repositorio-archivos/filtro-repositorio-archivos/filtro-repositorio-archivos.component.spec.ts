import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FiltroRepositorioArchivosComponent } from './filtro-repositorio-archivos.component';

describe('FiltroRepositorioArchivosComponent', () => {
  let component: FiltroRepositorioArchivosComponent;
  let fixture: ComponentFixture<FiltroRepositorioArchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltroRepositorioArchivosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltroRepositorioArchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
