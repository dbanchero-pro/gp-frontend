import { DecimalPipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { TipoCantidad } from '../enum/tipo-cantidad.enum';
import { TipoUnidad } from '../enum/tipo-unidad.enum';
import { IItemOrdenCompraDTO } from '../models/item-orden-compra.model';
import { ItemOrdenCompraService } from './item-orden-compra.service';

describe('ItemOrdenCompraService', () => {
    let service: ItemOrdenCompraService;

    beforeEach(() => {
        const gcRestServiceSpy = jasmine.createSpyObj<RestService>('GcRestService', ['get', 'post']);
        gcRestServiceSpy.get.and.returnValue(of(null));
        gcRestServiceSpy.post.and.returnValue(of({}));
        const archivoServiceSpy = jasmine.createSpyObj<ArchivoService>('ArchivoService', ['descargar']);
        TestBed.configureTestingModule({
            providers: [
                ItemOrdenCompraService,
                { provide: RestService, useValue: gcRestServiceSpy },
                { provide: ArchivoService, useValue: archivoServiceSpy }
            ]
        });
        service = TestBed.inject(ItemOrdenCompraService);
    });

    beforeAll(() => {
        registerLocaleData(localeEs);
    });

    const crearItem = (parcial: Partial<IItemOrdenCompraDTO>): IItemOrdenCompraDTO => ({
        cantidad: 10,
        cantidadTotal: 10,
        cantidadTotalMostrar: 10,
        descUnidadMedida: 'kg',
        tipoCantidad: TipoCantidad.ITEM,
        tipoUnidad: TipoUnidad.CANTIDAD,
        ...parcial
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('obtenerItemsDeOrdenCompra construye los parametros', () => {
        const gcRest = TestBed.inject(RestService) as jasmine.SpyObj<RestService>;
        service.obtenerItemsDeOrdenCompra({ idOC: 1, tipoUsuario: TipoUsuario.ORGANISMO, nroItem: 2, descArticulo: 'A', estadoItem: 'P' as any, page: 0, size: 10, sort: 'nroItem' });
        const params = gcRest.get.calls.mostRecent().args[1] as any;
        expect(gcRest.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/items-orden-compra/1', jasmine.any(Object));
        expect(params.get('nroItem')).toBe('2');
        expect(params.get('descArticulo')).toBe('A');
        expect(params.get('estadoItem')).toBe('P');
        expect(params.get('tipoUsuario')).toBe('ORGANISMO');
        expect(params.get('page')).toBe('0');
        expect(params.get('size')).toBe('10');
        expect(params.get('sort')).toBe('nroItem');
    });

    it('obtenerItemsDeOrdenCompra sin datos opcionales', () => {
        const gcRest = TestBed.inject(RestService) as jasmine.SpyObj<RestService>;
        service.obtenerItemsDeOrdenCompra({ idOC: 2, tipoUsuario: TipoUsuario.ORGANISMO });
        const params = gcRest.get.calls.mostRecent().args[1] as any;
        expect(params.keys().length).toBe(1);
    });

    it('obtenerItemsDeOrdenCompra configura el tipo de usuario proveedor', () => {
        const gcRest = TestBed.inject(RestService) as jasmine.SpyObj<RestService>;
        service.obtenerItemsDeOrdenCompra({ idOC: 3, tipoUsuario: TipoUsuario.PROVEEDOR });
        const params = gcRest.get.calls.mostRecent().args[1] as any;
        expect(params.get('tipoUsuario')).toBe('PROVEEDOR');
    });

    it('obtenerItemOrdenCompra llama al servicio con la url correcta', () => {
        const gcRest = TestBed.inject(RestService) as jasmine.SpyObj<RestService>;
        const tipoUsuario = TipoUsuario.ORGANISMO;
        service.obtenerItemOrdenCompra(1, 2, 3, tipoUsuario);
        expect(gcRest.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/items-orden-compra/1/2/3',
            jasmine.anything()
        );

    });

    it('buscarArticulo cambia la ruta según el tipo de búsqueda', () => {
        const gcRest = TestBed.inject(RestService) as jasmine.SpyObj<RestService>;
        service.buscarPorArticulo(1, 'x', TipoBusqueda.NROITEM);
        expect(gcRest.get.calls.first().args[0]).toBe('/api/gestion-contratos/v1/items-orden-compra/filtrar-nroitem/1/x');
        service.buscarPorArticulo(2, 'y', TipoBusqueda.ARTICULO);
        expect(gcRest.get.calls.mostRecent().args[0]).toBe('/api/gestion-contratos/v1/items-orden-compra/filtrar-articulos/2/y');
    });

    it('obtenerAtributos llama al servicio con la url correcta', () => {
        const gcRest = TestBed.inject(RestService) as jasmine.SpyObj<RestService>;
        service.obtenerAtributos(1, 2, 3);
        expect(gcRest.get).toHaveBeenCalledWith('/api/gestion-contratos/v1/items-orden-compra/1/2/3/atributos/all');
    });

    it('exportarSeguimientoItemExcel envía filtros y descarga el archivo', () => {
        const gcRest = TestBed.inject(RestService) as jasmine.SpyObj<RestService>;
        const archivo = TestBed.inject(ArchivoService) as jasmine.SpyObj<ArchivoService>;
        const params = { idOC: 5, filtro: { nroItem: 1, descripcionArticulo: 'abc', estado: 'pendiente' } };
        service.exportarSeguimientoItemExcel(params as any);
        expect(gcRest.post).toHaveBeenCalled();
        const filtroEnviado = gcRest.post.calls.mostRecent().args[1] as any;
        expect(filtroEnviado.estadoItem).toBe('PENDIENTE');
        expect(archivo.descargar).toHaveBeenCalled();
    });

    it('exportarSeguimientoItemExcel omite el estado cuando no se indica', () => {
        const gcRest = TestBed.inject(RestService) as jasmine.SpyObj<RestService>;
        const archivo = TestBed.inject(ArchivoService) as jasmine.SpyObj<ArchivoService>;
        const params = { idOC: 6, filtro: { nroItem: 2, descripcionArticulo: 'xyz' } };
        service.exportarSeguimientoItemExcel(params as any);
        const filtroEnviado = gcRest.post.calls.mostRecent().args[1] as any;
        expect(filtroEnviado.estadoItem).toBeUndefined();
        expect(archivo.descargar).toHaveBeenCalled();
    });

    describe('obtenerUnidades', () => {
        it('devuelve entregas cuando el tipo es entrega', () => {
            const item = crearItem({ tipoCantidad: TipoCantidad.ENTREGA });
            expect(service.obtenerUnidades(item)).toBe('(entregas)');
        });

        it('devuelve entregables cuando el tipo es entregable', () => {
            const item = crearItem({ tipoCantidad: TipoCantidad.ENTREGABLE });
            expect(service.obtenerUnidades(item)).toBe('(entregables)');
        });

        it('prioriza las entregas cuando se cuenta por entregas', () => {
            const item = crearItem({ tipoCantidad: TipoCantidad.ITEM });
            expect(service.obtenerUnidades(item, true)).toBe('(entregas)');
        });

        it('retorna la unidad formateada cuando no es entrega', () => {
            const item = crearItem({ descUnidadMedida: 'unidades', cantidadTotalMostrar: 5 });
            expect(service.obtenerUnidades(item)).toBe('(unidades)');
        });
    });

    describe('cantidades y formatos', () => {
        it('cantidadesPendienteEntregaYTotal formatea valores y unidad', () => {
            const item = crearItem({ cantidadPendienteEntrega: 3.5, cantidadTotal: 12, cantidadTotalMostrar: 12 });
            const decimalPipe = new DecimalPipe('es');
            const pendiente = decimalPipe.transform(item.cantidadPendienteEntrega ?? item.cantidad, '1.0-20', 'es');
            const total = decimalPipe.transform(item.cantidadTotal ?? item.cantidad, '1.0-20', 'es');
            expect(service.cantidadesPendienteEntregaYTotal(item)).toBe(`${pendiente} de ${total} (kg)`);
        });

        it('cantidadesPendienteRecepcionYTotal usa entregas para unidades cuando es entregable', () => {
            const item = crearItem({ tipoCantidad: TipoCantidad.ENTREGABLE, cantidadPendienteRecepcion: 2, cantidadTotalPendienteRecepcion: 5 });
            const decimalPipe = new DecimalPipe('es');
            const pendiente = decimalPipe.transform(item.cantidadPendienteRecepcion, '1.0-20', 'es');
            const total = decimalPipe.transform(item.cantidadTotalPendienteRecepcion, '1.0-20', 'es');
            expect(service.cantidadesPendienteRecepcionYTotal(item)).toBe(`${pendiente} de ${total} (entregas)`);
        });

        it('cantidadesPendienteConformidadYTotal respeta la unidad del item', () => {
            const item = crearItem({ descUnidadMedida: 'metros', cantidadTotalMostrar: 3, cantidadPendienteConformidad: 1, cantidadTotalPendienteConformidad: 3 });
            const decimalPipe = new DecimalPipe('es');
            const pendiente = decimalPipe.transform(item.cantidadPendienteConformidad, '1.0-20', 'es');
            const total = decimalPipe.transform(item.cantidadTotalPendienteConformidad, '1.0-20', 'es');
            expect(service.cantidadesPendienteConformidadYTotal(item)).toBe(`${pendiente} de ${total} (metros)`);
        });

        it('cantidadesPendienteAsignarEntregaYTotal usa la cantidad cuando faltan datos', () => {
            const item = crearItem({ tipoCantidad: TipoCantidad.ENTREGA, cantidad: 7, cantidadPendienteAsignar: undefined, cantidadTotalMostrar: undefined, cantidadTotal: undefined });
            const decimalPipe = new DecimalPipe('es');
            const pendiente = decimalPipe.transform(item.cantidadPendienteAsignar ?? item.cantidad, '1.0-20', 'es');
            const total = decimalPipe.transform(item.cantidadTotalMostrar ?? item.cantidad, '1.0-20', 'es');
            expect(service.cantidadesPendienteAsignarEntregaYTotal(item)).toBe(`${pendiente} de ${total} (kg)`);
        });

        it('cantidadesPendienteEntregaYTotalEntregable muestra porcentaje para unidades porcentuales', () => {
            const item = crearItem({ cantidadPendienteEntrega: 20, cantidadTotal: 80, tipoUnidad: TipoUnidad.PORCENTAJE });
            const decimalPipe = new DecimalPipe('es');
            const pendiente = decimalPipe.transform(item.cantidadPendienteEntrega ?? item.cantidad, '1.0-20', 'es');
            const total = decimalPipe.transform(item.cantidadTotal ?? item.cantidad, '1.0-20', 'es');
            expect(service.cantidadesPendienteEntregaYTotalEntregable(item)).toBe(`${pendiente} de ${total} %`);
        });

        it('cantidadesPendienteAsignarEntregaYTotal retorna porcentaje cuando corresponde', () => {
            const item = crearItem({ tipoUnidad: TipoUnidad.PORCENTAJE, cantidadPendienteAsignar: 15, cantidadTotalMostrar: 30 });
            const decimalPipe = new DecimalPipe('es');
            const pendiente = decimalPipe.transform(item.cantidadPendienteAsignar ?? item.cantidad, '1.0-20', 'es');
            const total = decimalPipe.transform(item.cantidadTotalMostrar ?? item.cantidad, '1.0-20', 'es');
            const esperado = `${pendiente} de ${total} %`;
            expect(service.cantidadesPendienteAsignarEntregaYTotal(item)).toBe(esperado);
        });

        it('cantidadesPendienteEntregaYTotalEntregable usa la unidad del item cuando aplica', () => {
            const item = crearItem({ cantidadPendienteEntrega: 6, cantidadTotal: 9, tipoUnidad: TipoUnidad.CANTIDAD, descUnidadMedida: 'paquetes' });
            const decimalPipe = new DecimalPipe('es');
            const pendiente = decimalPipe.transform(item.cantidadPendienteEntrega ?? item.cantidad, '1.0-20', 'es');
            const total = decimalPipe.transform(item.cantidadTotal ?? item.cantidad, '1.0-20', 'es');
            expect(service.cantidadesPendienteEntregaYTotalEntregable(item)).toBe(`${pendiente} de ${total} (paquetes)`);
        });
    });
});
