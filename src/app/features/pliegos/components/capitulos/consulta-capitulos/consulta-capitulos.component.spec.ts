import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaCapitulosComponent } from './consulta-capitulos.component';

describe('ConsultaCapitulosComponent', () => {
  let component: ConsultaCapitulosComponent;
  let fixture: ComponentFixture<ConsultaCapitulosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultaCapitulosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultaCapitulosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
