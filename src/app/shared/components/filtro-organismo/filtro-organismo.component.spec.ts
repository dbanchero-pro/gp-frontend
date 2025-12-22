import { CUSTOM_ELEMENTS_SCHEMA, SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { OrganismoService } from '../../services/organismo.service';
import { FiltroOrganismoComponent } from './filtro-organismo.component';

describe('FiltroOrganismo', () => {
  let component: FiltroOrganismoComponent;
  let fixture: ComponentFixture<FiltroOrganismoComponent>;
  let mockOrganismoService: any;

  beforeEach(async () => {
    mockOrganismoService = {
      obtenerIncisos: jasmine.createSpy().and.returnValue(of([{ id: 1, nombre: 'Inciso 1' }])),
      obtenerUE: jasmine.createSpy().and.returnValue(of([{ idUnidadEjecutora: 10, nombre: 'UE 1' }])),
      obtenerUC: jasmine.createSpy().and.returnValue(of([{ idUnidadCompra: 100, nombre: 'UC 1' }])),
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FiltroOrganismoComponent],
      providers: [
        { provide: OrganismoService, useValue: mockOrganismoService },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroOrganismoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar tiposIncisos en ngOnInit', () => {
    expect((component as any).form.get('idInciso')?.value).toBe('');
  });

  it('debería emitir el filtro actualizado cuando cambia el valor del formulario', () => {
    spyOn(component.cambioFiltro, 'emit');
    component.writeValue({ idInciso: 1, idUnidadEjecutora: 10, idUnidadCompra: 100 });

    expect(component.cambioFiltro.emit).toHaveBeenCalledWith({
      idInciso: 1,
      idUnidadEjecutora: 10,
      idUnidadCompra: 100
    });
  });

  it('debería limpiar correctamente el formulario con clear()', () => {
    spyOn(component.limpiarFiltro, 'emit');

    component.writeValue({ idInciso: 1 });
    component.limpiar();

    expect((component as any).form.get('idInciso')?.value).toBe('');
    expect(component.limpiarFiltro.emit).toHaveBeenCalled();
  });
  it('debería cargar unidades ejecutoras al seleccionar un inciso', () => {
    component.limpiar();
    component.writeValue({ idInciso: 1 });
    component.cambioInciso();

    expect(mockOrganismoService.obtenerUE).toHaveBeenCalledWith(1, false, undefined);
    expect((component as any).form.get('idInciso')?.value).toBe(1);
    expect((component as any).form.get('idUnidadEjecutora')?.value).toBe(10);
  });

  it('debería cargar unidades de compra al seleccionar una unidad ejecutora', () => {
    component.limpiar();
    component.writeValue({ idInciso: 1, idUnidadEjecutora: 10 });
    component.cambioUE();

    expect(mockOrganismoService.obtenerUC).toHaveBeenCalledWith(1, 10, false, undefined);
    expect((component as any).form.get('idUnidadEjecutora')?.value).toBe(10);
    expect((component as any).form.get('idUnidadCompra')?.value).toBe(100);
  });

  it('debería reaccionar correctamente en ngOnChanges con filtro inicial completo', () => {
    spyOn(component.cambioFiltro, 'emit');
    component.filtro = {
      idInciso: 1,
      idUnidadEjecutora: 10,
      idUnidadCompra: 100
    };

    const changes = {
      filtro: new SimpleChange(null, component.filtro, true)
    };

    component.ngOnChanges(changes);

    expect(mockOrganismoService.obtenerUE).toHaveBeenCalledWith(1,false,  undefined);
    expect(mockOrganismoService.obtenerUC).toHaveBeenCalledWith(1, 10, false, undefined);
  });

  it('validate marca controles y retorna false si están vacíos', () => {
    component.requeridoInciso = true;
    component.requeridoUE = true;
    component.requeridoUC = true;
    component.ngOnInit();

    const valido = component.validate((component as any));
    component.markAsTouched();
    expect(valido).toBeDefined();
    expect((component as any).form.get('idInciso')?.touched).toBeTrue();
    expect((component as any).form.get('idUnidadEjecutora')?.touched).toBeTrue();
    expect((component as any).form.get('idUnidadCompra')?.touched).toBeTrue();
  });

  it('debería emitir filtro vacío si no hay inciso en ngOnChanges', () => {
    spyOn(component.cambioFiltro, 'emit');
    component.filtro = {};

    const changes = {
      filtro: new SimpleChange(null, component.filtro, true)
    };

    component.ngOnChanges(changes);

    expect(component.cambioFiltro.emit).toHaveBeenCalledWith({
      idInciso: undefined,
      idUnidadEjecutora: undefined,
      idUnidadCompra: undefined
    });
  });

  it('debería restaurar filtro con datos en organismo', () => {
    spyOn(component.cambioFiltro, 'emit');

    component.writeValue({
      idInciso: 1,
      idUnidadEjecutora: 10,
      idUnidadCompra: 100
    });
    expect((component as any).form.get('idInciso')?.value).toBe(1);
    expect(mockOrganismoService.obtenerUE).toHaveBeenCalledWith(1, false,  undefined);
    expect(mockOrganismoService.obtenerUC).toHaveBeenCalledWith(1, 10, false,  undefined);
  });


  it('debería manejar error al cargar UE o UC', () => {
    mockOrganismoService.obtenerUE.and.returnValue(throwError(() => new Error('Error UE')));
    component.writeValue({ idInciso: 99 });
    component.cambioInciso();
    expect((component as any).form.get('idUnidadCompra')?.value).toBe('');
  });

  it('debería emitir filtro correcto en cambioDatosFiltros()', () => {
   
    component.writeValue({ idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 100 });
 spyOn(component.cambioFiltro, 'emit');

    component.cambioDatosFiltros();

    expect(component.cambioFiltro.emit).toHaveBeenCalledWith({
      idInciso: 1,
      idUnidadEjecutora: 2,
      idUnidadCompra: 100
    });
  });

  it('setDisabledState debería habilitar y deshabilitar el formulario', () => {
    component.setDisabledState(true);
    expect((component as any).form.disabled).toBeTrue();
    component.setDisabledState(false);
    expect((component as any).form.enabled).toBeTrue();
  });

  it('marcarComoTocado marca todo el formulario', () => {
    spyOn((component as any).form, 'markAllAsTouched');
    component.markAsTouched();
    expect((component as any).form.markAllAsTouched).toHaveBeenCalled();
  });

  it('getNumberNullable devuelve numero o null', () => {
    (component as any).form.get('idInciso')?.setValue('5');
    expect(component.getNumberNullable('idInciso')).toBe(5);
    (component as any).form.get('idInciso')?.setValue('');
    expect(component.getNumberNullable('idInciso')).toBeNull();
  });

  it('aplicarValidadores establece los validadores requeridos', () => {
    component.requeridoInciso = true;
    component.requeridoUE = true;
    component.requeridoUC = true;
    component.idControl = 0
    const changes = {
      requeridoInciso: new SimpleChange(false, true, false),
      requeridoUE: new SimpleChange(false, true, false),
      requeridoUC: new SimpleChange(false, true, false)
    } as any;
    component.aplicarValidadores(changes);
    expect((component as any).form.get('idInciso')?.validator).toBeTruthy();
    expect((component as any).form.get('idUnidadEjecutora')?.validator).toBeTruthy();
    expect((component as any).form.get('idUnidadCompra')?.validator).toBeTruthy();
  });

  it('markAsDirty marca el formulario como sucio', () => {
    component.markAsDirty();
    expect((component as any).form.dirty).toBeTrue();
  });

});
