import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregableDTO } from '../../../models/entregable.model';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { fechaRangoValidator } from '../../../utils/utils';
import { CantidadPorcentajeComponent } from '../../comun/cantidad-porcentaje/cantidad-porcentaje.component';
import { AgregarModificarEntregablePopupComponent } from './agregar-modificar-entregable-popup.component';

class MockModalRef { hide = jasmine.createSpy('hide'); }

describe('AgregarModificarEntregablePopupComponent', () => {
  let component: AgregarModificarEntregablePopupComponent;
  let fixture: ComponentFixture<AgregarModificarEntregablePopupComponent>;
  let modal: BsModalRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AgregarModificarEntregablePopupComponent, CantidadPorcentajeComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        BsModalService,
        { provide: BsModalRef, useValue: new MockModalRef() },
        { provide: ItemOrdenCompraService, useValue: { obtenerItemOrdenCompra: () => of({}) } },
        { provide: EntregableService, useValue: { obtenerEntregablesPorItem: () => of({ content: [] }) } },
        { provide: ActualizarService, useValue: { capturarErrores: true } }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarModificarEntregablePopupComponent);
    component = fixture.componentInstance;
    modal = TestBed.inject(BsModalRef);
    component.itemOrdenCompra = { cantidadTotalMostrar: 2, cantidadPendienteAsignar: 5, fechaComprometida: '2020-12-31' } as any;
    component.ordenCompra = { fechaOC: '2020-01-01' } as any;
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe cargar datos al modificar', () => {
    component.esModificacion = true;
    component.entregableModificar = { idEntregable: 1, cantidad: 1, codEntregable: 'C1', descEntregable: 'N', fechaComprometida: '2020-06-01', itemOrdenCompra: {} } as IEntregableDTO;
    component.ngOnInit();
    expect(component.form.get('codigoEntregable')?.value).toBe('C1');
  });

  it('debe emitir entregable si el formulario es válido', () => {
    const spy = jasmine.createSpy('emit');
    component.guardarEvento.subscribe(spy);
    component.form.patchValue({ fechaComprometida: '2020-06-01', cantidadPorcentaje: { tipo: TipoUnidad.CANTIDAD, valor: 1 }, codigoEntregable: 'C', nombreEntregable: 'N' });
    component.guardar();
    expect(spy).toHaveBeenCalled();
  });

  it('no emite si el formulario no es válido', () => {
    const spy = jasmine.createSpy('emit');
    spyOn(component, 'cerrarPopup');
    component.guardarEvento.subscribe(spy);
    component.guardar();
    expect(spy).not.toHaveBeenCalled();
    expect(component.cerrarPopup).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('es inválido si la cantidad supera la pendiente', () => {
    component.itemOrdenCompra.cantidad = 1;
    component.form.patchValue({ cantidadPorcentaje: { tipo: TipoUnidad.CANTIDAD, valor: 10 } });
    expect(component.form.get('cantidadPorcentaje')?.errors?.['cantidadDebeSerUno']).toBeTruthy();
  }); 
  
  it('es inválido si el porcentaje supera la pendiente', () => {
    component.entregablesExistentes = [
      { idEntregable: 1, cantidad: 10 } as any,
      { idEntregable: 2, cantidad: 20 } as any
    ];
    component.itemOrdenCompra.cantidad = 1;
    component.itemOrdenCompra.cantidadPendienteAsignar = 5;
    component.form.patchValue({ cantidadPorcentaje: { tipo: TipoUnidad.PORCENTAJE, valor: 10 } });
    expect(component.form.get('cantidadPorcentaje')?.errors?.['excedePendientePorcentaje']).toBeTruthy();
  });

  it('es inválido si el porcentaje supera 100 cuando es único entregable', () => {
    component.entregablesExistentes = [];
    component.itemOrdenCompra.cantidad = 1;
    component.form.patchValue({ cantidadPorcentaje: { tipo: TipoUnidad.PORCENTAJE, valor: 110 } });
    expect(component.form.get('cantidadPorcentaje')?.errors?.['porcentajeRango']).toBeTruthy();
  });

  it('es válido si el porcentaje es menor que 100 cuando es único entregable', () => {
    component.entregablesExistentes = [];
    component.itemOrdenCompra.cantidad = 1;
    component.itemOrdenCompra.tipoUnidad = TipoUnidad.PORCENTAJE;
    component.esModificacion = true;
    component.form.patchValue({ cantidadPorcentaje: { tipo: TipoUnidad.PORCENTAJE, valor: 50 } });
    expect(component.form.get('cantidadPorcentaje')?.valid).toBeTruthy();
  });

  it('considera el valor original al modificar', () => {
    component.itemOrdenCompra.cantidad = 1;
    component.esModificacion = true;
    component.entregableModificar = { idEntregable: 1, cantidad: 1, tipoUnidad: TipoUnidad.CANTIDAD } as IEntregableDTO;
    component.itemOrdenCompra.cantidadPendienteAsignar = 0;
    component.form.patchValue({ cantidadPorcentaje: { tipo: TipoUnidad.CANTIDAD, valor: 2 } });
    expect(component.form.get('cantidadPorcentaje')?.errors?.['cantidadDebeSerUno']).toBeTruthy();
  });

  it('es inválido si el código está repetido', () => {
    component.entregablesExistentes = [{ codEntregable: 'C1', idEntregable: 2 } as any];
    const control = component.form.get('codigoEntregable');
    control?.setValue('C1');
    expect(control?.errors?.['codigoRepetido']).toBeTruthy();
  });

  it('carga tipo de unidad aun sin datos del ítem', () => {
    component.itemOrdenCompra.tipoUnidad = undefined as any;
    (component as any).cargarTipoUnidad();
    expect(component.form.get('cantidadPorcentaje')?.value.tipo).toBeNull();
  });

  it('porcentajeHabilitado evalúa múltiples condiciones', () => {
    component.itemOrdenCompra.cantidad = 2;
    expect(component.porcentajeHabilitado).toBeFalse();
    component.itemOrdenCompra.cantidad = 1;
    component.entregablesExistentes = [];
    expect(component.porcentajeHabilitado).toBeTrue();
    component.esModificacion = true;
    component.entregableModificar = { tipoUnidad: TipoUnidad.PORCENTAJE } as any;
    expect(component.porcentajeHabilitado).toBeTrue();
  });

  it('cantidadFijaEnCantidad solo fija cuando es uno', () => {
    component.itemOrdenCompra.cantidad = 2;
    expect(component.cantidadFijaEnCantidad).toBeNull();
    component.itemOrdenCompra.cantidad = 1;
    expect(component.cantidadFijaEnCantidad).toBe(1);
  });

  it('cantidadHabilitada respeta las reglas de porcentaje', () => {
    component.itemOrdenCompra = { cantidad: 2, tipoUnidad: TipoUnidad.PORCENTAJE } as any;
    component.entregablesExistentes = [{}, {}] as any;
    expect(component.cantidadHabilitada).toBeFalse();
    component.esModificacion = true;
    component.entregableModificar = { tipoUnidad: TipoUnidad.CANTIDAD } as any;
    expect(component.cantidadHabilitada).toBeTrue();
  });

  it('fechaMinima y fechaMaxima consideran las fechas disponibles', () => {
    component.ordenCompra = undefined as any;
    expect(component.fechaMinima).toBe('');
    component.ordenCompra = { fechaOC: '2020-01-01' } as any;
    expect(component.fechaMinima).toBe('2020-01-01');
    component.itemOrdenCompra = { fechaComprometida: '2020-12-31' } as any;
    expect(component.fechaMaxima).toBe('2020-12-31');
    component.itemOrdenCompra = undefined as any;
    component.ordenCompra = { fechaComprometida: undefined } as any;
    expect(component.fechaMaxima).toBe('');
  });

  it('valida el rango de fechas', () => {
    const validator = fechaRangoValidator(component);
    component.ordenCompra = { fechaOC: '2020-01-01', fechaComprometida: '2020-12-31' } as any;
    component.itemOrdenCompra = { fechaComprometida: '2020-06-01' } as any;
    expect(validator({ value: '2019-12-31' } as any)?.['fechaMinima']).toBeTruthy();
    expect(validator({ value: '2021-01-01' } as any)?.['fechaMaxima']).toBeTruthy();
    expect(validator({ value: '2020-06-01' } as any)).toBeNull();
  });

  it('obtiene datos cuando existen ids', () => {
    const itemService = TestBed.inject(ItemOrdenCompraService);
    const entService = TestBed.inject(EntregableService);
    const spyItem = spyOn(itemService, 'obtenerItemOrdenCompra').and.returnValue(of({ idItem: 1, idVariacion: 1 }));
    const spyEnt = spyOn(entService, 'obtenerEntregablesPorItem').and.returnValue(of({ content: [] } as any));
    component.itemOrdenCompra = { idItem: 1, idVariacion: 1 } as any;
    component.ordenCompra = { idOC: 2 } as any;
    component.obtenerItemOrdenCompra();
    component.obtenerEntregables();
    expect(spyItem).toHaveBeenCalledWith(2, 1, 1);
    expect(spyEnt).toHaveBeenCalled();
  });
});
