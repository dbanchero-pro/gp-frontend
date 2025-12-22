import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { CaracteristicasItemPopupComponent } from './caracteristicas-item-popup.component';

describe('CaracteristicasItemPopupComponent', () => {
  let component: CaracteristicasItemPopupComponent;
  let fixture: ComponentFixture<CaracteristicasItemPopupComponent>;

  let bsModalRef: jasmine.SpyObj<BsModalRef>;
  let itemOrdenCompraServiceSpy: jasmine.SpyObj<ItemOrdenCompraService>;
  
  beforeEach(async () => {
    itemOrdenCompraServiceSpy = jasmine.createSpyObj('ItemOrdenCompraService', ['obtenerAtributos']);
    itemOrdenCompraServiceSpy.obtenerAtributos.and.returnValue(of([]));
    bsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
      
    await TestBed.configureTestingModule({
      declarations: [CaracteristicasItemPopupComponent],
      providers: [{ provide: BsModalRef, useValue: {} },
      BsModalService,
        { provide: ItemOrdenCompraService, useValue: itemOrdenCompraServiceSpy },
        ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(CaracteristicasItemPopupComponent);
    component = fixture.componentInstance;
    component.item = new ItemOrdenCompraDTO(1, 1, 1, 1, 1, 'artículo', 'unidad', 1);
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('usa el titulo por defecto', () => {
    expect(component.titulo).toBe('Características del ítem');
  });

  it('filtra atributos que empiezan con guiones', () => {
    const atributos = [
      { descPropiedad: '----oculto', valorTexto: 'visible' },
      { descPropiedad: 'Mostrable', valorTexto: '----oculto' },
      { descPropiedad: 'Nombre', valorTexto: 'Valor' },
    ] as any;
    itemOrdenCompraServiceSpy.obtenerAtributos.and.returnValue(of(atributos));

    component.ngOnInit();

    expect(component['propiedades'].length).toBe(1);
    expect(component['propiedades'][0].descPropiedad).toBe('Nombre');
  });

  it('mostrarMedida devuelve falso cuando la medida comienza con guiones', () => {
    const res = component.mostrarMedida({ descMedidaPropiedad: '----oculto' } as any);
    expect(res).toBeFalse();
  });

  it('mostrarMedida devuelve verdadero cuando la medida es válida', () => {
    const res = component.mostrarMedida({ descMedidaPropiedad: 'metros' } as any);
    expect(res).toBeTrue();
  });
});
