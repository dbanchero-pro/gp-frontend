import { HttpClient } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { AuditoriaUsuarioOrganismoPerfilComponent } from './auditoria-usuario-organismo-perfil.component';

const mockActivatedRoute = {
  snapshot: {
    data: {
      perfil: TipoPerfil.Conformidad
    }
  }
}
const mockHttpClient = {
  get: jasmine.createSpy('get').and.returnValue(of({})),
  post: jasmine.createSpy('post').and.returnValue(of({})),
  put: jasmine.createSpy('put').and.returnValue(of({})),
  delete: jasmine.createSpy('delete').and.returnValue(of({}))
};

describe('AuditoriaUsuarioOrganismoPerfilComponent', () => {
  let component: AuditoriaUsuarioOrganismoPerfilComponent;
  let fixture: ComponentFixture<AuditoriaUsuarioOrganismoPerfilComponent>;
  let compraSpy: jasmine.SpyObj<TipoCompraService>;

  beforeEach(async () => {
    compraSpy = jasmine.createSpyObj('TipoCompraService', ['obtenerTiposCompraSinPaginado']);
    compraSpy.obtenerTiposCompraSinPaginado.and.returnValue(of([{ id: '1' } as any]));
    const actualizarSpy = jasmine.createSpyObj('ActualizarService', ['subTitulo', 'titulo']);
    TestBed.configureTestingModule({
      declarations: [AuditoriaUsuarioOrganismoPerfilComponent],
      imports: [ReactiveFormsModule, SharedModule],
      providers: [
        FormBuilder,
        { provide: ActualizarService, useValue: actualizarSpy },
        { provide: TipoCompraService, useValue: compraSpy },
        { provide: Router, useValue: { events: of() } },
        { provide: BsModalService, useValue: {} },
        { provide: BsModalRef, useValue: {} },
        { provide: HttpClient, useValue: mockHttpClient },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });

    TestBed.overrideComponent(AuditoriaUsuarioOrganismoPerfilComponent, { set: { template: '' } });
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(AuditoriaUsuarioOrganismoPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('obtenerTiposCompra carga tipos', () => {
    component.obtenerTiposCompra();
    expect(compraSpy.obtenerTiposCompraSinPaginado).toHaveBeenCalled();
    expect(component.tiposCompra.length).toBe(1);
  });

  it('filtrar ejecuta sin errores si válido', () => {
    component.buscar();
    expect(component.form.valid).toBeTrue();
  });



  it('actualizarFiltro construye objeto y reinicia página', () => {
    component.form.patchValue({
      tipoOperacion: 'Alta',
      usuario: '10',
      rangoFechas: { fechaDesde: '2024-01-01', fechaHasta: '2024-02-01' }
    });
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual({
      tipoOperacion: 'Alta',
      usuario: 'uy-ci-10',
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-02-01',
      tipoCompra: '',
      nroCompra: undefined,
      anioCompra: undefined,
      nroItem: undefined,
      descripcionArticulo: undefined,
      idInciso: undefined,
      idUE: undefined,
      idUC: undefined,
      perfil: 'CONFORMIDAD'
    });
    expect(component.parametros.pagina).toBe(0);
  });

  it('cambioPagina y cambioPorPagina actualizan y buscan', () => {
    component.cambioPagina(2);
    expect(component.parametros.pagina).toBe(2);
    expect(component.parametros.tamanoPagina).toBe(10);
    component.cambioPorPagina(20);
  });

  it('nuevaConsulta limpia filtros y resetea página', () => {
    component.nuevaConsulta();
    expect(component.parametros.pagina).toBe(0);
    expect(component.form.get('organismo')?.value).toBe(null);
  });


  it('actualizarFiltro construye objeto y reinicia página para recepcion', () => {
    component.form.patchValue({
      tipoOperacion: 'Alta',
      usuario: '10',
      rangoFechas: { fechaDesde: '2024-01-01', fechaHasta: '2024-02-01' }
    });
    component.perfil = TipoPerfil.Recepcion;
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual({
      idInciso: undefined,
      idUE: undefined,
      idUC: undefined,
      perfil: 'RECEPCION',
      tipoOperacion: 'Alta',
      usuario: 'uy-ci-10',
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-02-01',
      nombrePunto: ''
    });
    expect(component.parametros.pagina).toBe(0);
  });

  it('actualizarFiltro construye objeto y reinicia página para conformidad', () => {
    component.form.patchValue({
      tipoOperacion: 'Alta',
      usuario: 'uy-ci-10',
      rangoFechas: { fechaDesde: '2024-01-01', fechaHasta: '2024-02-01' }
    });
    component.perfil = TipoPerfil.Conformidad;
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual({
      idInciso: undefined,
      idUE: undefined,
      idUC: undefined,
      perfil: 'CONFORMIDAD',
      nroCompra: undefined,
      anioCompra: undefined,
      descripcionArticulo: undefined,
      nroItem: undefined,
      tipoCompra: '',
      tipoOperacion: 'Alta',
      usuario: 'uy-ci-10',
      fechaDesde: '2024-01-01',
      fechaHasta: '2024-02-01',
    });
    expect(component.parametros.pagina).toBe(0);
  });

  it('cambioPagina y cambioPorPagina actualizan y buscan', () => {
    component.cambioPagina(2);
    expect(component.parametros.pagina).toBe(2);
    expect(component.parametros.tamanoPagina).toBe(10);
    component.cambioPorPagina(20);
  });

  it('nuevaConsulta limpia filtros y resetea página', () => {
    component.nuevaConsulta();
    expect(component.parametros.pagina).toBe(0);
    expect(component.form.get('organismo')?.value).toBe(null);
  });

  it('setearFiltrosConformidad usa valores del filtro de ítems', () => {
    const filtro: any = {};
    component.filtroItem = { tipoBusqueda: 'NROITEM', item: '7' } as any;
    (component as any).setearFiltrosConformidad(filtro);
    expect(filtro.nroItem).toBe(7);
    component.filtroItem = { tipoBusqueda: 'ARTICULO', item: 'Lapiz' } as any;
    (component as any).setearFiltrosConformidad(filtro);
    expect(filtro.descripcionArticulo).toBe('Lapiz');
  });

  it('setearFiltrosRecepcion carga el nombre del punto', () => {
    const filtro: any = {};
    component.form.get('nombrePunto')?.setValue('Punto 1');
    (component as any).setearFiltrosRecepcion(filtro);
    expect(filtro.nombrePunto).toBe('Punto 1');
  });

  it('actualizarFiltrosYBuscar recalcula filtros y ejecuta la búsqueda', () => {
    const filtroBaseSpy = spyOn<any>(component, 'actualizarFiltroBase').and.callThrough();
    const filtroSpy = spyOn(component, 'actualizarFiltro').and.callThrough();
    const buscarSpy = spyOn(component, 'buscar').and.callThrough();
    component.actualizarFiltrosYBuscar();
    expect(filtroBaseSpy).toHaveBeenCalled();
    expect(filtroSpy).toHaveBeenCalled();
    expect(buscarSpy).toHaveBeenCalled();
  });

});
