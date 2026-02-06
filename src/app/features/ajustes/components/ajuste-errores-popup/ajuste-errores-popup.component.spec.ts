import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { BsModalService } from 'ngx-bootstrap/modal';
import { AjusteErroresPopupComponent } from './ajuste-errores-popup.component';
import { IAjusteDTO } from '../../models/ajuste.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { ItemOrdenCompraResumenPipe } from 'src/app/features/entregas/pipes/item-orden-compra-resumen.pipe';

class BsModalServiceMock {
  hide(): void { /* método simulado */ }
}

describe('AjusteErroresPopupComponent', () => {
  let component: AjusteErroresPopupComponent;
  let fixture: ComponentFixture<AjusteErroresPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
  imports: [CommonModule],
  declarations: [AjusteErroresPopupComponent, ItemOrdenCompraResumenPipe],
      providers: [
        ActualizarService,
        { provide: BsModalService, useClass: BsModalServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AjusteErroresPopupComponent);
    component = fixture.componentInstance;
    component.mensajeConfirmacion = 'Los siguientes ítems tienen errores:';
    component.errores = [
      {
        itemOrdenCompra: { nroItem: 1, codArticulo: 123, descArticulo: 'Artículo de prueba' }
      } as IAjusteDTO,
      {
        itemOrdenCompra: { nroItem: 2, codArticulo: 456, descArticulo: 'Otro artículo' },
        mensajeError: 'El ajuste no es válido'
      } as IAjusteDTO
    ];
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar los errores en la tabla', () => {
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('1');
    expect(rows[1].textContent).toContain('El ajuste no es válido');
  });

  it('aceptar emite confirmar y cierra el popup', () => {
    const confirmarSpy = spyOn(component.confirmar, 'emit');
    const cerrarSpy = spyOn(component as any, 'cerrarPopup').and.callThrough();

    component.aceptar();

    expect(confirmarSpy).toHaveBeenCalled();
    expect(cerrarSpy).toHaveBeenCalled();
  });

  it('cancelarPopup emite cancelar, restablece captura y cierra el popup', () => {
    const cancelarSpy = spyOn(component.cancelar, 'emit');
    const cerrarSpy = spyOn(component as any, 'cerrarPopup').and.callThrough();
    (component as any).actualizarService.capturarErrores = false;

    component.cancelarPopup();

    expect(cancelarSpy).toHaveBeenCalled();
    expect((component as any).actualizarService.capturarErrores).toBeTrue();
    expect(cerrarSpy).toHaveBeenCalled();
  });

  it('aceptar no emite ni cierra cuando está deshabilitado', () => {
    component.deshabilitarGuardar = true;
    const confirmarSpy = spyOn(component.confirmar, 'emit');
    const cerrarSpy = spyOn(component as any, 'cerrarPopup');

    component.aceptar();

    expect(confirmarSpy).not.toHaveBeenCalled();
    expect(cerrarSpy).not.toHaveBeenCalled();
  });

  it('obtenerItemAjuste devuelve null cuando no hay item', () => {
    const ajuste = {} as IAjusteDTO;
    expect(component.obtenerItemAjuste(ajuste)).toBeNull();
  });

  it('obtenerMensajeError devuelve mensaje por defecto si no hay detalle', () => {
    const ajuste = { mensajeError: undefined } as IAjusteDTO;
    expect(component.obtenerMensajeError(ajuste)).toBe('Sin detalle disponible');
  });

  it('obtenerMensajeError devuelve cadena vacía si solo hay espacios', () => {
    const ajuste = { mensajeError: '   ' } as IAjusteDTO;
    expect(component.obtenerMensajeError(ajuste)).toBe('');
  });
});



