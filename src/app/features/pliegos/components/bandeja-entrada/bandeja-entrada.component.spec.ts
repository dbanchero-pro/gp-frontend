import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { FechaHoraPipe } from 'src/app/shared/pipes/fecha-hora.pipe';
import { BandejaEntradaService } from '../../services/bandeja-entrada.service';
import { BandejaEntradaComponent } from './bandeja-entrada.component';

describe('BandejaEntradaComponent', () => {
  let component: BandejaEntradaComponent;
  let fixture: ComponentFixture<BandejaEntradaComponent>;

  const routerStub = {
    navigate: jasmine.createSpy('navigate')
  };
  const bsModalServiceStub = jasmine.createSpyObj('BsModalService', ['show']);
  bsModalServiceStub.show.and.returnValue({ content: {}, hide: jasmine.createSpy('hide'), onHide: of({}) });
  const bandejaEntradaServiceStub = jasmine.createSpyObj('BandejaEntradaService', ['buscarProcesos']);
  bandejaEntradaServiceStub.buscarProcesos.and.returnValue(of({ content: [], totalElements: 0 }));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BandejaEntradaComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerStub },
        { provide: BsModalService, useValue: bsModalServiceStub },
        { provide: BandejaEntradaService, useValue: bandejaEntradaServiceStub },
        FechaHoraPipe
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BandejaEntradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
});
