import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { PaisService } from 'src/app/shared/services/usuario/pais.service';
import { TipoDocumentoProveedorService } from 'src/app/shared/services/usuario/tipo-documento-proveedor.service';
import { TipoDocumentoUsuarioService } from 'src/app/shared/services/usuario/tipo-documento-usuario.service';
import { AuditoriaUsuarioProveedorService } from '../../services/auditoria-usuario-proveedor.service';
import { AuditoriaUsuarioProveedorComponent } from './auditoria-usuario-proveedor.component';

const mockHttpClient = {
  get: jasmine.createSpy('get').and.returnValue(of({})),
};

describe('AuditoriaUsuarioProveedorComponent', () => {
  let component: AuditoriaUsuarioProveedorComponent;
  let fixture: ComponentFixture<AuditoriaUsuarioProveedorComponent>;
  let routerEvents$: any;
  let auditoriaSpy: jasmine.SpyObj<AuditoriaUsuarioProveedorService>;
  let paisSpy: jasmine.SpyObj<PaisService>;
  let docUsuarioSpy: jasmine.SpyObj<TipoDocumentoUsuarioService>;
  let docProveedorSpy: jasmine.SpyObj<TipoDocumentoProveedorService>;
  let seguridadSpy: jasmine.SpyObj<SeguridadService>;

  beforeEach(async () => {
    routerEvents$ = of(new NavigationEnd(1, 'a', 'b'));
    auditoriaSpy = jasmine.createSpyObj('AuditoriaUsuarioProveedorService', ['getPageable']);
    paisSpy = jasmine.createSpyObj('PaisService', ['obtenerTodos']);
    docUsuarioSpy = jasmine.createSpyObj('TipoDocumentoUsuarioService', ['obtenerTiposDocumentoUsuario']);
    docProveedorSpy = jasmine.createSpyObj('TipoDocumentoProveedorService', ['obtenerTiposDocumentoProveedor']);
    seguridadSpy = jasmine.createSpyObj('SeguridadService', ['obtenerTipoUsuario', 'tienePermiso', 'tieneAlgunPermiso', 'obtenerProveedores']);
    seguridadSpy.obtenerTipoUsuario.and.returnValue(TipoUsuario.PROVEEDOR);
    seguridadSpy.obtenerProveedores.and.returnValue([]);
    paisSpy.obtenerTodos.and.returnValue(of([]));
    docProveedorSpy.obtenerTiposDocumentoProveedor.and.returnValue(of({ content: [] } as any));

    auditoriaSpy.getPageable.and.returnValue(of({ content: [{}], page: { totalElements: 5 } } as any));
    await TestBed.configureTestingModule({
      declarations: [AuditoriaUsuarioProveedorComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: AuditoriaUsuarioProveedorService, useValue: auditoriaSpy },
        { provide: PaisService, useValue: paisSpy },
        { provide: TipoDocumentoUsuarioService, useValue: docUsuarioSpy },
        { provide: TipoDocumentoProveedorService, useValue: docProveedorSpy },
        { provide: SeguridadService, useValue: seguridadSpy },
        { provide: Router, useValue: { events: routerEvents$ } },
        { provide: BsModalService, useValue: {} },
        { provide: BsModalRef, useValue: {} },
        { provide: HttpClient, useValue: mockHttpClient }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    TestBed.overrideComponent(AuditoriaUsuarioProveedorComponent, { set: { template: '' } });
    fixture = TestBed.createComponent(AuditoriaUsuarioProveedorComponent);
    component = fixture.componentInstance;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('nuevaConsulta reinicia formulario', () => {
    
    component.form.patchValue({ nroDocUsuario: '123' });
    component.parametros.pagina = 2;
    component.nuevaConsulta();
    expect(component.form.get('nroDocUsuario')?.value).toBe('');
    expect(component.parametros.pagina).toBe(0);
  });

  it('cargarPaises asigna la lista recibida', () => {
    auditoriaSpy.getPageable.and.returnValue(of({ content: [{}], page: { totalElements: 5 } } as any));
   
    paisSpy.obtenerTodos.and.returnValue(of([{ id: Pais.URUGUAY } as any]));
    component.cargarPaises();
    expect(component.paises.length).toBe(1);
    expect(component.paises[0].id).toBe(Pais.URUGUAY);
  });

  it('cargarTiposDocumento utiliza el servicio solo si hay país', () => {
    component.cargarTiposDocumento();
    expect(docUsuarioSpy.obtenerTiposDocumentoUsuario).not.toHaveBeenCalled();
    component.form.get('paisDocUsuario')?.setValue(Pais.URUGUAY);
    docUsuarioSpy.obtenerTiposDocumentoUsuario.and.returnValue(of({ content: [{ idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD }] } as any));
    component.cargarTiposDocumento();
    expect(docUsuarioSpy.obtenerTiposDocumentoUsuario).toHaveBeenCalled();
    expect(component.tiposDocumento[0].idTipoDocumento).toBe(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
  });

  it('buscar obtiene auditorias y total', () => {
    auditoriaSpy.getPageable.and.returnValue(of({ content: [{}], page: { totalElements: 5 } } as any));
    component.buscar();
    expect(auditoriaSpy.getPageable).toHaveBeenCalled();
    expect(component.auditorias.length).toBe(1);
    expect(component.total).toBe(5);
  });

  it('actualizarFiltro compone objeto y reinicia página', () => {
    component.form.patchValue({
      tipoOperacion: 'ALTA',
      rangoFechas: { fechaDesde: '2024-06-01', fechaHasta: '2024-06-02' },
      paisDocUsuario: Pais.URUGUAY,
      tipoDocUsuario: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
      nroDocUsuario: '1',
    });
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual(jasmine.objectContaining({
      tipoOperacion: 'ALTA',
      fechaDesde: '2024-06-01',
      fechaHasta: '2024-06-02',
      paisDocumentoUsuario: Pais.URUGUAY,
      tipoDocumentoUsuario: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
      nroDocumentoUsuario: '1',
      tipoUsuario: TipoUsuario.PROVEEDOR
    }));
    expect(component.parametros.pagina).toBe(0);
  });

  it('cambioTipoDoc mantiene el valor', fakeAsync(() => {
    component.form.get('nroDocUsuario')?.setValue('5');
    component.cambioTipoDoc('nroDocUsuario');
    tick();
    expect(component.form.get('nroDocUsuario')?.value).toBe('5');
  }));
});
