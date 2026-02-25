import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { TipoBusqueda } from '../../enum/tipo-busqueda-item.enum';
import { IBusquedaItemDTO } from '../../models/busqueda-item.model';
import { ItemsCompraService } from '../../services/items-compra.service';
import { FiltroItemsArticulosComponent } from './filtro-items-articulos.component';

const mockHttpClient = {
    get: jasmine.createSpy('get').and.returnValue(of({})),
    post: jasmine.createSpy('post').and.returnValue(of({})),
    put: jasmine.createSpy('put').and.returnValue(of({})),
    delete: jasmine.createSpy('delete').and.returnValue(of({}))
};

class ItemsCompraServiceStub {
    buscarPorArticulo = jasmine
        .createSpy('buscarPorArticulo')
        .and.returnValue(of([]));
}

class ItemOrdenCompraServiceStub {
    buscarPorArticulo = jasmine
        .createSpy('buscarPorArticulo')
        .and.returnValue(of([]));
}
describe('FiltroItemsArticulos', () => {
    let component: FiltroItemsArticulosComponent;
    let fixture: ComponentFixture<FiltroItemsArticulosComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [FiltroItemsArticulosComponent],
            imports: [
                FormsModule,
                ReactiveFormsModule,
            ],
            providers: [
                provideHttpClientTesting(),
                provideRouter([]),
                { provide: HttpClient, useValue: mockHttpClient },
                { provide: ItemsCompraService, useClass: ItemsCompraServiceStub },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });
        fixture = TestBed.createComponent(FiltroItemsArticulosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    it('inicializa los controles con filtroInicial', () => {
        const fix = TestBed.createComponent(FiltroItemsArticulosComponent);
        const comp = fix.componentInstance;
        comp.filtroInicial = { tipoBusqueda: 'ARTICULO', item: 'lapiz' } as any;
        fix.detectChanges();
        expect(comp.tipoBusqueda.value).toBe('ARTICULO');
        expect(comp.busqueda.value).toBe('lapiz');
    });

    it('debería emitir los cambios de filtro correctamente', () => {
        component.tipoBusqueda.setValue('tipo');
        component.busqueda.setValue('articulo');

        const filtroEsperado: IBusquedaItemDTO = {
            tipoBusqueda: 'tipo',
            item: 'articulo',
        };

        let filtroEmitted: IBusquedaItemDTO | undefined;
        component.cambioFiltro.subscribe((filtro: IBusquedaItemDTO) => {
            filtroEmitted = filtro;
        });

        component.cambioDatosFiltros();

        expect(filtroEmitted).toEqual(filtroEsperado);
    });

    it('no debería emitir al buscar si el texto está vacío', () => {
        const spy = spyOn(component['articuloBusquedaArticulo$'], 'next');
        component.tipoBusqueda.setValue('NROITEM');
        component.buscar({ target: { value: '' } } as any);
        expect(spy).not.toHaveBeenCalled();
    });

    it('no debería emitir al buscar si el tipo es NROITEM y el texto no es numérico', () => {
        const spy = spyOn(component['articuloBusquedaArticulo$'], 'next');
        component.tipoBusqueda.setValue('NROITEM');
        component.buscar({ target: { value: 'abc' } } as any);
        expect(spy).not.toHaveBeenCalled();
    });

    it('debería emitir el texto al buscar si todo es válido', () => {
        const spy = spyOn(component['articuloBusquedaArticulo$'], 'next');
        component.tipoBusqueda.setValue('ARTICULO');
        component.buscar({ target: { value: 'algo' } } as any);
        expect(spy).toHaveBeenCalledWith('algo');
    });


    it('debería actualizar los campos correctamente en cambioArticulo()', () => {
        const spy = spyOn(component, 'cambioDatosFiltros');
        component.tipoBusqueda.setValue('ARTICULO');
        component.cambioArticulo({ item: { descArticulo: 'nuevo' } } as any, TipoBusqueda.ARTICULO);
        expect(component.busqueda.value).toBe('nuevo');
        expect(component.articuloBusquedaTexto.value).toBe('nuevo');
        expect(spy).toHaveBeenCalled();
    });

    it('debería limpiar los campos si cambioArticulo no tiene item', () => {
        const spy = spyOn(component, 'cambioDatosFiltros');
        component.tipoBusqueda.setValue('ARTICULO');
        component.cambioArticulo(null, TipoBusqueda.ARTICULO);
        expect(component.articuloBusquedaTexto.value).toBe('');
        expect(spy).toHaveBeenCalled();
    });

    it('debería actualizar los campos correctamente en cambioItem()', () => {
        const spy = spyOn(component, 'cambioDatosFiltros');
        component.tipoBusqueda.setValue('NROITEM');
        const mockEvent = new Event('input');
        Object.defineProperty(mockEvent, 'target', {
            value: {
                value: '55'
            },
            writable: false,
            configurable: true
        });
        component.cambioItem(mockEvent);
        expect(component.busqueda.value).toBe('55');
        expect(component.itemBusquedaTexto.value).toBe('55');

        expect(spy).toHaveBeenCalled();
    });


    it('debería limpiar los campos si cambioItem es null', () => {
        const spy = spyOn(component, 'cambioDatosFiltros');
        component.tipoBusqueda.setValue('NROITEM');
        component.cambioItem(null);
        expect(component.itemBusquedaTexto.value).toBe('');
        expect(spy).toHaveBeenCalled();
    });

    it('no debería modificar el valor válido en inputSoloNumeros()', () => {
        const mockEvent = { target: { value: '123' } };
        const result = component.inputSoloNumeros(mockEvent);
        expect(mockEvent.target.value).toBe('123');
        expect(result).toBeFalse();
    });

    it('limpiar reinicia controles y emite filtro', () => {
        const spy = spyOn(component, 'cambioDatosFiltros');
        component.tipoBusqueda.setValue('ARTICULO');
        component.busqueda.setValue('x');
        component.articuloBusquedaTexto.setValue('x');
        component.itemBusquedaTexto.setValue('1');
        component.limpiar();
        expect(component.busqueda.value).toBe('');
        expect(component.articuloBusquedaTexto.value).toBe('');
        expect(spy).toHaveBeenCalled();
    });

    it('buscarEnCliente filtra por nro item', (done) => {
        component.tipoBusqueda.setValue('NROITEM');
        component.items = [{ nroItem: '5', descArticulo: 'A' } as any];
        component.buscarEnCliente('5').subscribe(res => {
            expect(res.length).toBe(1);
            done();
        });
    });

    it('buscarEnCliente retorna vacío para texto no numérico', (done) => {
        component.tipoBusqueda.setValue('NROITEM');
        component.items = [{ nroItem: '5', descArticulo: 'A' } as any];
        component.buscarEnCliente('x').subscribe(res => {
            expect(res.length).toBe(0);
            done();
        });
    });

    it('buscarEnCliente filtra por artículo', (done) => {
        component.tipoBusqueda.setValue('ARTICULO');
        component.items = [{ nroItem: '5', descArticulo: 'ArticuloA' } as any];
        component.buscarEnCliente('articuloa').subscribe(res => {
            expect(res.length).toBe(1);
            done();
        });
    });

    it('setDisabledState deshabilita y habilita controles', () => {
        component.setDisabledState(true);
        expect(component.busqueda.disabled).toBeTrue();
        component.setDisabledState(false);
        expect(component.busqueda.disabled).toBeFalse();
    });

    it('inputSoloNumeros ajusta valor y devuelve true si cambia', () => {
        const ev = { target: { value: '01234' } } as any;
        const ret = component.inputSoloNumeros(ev);
        expect(ev.target.value).toBe('123');
        expect(ret).toBeTrue();
    });

    it('usa ItemsCompraService cuando usarItemsOrdenCompra es true', fakeAsync(() => {
        const icService = TestBed.inject(ItemsCompraService);

        const fix = TestBed.createComponent(FiltroItemsArticulosComponent);
        const comp = fix.componentInstance;
        comp.idCompra = 1;
        comp.usarItemsOrdenCompra = true;
        comp.tipoBusqueda.setValue('NROITEM');

        fix.detectChanges();
        comp.itemsInterno.subscribe();

        comp.buscar({ target: { value: '22' } } as any);
        tick(400);

        expect((icService as any).buscarPorArticulo).toHaveBeenCalled();
    }));

    it('usa ItemsCompraService cuando usarItemsOrdenCompra es false', fakeAsync(() => {
        const icService = TestBed.inject(ItemsCompraService);

        const fix = TestBed.createComponent(FiltroItemsArticulosComponent);
        const comp = fix.componentInstance;
        comp.idCompra = 1;
        comp.usarItemsOrdenCompra = false;
        comp.tipoBusqueda.setValue('NROITEM');

        fix.detectChanges();
        comp.itemsInterno.subscribe();

        comp.buscar({ target: { value: '33' } } as any);
        tick(400);

        expect((icService as any).buscarPorArticulo).toHaveBeenCalled();
    }));
});
