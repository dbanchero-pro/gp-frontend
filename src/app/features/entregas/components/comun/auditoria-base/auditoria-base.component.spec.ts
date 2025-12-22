
import { Component, Injectable } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { AuditoriaBaseComponent } from './auditoria-base.component';

@Injectable()
class BsModalServiceStub extends BsModalService {
  override show(): any {
    return { hide: jasmine.createSpy('hide') };
  }
}

@Component({
  template: '',
  standalone: false
})
class TestAuditoriaComponent extends AuditoriaBaseComponent<any, any> {
  override listaOrden = [];
  override ordenInicial: 'asc' | 'desc' = 'asc';
  override columnaOrdenInicial = 'campo';
  obtenerOrdenCompraInvocada = false;

  constructor(
    fb: FormBuilder,
    route: ActivatedRoute,
    ordenCompraService: OrdenCompraService,
    seguridad: SeguridadService,
    actualizar: ActualizarService
  ) {
    super(fb, route, ordenCompraService, seguridad, actualizar);
  }

  override obtenerOrdenCompra(): Promise<void> {
    this.obtenerOrdenCompraInvocada = true;
    return Promise.resolve();
  }

  override buscar(): void {
    // no-op para estas pruebas
  }
}

describe('AuditoriaBaseComponent', () => {
  let component: TestAuditoriaComponent;
  let fixture: ComponentFixture<TestAuditoriaComponent>;
  let actualizarService: ActualizarService;
  let seguridadSpy: jasmine.SpyObj<SeguridadService>;

  beforeEach(async () => {
    seguridadSpy = jasmine.createSpyObj('SeguridadService', ['obtenerTipoUsuario']);
    seguridadSpy.obtenerTipoUsuario.and.returnValue(TipoUsuario.ORGANISMO);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [TestAuditoriaComponent],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { snapshot: { data: { perfil: TipoPerfil.Conformidad } } } },
        { provide: OrdenCompraService, useValue: { obtenerPorNroOC: () => of({}) } },
        { provide: SeguridadService, useValue: seguridadSpy },
        { provide: BsModalService, useClass: BsModalServiceStub },
        ActualizarService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TestAuditoriaComponent);
    component = fixture.componentInstance;
    actualizarService = TestBed.inject(ActualizarService);
    fixture.detectChanges();
  });

  it('debería inicializar el tipo de usuario desde seguridad', () => {
    expect(seguridadSpy.obtenerTipoUsuario).toHaveBeenCalled();
    expect(component.tipoUsuario).toBe(TipoUsuario.ORGANISMO);
    expect(component.parametros.sort).toBe('campo');
  });

  it('debería reiniciar la búsqueda cuando cambia el tipo de usuario', () => {
    const limpiarSpy = jasmine.createSpy('limpiar');
    component.filtroItemsComponent = { limpiar: limpiarSpy } as any;

    actualizarService.tipoUsuario$.next(TipoUsuario.PROVEEDOR);

    expect(limpiarSpy).toHaveBeenCalled();
    expect(component.form.get('nroOC')?.value).toBe('');
    expect(component.total).toBe(-1);
  });

  it('campoEsVacio devuelve true solo cuando el control tocado está vacío', () => {
    const control = component.form.get('nroOC');
    control?.markAsTouched();
    control?.setValue('');
    expect(component.campoEsVacio(control)).toBeTrue();
    control?.setValue('123');
    expect(component.campoEsVacio(control)).toBeFalse();
  });

  it('obtenerTextoEntregable genera el texto esperado', () => {
    expect(component.obtenerTextoEntregable(undefined)).toBe('');
    const texto = component.obtenerTextoEntregable({ codEntregable: 'E1', descEntregable: 'Desc' } as any);
    expect(texto).toBe('E1 - Desc');
  });

  it('validarEnteroPositivo limpia y recorta el valor del input', () => {
    const input = document.createElement('input');
    input.value = '00123456789';
    component.validarEnteroPositivo({ target: input } as any);
    expect(input.value).toBe('123456');
  });

  it('validarNroAnioCompra establece la bandera según la validez', () => {
    component.form.get('nroAnioCompra')?.setValue('abc');
    component.form.get('nroAnioCompra')?.markAsTouched();
    expect(component.validarNroAnioCompra()).toBeFalse();
    expect(component.nroCompraValido).toBeFalse();

    component.form.get('nroAnioCompra')?.setValue('12/2024');
    expect(component.validarNroAnioCompra()).toBeFalse();
    expect(component.nroCompraValido).toBeTrue();
  });

  it('actualizarFiltro compone el filtro con los datos del formulario', () => {
    component.form.patchValue({
      filtroBase: { estado: 'ACTIVO' },
      organismoCompra: { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 },
      nroAnioCompra: '15/2024',
      tipoOperacion: 'OP',
      rangoFechas: { fechaDesde: '2024-01-01', fechaHasta: '2024-02-01' },
      nroOC: '10',
      idEntidad: '5'
    });

    component.actualizarFiltro();

    expect(component.parametros.filtro.idIncisoCompra).toBe(1);
    expect(component.parametros.filtro.anioCompra).toBe('2024');
    expect(component.parametros.filtro.numCompra).toBe('15');
    expect(component.parametros.filtro.tipoUsuario).toBe(TipoUsuario.ORGANISMO);
  });

  it('buscarInterno actualiza auditorias y total cuando el formulario es válido', fakeAsync(() => {
    component.form.patchValue({
      filtroBase: { estado: 'ACTIVO' },
      organismoCompra: { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 },
      nroAnioCompra: '15/2024',
      tipoOperacion: 'OP',
      rangoFechas: { fechaDesde: '2024-01-01', fechaHasta: '2024-02-01' },
      nroOC: '10',
      idEntidad: '5'
    });
    component.parametros.pagina = undefined as any;
    component.parametros.tamanoPagina = 5;

    const respuesta = { content: [{ id: 1 }], page: { totalElements: 1 } } as any;
    const funcion = jasmine.createSpy('funcion').and.returnValue(of(respuesta));

    component.actualizarFiltrosYBuscarInterno(funcion);
    tick();

    expect(component.obtenerOrdenCompraInvocada).toBeTrue();
    expect(component.auditorias).toEqual(respuesta.content);
    expect(component.total).toBe(1);
    expect(funcion).toHaveBeenCalled();
  }));
});
