import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarModificarCapituloComponent } from './agregar-modificar-capitulo.component';

describe('AgregarModificarCapituloComponent', () => {
  let component: AgregarModificarCapituloComponent;
  let fixture: ComponentFixture<AgregarModificarCapituloComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarModificarCapituloComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarModificarCapituloComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
