import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of, throwError } from 'rxjs';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { Logger } from 'src/app/shared/utils/logger';
import { EstadoEntrega } from '../../../enum/estado-entrega.enum';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { AgregarModificarEntregaBienPopupComponent } from './agregar-modificar-entrega-bien-popup.component';

describe('AgregarModificarEntregaBienPopupComponent', () => {
  let component: AgregarModificarEntregaBienPopupComponent;
  let fixture: ComponentFixture<AgregarModificarEntregaBienPopupComponent>;
  let itemService: jasmine.SpyObj<ItemOrdenCompraService>;
  let bsModalRef: any;
  let actualizarService: any;

  beforeEach(async () => {
    itemService = jasmine.createSpyObj('ItemOrdenCompraService', ['obtenerItemOrdenCompra']);
    bsModalRef = { hide: jasmine.createSpy('hide') } as any;
    actualizarService = { confirmar: jasmine.createSpy('confirmar'), capturarErrores: true };

    await TestBed.configureTestingModule({
      declarations: [AgregarModificarEntregaBienPopupComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        { provide: BsModalRef, useValue: bsModalRef },
        { provide: BsModalService, useValue: bsModalRef },
        { provide: ItemOrdenCompraService, useValue: itemService },
        { provide: ActualizarService, useValue: actualizarService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    
    TestBed.inject(BsModalRef) as unknown as BsModalRef;
  });

  function crearComponente() {
    fixture = TestBed.createComponent(AgregarModificarEntregaBienPopupComponent);
    component = fixture.componentInstance;
    component.ordenCompra = { idOC: 1, nroOC: '' } as any;
    component.itemOrdenCompra = { idItem: 1, idVariacion: 1, cantidadPendienteAsignar: 5, cantidad: 10 } as any;
  }

  it('debe inicializar con la fecha de la entrega', () => {
    crearComponente();
    component.entrega = { cantidad: 2, fechaComprometida: '2023-10-01', estado: EstadoEntrega.EN_PREPARACION, responsable: 'Ana' } as any;
    itemService.obtenerItemOrdenCompra.and.returnValue(of(component.itemOrdenCompra));
    fixture.detectChanges();
    expect(component.form.get('fechaComprometida')?.value).toBe('2023-10-01');
    expect(component.cantidadOriginal).toBe(2);
    expect(component.form.get('estado')?.value).toBe(EstadoEntrega.EN_PREPARACION);
  });

  it('debe usar la fecha del ítem cuando no hay entrega', () => {
    crearComponente();
    component.itemOrdenCompra.fechaComprometida = '2023-09-01' as any;
    itemService.obtenerItemOrdenCompra.and.returnValue(of(component.itemOrdenCompra));
    fixture.detectChanges();
    expect(component.form.get('fechaComprometida')?.value).toBe('2023-09-01');
  });

  it('debe usar la fecha comprometida de la orden de compra cuando no hay datos', () => {
    crearComponente();
    component.ordenCompra.fechaComprometida = new Date('2023-08-28');
    itemService.obtenerItemOrdenCompra.and.returnValue(of(component.itemOrdenCompra));
    fixture.detectChanges();
    expect(component.form.get('fechaComprometida')?.value).toBe('2023-08-28');
  });

  it('no debe emitir si el formulario es inválido', () => {
    crearComponente();
    itemService.obtenerItemOrdenCompra.and.returnValue(of(component.itemOrdenCompra));
    fixture.detectChanges();
    const spy = spyOn(component.guardarEvento, 'emit');
    component.guardar();
    expect(spy).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('debe emitir la entrega al guardar si el formulario es válido', () => {
    crearComponente();
    spyOn(component, 'obtenerItemOrdenCompra');
    fixture.detectChanges();
    component.form.patchValue({
      fechaComprometida: '2023-10-02',
      cantidadPrevista: 2,
      estado: EstadoEntrega.EN_PREPARACION,
      personasResponsables: 'Ana'
    });
    component.form.updateValueAndValidity();
    const spy = spyOn(component.guardarEvento, 'emit');
    component.guardar();
    expect(spy).toHaveBeenCalledWith(jasmine.objectContaining({
      cantidad: 2,
      fechaComprometida: '2023-10-02',
      estado: EstadoEntrega.EN_PREPARACION,
      responsable: 'Ana'
    }));
  });

  it('validarCantidad debe detectar valores que exceden lo pendiente', () => {
    crearComponente();
    component.cantidadOriginal = 1;
    component.itemOrdenCompra.cantidadPendienteAsignar = 2;
    const control = new FormControl(5);
    const result = (component as any).validarCantidad(control);
    expect(result?.['excedePendiente']).toBeTrue();
  });

  it('validarCantidad debe aceptar valores válidos', () => {
    crearComponente();
    component.cantidadOriginal = 1;
    component.itemOrdenCompra.cantidadPendienteAsignar = 2;
    const control = new FormControl(3);
    const result = (component as any).validarCantidad(control);
    expect(result).toBeNull();
  });

  it('validarCantidad retorna null cuando el valor es nulo', () => {
    crearComponente();
    const control = new FormControl(null);
    const result = (component as any).validarCantidad(control);
    expect(result).toBeNull();
  });

  it('validarCantidad ignora valores no numéricos', () => {
    crearComponente();
    const control = new FormControl(NaN);
    const result = (component as any).validarCantidad(control);
    expect(result).toBeNull();
  });

  it('validarCantidad toma la cantidad del ítem si no hay pendiente', () => {
    crearComponente();
    component.itemOrdenCompra = { idItem: 1, cantidad: 4 } as any;
    const control = new FormControl(5);
    const result = (component as any).validarCantidad(control);
    expect(result?.['excedePendiente']).toBeTrue();
  });

  it('isFormValid refleja la validez del formulario', () => {
    crearComponente();
    spyOn(component, 'obtenerItemOrdenCompra');
    fixture.detectChanges();
    expect(component.isFormValid).toBeFalse();
    component.form.patchValue({
      fechaComprometida: '2023-10-02',
      cantidadPrevista: 2,
      estado: EstadoEntrega.EN_PREPARACION
    });
    component.form.updateValueAndValidity();
    expect(component.isFormValid).toBeTrue();
  });


  it('obtenerItemOrdenCompra asigna el ítem recibido', () => {
    crearComponente();
    const nuevo = { idOC: 1, idItem: 2, idVariacion: 1 } as any;
    itemService.obtenerItemOrdenCompra.and.returnValue(of(nuevo));
    component.obtenerItemOrdenCompra();
    expect(itemService.obtenerItemOrdenCompra).toHaveBeenCalledWith(1, 1, 1);
    expect(component.itemOrdenCompra).toBe(nuevo);
  });

  it('obtenerItemOrdenCompra registra un error si falla', () => {
    crearComponente();
    itemService.obtenerItemOrdenCompra.and.returnValue(throwError(() => 'err'));
    const loggerSpy = spyOn(Logger, 'logError');
    component.obtenerItemOrdenCompra();
    expect(loggerSpy).toHaveBeenCalled();
  });
});
