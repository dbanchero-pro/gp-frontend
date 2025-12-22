import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { ItemOrdenCompraCabezalComponent } from './item-orden-compra-cabezal.component';

registerLocaleData(localeEs);

describe('ItemOrdenCompraCabezalComponent', () => {
  let component: ItemOrdenCompraCabezalComponent;
  let fixture: ComponentFixture<ItemOrdenCompraCabezalComponent>;
  let itemOrdenCompraService: jasmine.SpyObj<ItemOrdenCompraService>;

  beforeEach(async () => {
    itemOrdenCompraService = jasmine.createSpyObj('ItemOrdenCompraService', [,'obtenerUnidades','cantidadesPendienteEntregaYTotal']);
  
    await TestBed.configureTestingModule({
      declarations: [ItemOrdenCompraCabezalComponent],
      providers: [
        { provide: ItemOrdenCompraService, useValue: itemOrdenCompraService },
      ]

    }).compileComponents();

    fixture = TestBed.createComponent(ItemOrdenCompraCabezalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('claseFechaEntrega', () => {
    it('debería mostrar alerta cuando el ítem está próximo a vencerse y es proveedor', () => {
      component.itemOrdenCompra = { proximoAVencerse: true } as any;
      component.esUsuarioProveedor = true;
      expect(component.claseFechaEntrega).toBe('text-danger font-weight-bold');
    });

    it('debería mostrar estilo normal en caso contrario', () => {
      component.itemOrdenCompra = { proximoAVencerse: true } as any;
      component.esUsuarioProveedor = false;
      expect(component.claseFechaEntrega).toBe('font-weight-bold');
    });
  });

});
