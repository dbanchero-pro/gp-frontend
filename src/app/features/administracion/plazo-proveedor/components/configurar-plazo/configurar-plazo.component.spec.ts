import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ConfigurarPlazoComponent } from './configurar-plazo.component';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { ProveedorService } from '../../../puntos-recepcion/services/proveedor.service';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';

class SeguridadServiceMock {
  obtenerProveedores = jasmine.createSpy('obtenerProveedores').and.returnValue([] as ProveedorDTO[]);
}

class ProveedorServiceMock {
  obtenerProveedor = jasmine.createSpy('obtenerProveedor').and.returnValue(of({ plazoEntrega: 5 } as ProveedorDTO));
  actualizarPlazoEntrega = jasmine.createSpy('actualizarPlazoEntrega').and.returnValue(of(true));
}

class ActualizarServiceMock {
  confirmar = jasmine.createSpy('confirmar');
  mensajeCorrecto = jasmine.createSpy('mensajeCorrecto');
}

describe('ConfigurarPlazoComponent', () => {
  let component: ConfigurarPlazoComponent;
  let fixture: ComponentFixture<ConfigurarPlazoComponent>;
  let seguridadService: SeguridadServiceMock;
  let proveedorService: ProveedorServiceMock;
  let actualizarService: ActualizarServiceMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigurarPlazoComponent],
      imports: [ReactiveFormsModule],
      providers: [
        { provide: SeguridadService, useClass: SeguridadServiceMock },
        { provide: ProveedorService, useClass: ProveedorServiceMock },
        { provide: ActualizarService, useClass: ActualizarServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ConfigurarPlazoComponent);
    component = fixture.componentInstance;
    seguridadService = TestBed.inject(SeguridadService) as unknown as SeguridadServiceMock;
    proveedorService = TestBed.inject(ProveedorService) as unknown as ProveedorServiceMock;
    actualizarService = TestBed.inject(ActualizarService) as unknown as ActualizarServiceMock;
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería cargar proveedores al inicializar', () => {
    const spy = spyOn<any>(component, 'cargarProveedores');
    component.ngOnInit();
    expect(spy).toHaveBeenCalled();
  });

  it('debería seleccionar proveedor único y llamar a cambio', () => {
    const proveedor: ProveedorDTO = { id: 1 } as unknown as ProveedorDTO;
    seguridadService.obtenerProveedores.and.returnValue([proveedor]);
    const cambioSpy = spyOn(component, 'cambioProveedor');
    (component as any).cargarProveedores();
    expect(component.proveedores.length).toBe(1);
    expect(component.form.get('proveedor')?.value).toBe(1);
    expect(cambioSpy).toHaveBeenCalled();
  });

  it('no debería seleccionar proveedor cuando hay varios', () => {
    const proveedores: ProveedorDTO[] = [{ id: 1 } as unknown as ProveedorDTO, { id: 2 } as unknown as ProveedorDTO];
    seguridadService.obtenerProveedores.and.returnValue(proveedores);
    const cambioSpy = spyOn(component, 'cambioProveedor');
    (component as any).cargarProveedores();
    expect(component.proveedores.length).toBe(2);
    expect(component.form.get('proveedor')?.value).toBe('');
    expect(cambioSpy).not.toHaveBeenCalled();
  });

  it('debería cargar configuración existente', () => {
    const ctrl = component.form.get('cantidadDias')!;
    const markSpy = spyOn(ctrl, 'markAsUntouched');
    proveedorService.obtenerProveedor.and.returnValue(of({ plazoEntrega: 7 } as ProveedorDTO));
    (component as any).cargarConfiguracionExistente(1);
    expect(proveedorService.obtenerProveedor).toHaveBeenCalledWith(1);
    expect(ctrl.value).toBe(7);
    expect(markSpy).toHaveBeenCalled();
  });

  it('debería indicar campo vacío', () => {
    const ctrl = component.form.get('proveedor')!;
    ctrl.markAsTouched();
    expect(component.campoVacio('proveedor')).toBeTrue();
  });

  it('debería confirmar y aceptar cambios de proveedor', () => {
    component.form.get('cantidadDias')?.setValue('10');
    component.form.get('cantidadDias')?.markAsDirty();
    component.form.get('proveedor')?.setValue(5);
    const cargarSpy = spyOn<any>(component, 'cargarConfiguracionExistente');
    actualizarService.confirmar.and.callFake((_m: any, aceptar: any) => aceptar());
    component.cambioProveedor({ target: { value: 5 } });
    expect(actualizarService.confirmar).toHaveBeenCalled();
    expect(component.form.get('proveedor')?.value).toBe(5);
    expect(component.valorAnterior as any).toBe(5);
    expect(cargarSpy).toHaveBeenCalledWith(5);
  });

  it('debería mantener valor anterior si se cancela la confirmación', () => {
    component.form.get('cantidadDias')?.setValue('10');
    component.form.get('cantidadDias')?.markAsDirty();
    component.valorAnterior = '3';
    component.form.get('proveedor')?.setValue(4);
    actualizarService.confirmar.and.callFake((_m: any, _a: any, cancelar: any) => cancelar());
    component.cambioProveedor({ target: { value: 4 } });
    expect(component.form.get('proveedor')?.value).toBe('3');
  });

  it('debería cargar configuración sin cambios previos', () => {
    const cargarSpy = spyOn<any>(component, 'cargarConfiguracionExistente');
    component.form.get('proveedor')?.setValue(2);
    component.cambioProveedor({ target: { value: 2 } });
    expect(component.valorAnterior as any).toBe(2);
    expect(cargarSpy).toHaveBeenCalledWith(2);
  });

  it('debería limpiar días cuando se selecciona vacío sin cambios', () => {
    const cantidadCtrl = component.form.get('cantidadDias')!;
    const untouchedSpy = spyOn(cantidadCtrl, 'markAsUntouched');
    const pristineSpy = spyOn(cantidadCtrl, 'markAsPristine');
    component.form.get('proveedor')?.setValue('');
    component.cambioProveedor({ target: { value: '' } });
    expect(cantidadCtrl.value).toBe('');
    expect(untouchedSpy).toHaveBeenCalled();
    expect(pristineSpy).toHaveBeenCalled();
  });

  it('debería marcar formulario cuando es inválido', () => {
    const markSpy = spyOn(component.form, 'markAllAsTouched');
    component.guardar();
    expect(markSpy).toHaveBeenCalled();
    expect(proveedorService.actualizarPlazoEntrega).not.toHaveBeenCalled();
  });

  it('debería actualizar plazo cuando el formulario es válido', () => {
    const cantidadCtrl = component.form.get('cantidadDias')!;
    const untouchedSpy = spyOn(cantidadCtrl, 'markAsUntouched');
    const pristineSpy = spyOn(cantidadCtrl, 'markAsPristine');
    component.form.get('proveedor')?.setValue(1);
    component.form.get('cantidadDias')?.setValue(8);
    component.guardar();
    expect(proveedorService.actualizarPlazoEntrega).toHaveBeenCalledWith(1, 8);
    expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    expect(untouchedSpy).toHaveBeenCalled();
    expect(pristineSpy).toHaveBeenCalled();
  });
});

