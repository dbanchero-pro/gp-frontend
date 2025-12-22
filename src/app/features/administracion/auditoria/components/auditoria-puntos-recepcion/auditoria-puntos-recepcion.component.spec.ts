import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { AuditoriaPuntosRecepcionComponent } from './auditoria-puntos-recepcion.component';

const mockHttpClient = {
  get: jasmine.createSpy('get').and.returnValue(of({})),
  post: jasmine.createSpy('post').and.returnValue(of({})),
  put: jasmine.createSpy('put').and.returnValue(of({})),
  delete: jasmine.createSpy('delete').and.returnValue(of({}))
};

describe('AuditoriaPuntosRecepcionComponent', () => {
  let component: AuditoriaPuntosRecepcionComponent;
  let fixture: ComponentFixture<AuditoriaPuntosRecepcionComponent>;
  let routerEvents$: any;
  let actualizarSpy: jasmine.SpyObj<ActualizarService>;

  beforeEach(async () => {
    routerEvents$ = of(new NavigationEnd(1, 'a', 'b'));
    actualizarSpy = jasmine.createSpyObj('ActualizarService', ['subTitulo', 'titulo']);
    TestBed.configureTestingModule({
      declarations: [AuditoriaPuntosRecepcionComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: ActualizarService, useValue: actualizarSpy },
        { provide: Router, useValue: { events: routerEvents$ } },
        { provide: BsModalService, useValue: {} },
        { provide: BsModalRef, useValue: {} },
        { provide: HttpClient, useValue: mockHttpClient }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(AuditoriaPuntosRecepcionComponent, { set: { template: '' } });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(AuditoriaPuntosRecepcionComponent);
    component = fixture.componentInstance; 
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('aplicarColapso alterna columnas', () => {
    component.colFiltro = 'col-lg-3';
    component.colTabla = 'col-lg-9';
    component.aplicarColapso();
    expect(component.colFiltro).toBe('col-lg-1');
    expect(component.colTabla).toBe('col-lg-11');
    component.aplicarColapso();
    expect(component.colFiltro).toBe('col-lg-3');
    expect(component.colTabla).toBe('col-lg-9');
  });

  it('onFiltroOrganismo actualiza filtroBase', () => {
    component.onFiltroOrganismo({ id: 5 });
    expect(component.form.get('filtroBase')?.value).toEqual({ id: 5 });
  });

  it('filtrar ejecuta sin errores cuando es válido', () => {
    component.buscar();
    expect(component.form.valid).toBeTrue();
  });


  it('actualizarFiltro compone parámetros', () => {
    component.form.patchValue({
      tipoOperacion: 'Alta',
      nombre: 'DIR',
      usuario: '123',
      rangoFechas: { fechaDesde: '2024-06-25', fechaHasta: '' }
    });
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual(jasmine.objectContaining({
      tipoOperacion: 'Alta',
      nombre: 'DIR',
      usuario: 'uy-ci-123',
      fechaDesde: '2024-06-25'
    }));
    expect(component.parametros.pagina).toBe(0);
  });

  it('nuevaConsulta limpia formularios y reinicia página', () => {
    component.form.patchValue({ nombrePunto: 'DIR' });
    component.parametros.pagina = 3;
    component.nuevaConsulta();
    expect(component.form.get('nombre')?.value).toBeNull();
    expect(component.parametros.pagina).toBe(0);
  });

});
