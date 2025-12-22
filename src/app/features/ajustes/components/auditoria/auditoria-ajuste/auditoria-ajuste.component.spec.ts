import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AuditoriaAjusteService } from 'src/app/features/entregas/services/auditoria-ajuste.service';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { AuditoriaAjusteComponent } from './auditoria-ajuste.component';

@Component({ selector: 'app-filtro-items-articulos', template: '', standalone: false })
class FiltroItemsStub {
  limpiar = jasmine.createSpy('limpiar');
}

class OrdenCompraServiceStub {
  obtenerPorNroOC = jasmine.createSpy('obtenerPorNroOC').and.returnValue(of({}));
}

class AuditoriaAjusteServiceStub {
  getPageable = jasmine.createSpy('getPageable').and.returnValue(of({ content: [{ id: 1 }], page: { totalElements: 1 } }));
}

class SeguridadServiceStub {
  obtenerTipoUsuario = jasmine.createSpy('obtenerTipoUsuario').and.returnValue(TipoUsuario.ORGANISMO);
}

class ActualizarServiceStub {
  tipoUsuario$ = of(undefined);
}

class BsModalServiceStub {}

describe('AuditoriaAjusteComponent', () => {
  let component: AuditoriaAjusteComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AuditoriaAjusteComponent, FiltroItemsStub],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { data: { perfil: TipoPerfil.Conformidad } } } },
        { provide: OrdenCompraService, useClass: OrdenCompraServiceStub },
        { provide: AuditoriaAjusteService, useClass: AuditoriaAjusteServiceStub },
        { provide: SeguridadService, useClass: SeguridadServiceStub },
        { provide: ActualizarService, useClass: ActualizarServiceStub },
        { provide: BsModalService, useClass: BsModalServiceStub },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    TestBed.overrideTemplate(AuditoriaAjusteComponent, '');

    const fixture = TestBed.createComponent(AuditoriaAjusteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.filtroItemsComponent = TestBed.createComponent(FiltroItemsStub).componentInstance as any;
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe buscar auditorías cuando el formulario es válido', () => {
    const auditoriaSrv = TestBed.inject(AuditoriaAjusteService) as unknown as AuditoriaAjusteServiceStub;
    const ordenSrv = TestBed.inject(OrdenCompraService) as unknown as OrdenCompraServiceStub;
    component.form.get('nroOC')?.setValue('123');
    component.form.get('organismoCompra')?.setValue({ idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 })
    component.form.get('nroAnioCompra')?.setValue('4/2025');
    component.actualizarFiltrosYBuscar();
    expect(ordenSrv.obtenerPorNroOC).toHaveBeenCalledWith(1,2,3,'2025','4','123');
    expect(component.auditorias.length).toBe(0);
    expect(component.total).toBe(-1);
  });

  it('no debe buscar si el formulario es inválido', () => {
    const auditoriaSrv = TestBed.inject(AuditoriaAjusteService) as unknown as AuditoriaAjusteServiceStub;
    component.form.get('nroOC')?.setValue('');
    component.actualizarFiltrosYBuscar();
    expect(auditoriaSrv.getPageable).not.toHaveBeenCalled();
  });

  it('debe actualizar el filtro correctamente', () => {
    component.form.get('organismoCompra')?.setValue({ idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 });
    component.form.get('tipoOperacion')?.setValue('alta');
    component.form.get('nroOC')?.setValue('456');
    component.actualizarFiltro();
    expect(component.parametros.filtro).toEqual(jasmine.objectContaining({
      idIncisoCompra: 1,
      idUECompra: 2,
      idUCCompra: 3,
      tipoOperacion: 'alta',
      nroOC: '456',
      tipoUsuario: TipoUsuario.ORGANISMO,
    }));
  });

  it('debe limpiar el formulario en nuevaConsulta', () => {
    const filtroStub = component.filtroItemsComponent as any;
    component.auditorias = [{ id: 1 } as any];
    component.total = 5;
    component.parametros.pagina = 3;
    component.form.get('nroOC')?.setValue('789');
    component.nuevaConsulta();
    expect(filtroStub.limpiar).toHaveBeenCalled();
    expect(component.form.get('nroOC')?.value).toBe('');
    expect(component.parametros.pagina).toBe(0);
    expect(component.auditorias).toEqual([]);
    expect(component.total).toBe(-1);
  });

  it('debe indicar si un campo está vacío', () => {
    const controlVacio = { touched: true, value: '' };
    const controlLleno = { touched: true, value: 'dato' };
    expect(component.campoEsVacio(controlVacio)).toBeTrue();
    expect(component.campoEsVacio(controlLleno)).toBeFalse();
  });

  it('debe almacenar el filtro de items', () => {
    const filtro = { codigo: 'A' } as any;
    component.onFiltroItemsCambio(filtro);
    expect(component.filtroItem).toBe(filtro);
  });
});
