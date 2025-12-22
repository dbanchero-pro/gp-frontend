import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { OrdenCompraCabezalComponent } from './orden-compra-cabezal.component';

function crearOC() {
  return {
    unidadCompra: {
      idInciso: 1,
      idUnidadEjecutora: 100,
      idUnidadCompra: 1000
    },
    compra: {
      unidadCompra: {
        idInciso: 1,
        idUnidadEjecutora: 100,
        idUnidadCompra: 1000
      }
    }
  } as any;
}

describe('OrdenCompraCabezalComponent', () => {
  let component: OrdenCompraCabezalComponent;
  let fixture: ComponentFixture<OrdenCompraCabezalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OrdenCompraCabezalComponent],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(OrdenCompraCabezalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  describe('cambiaUC', () => {
    it('debería ser falso cuando la unidad de compra es la misma', () => {
      component.ordenCompra = crearOC();
      expect(component.cambiaUC).toBeFalse();
    });

    it('debería detectar cambio en inciso', () => {
      const oc = crearOC();
      oc.unidadCompra.idInciso = 2;
      component.ordenCompra = oc;
      expect(component.cambiaUC).toBeTrue();
    });

    it('debería detectar cambio en unidad ejecutora', () => {
      const oc = crearOC();
      oc.unidadCompra.idUnidadEjecutora = 200;
      component.ordenCompra = oc;
      expect(component.cambiaUC).toBeTrue();
    });

    it('debería detectar cambio en unidad de compra', () => {
      const oc = crearOC();
      oc.unidadCompra.idUnidadCompra = 2000;
      component.ordenCompra = oc;
      expect(component.cambiaUC).toBeTrue();
    });
  });
});
