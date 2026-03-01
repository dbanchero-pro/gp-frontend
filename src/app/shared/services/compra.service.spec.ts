import { HttpParams } from '@angular/common/http';
import { of } from 'rxjs';
import { CompraService } from './compra.service';

class MockGcRestService {
    lastUrl = '';
    lastParams: HttpParams | undefined;
    get(url: string, params?: HttpParams) {
        this.lastUrl = url;
        this.lastParams = params;
        return of({ content: [], totalElements: 0 });
    }
    post(url: string, data: any, params?: HttpParams) {
        this.lastUrl = url;
        this.lastParams = params;
        return of(null);
    }
}

describe('CompraService', () => {
    let service: CompraService;
    let rest: MockGcRestService;

    beforeEach(() => {
        rest = new MockGcRestService();
        service = new CompraService(rest as any);
    });

    it('obtenerCompraPorId debería llamar get con el id', () => {
        service.obtenerCompraPorId(5).subscribe();
        expect(rest.lastUrl).toBe('/api/gestion-contratos/v1/compra/5');
    });

    it('mapearColumnaOrdenamiento mapea claves conocidas', () => {
        expect(
            (service as any).mapearColumnaOrdenamiento('idUnidadCompra'),
        ).toBe('unidadCompra.id.idUnidadCompra');
    });

    it('mapearColumnaOrdenamiento mapea columnas conocidas y valor por defecto', () => {
        const service = new CompraService({} as any);
        expect((service as any).mapearColumnaOrdenamiento('idInciso')).toBe(
            'unidadCompra.id.unidadEjecutora.id.inciso.id',
        );
        expect((service as any).mapearColumnaOrdenamiento('unknown')).toBe(
            'unidadCompra.id.unidadEjecutora.id.inciso.id',
        );
    });

    it('obtenerCompras debería construir parámetros y mapear la respuesta', () => {
        rest.get = ((url: string, params?: HttpParams) => {
            rest.lastUrl = url;
            rest.lastParams = params;
            return of({ content: ['a'], totalElements: 2 });
        }) as any;
        service
            .obtenerCompras({
                filtro: {
                    idInciso: 1,
                    idUnidadEjecutora: 2,
                    idUnidadCompra: 3,
                    numCompra: 4,
                    anioCompra: 2024,
                    nroItem: 5,
                    codArticulo: 6,
                    descripcionArticulo: 'test',
                },
                pagina: 2,
                tamanoPagina: 10,
                sort: 'idUnidadCompra',
                order: 'desc',
            })
            .subscribe((res) => {
                expect(res.contenido).toEqual(['a' as any]);
                expect(res.totalElementos).toBe(2);
            });

        expect(rest.lastUrl).toBe('/api/gestion-contratos/v1/compra/all');

        const p = rest.lastParams as HttpParams;
        expect(p.get('page')).toBe('2');
        expect(p.get('size')).toBe('10');
        expect(p.get('sort')).toBe('unidadCompra.id.idUnidadCompra,desc');
        expect(p.get('idInciso')).toBe('1');
        expect(p.get('idUnidadEjecutora')).toBe('2');
        expect(p.get('idUnidadCompra')).toBe('3');
        expect(p.get('numeroCompra')).toBe('4');
        expect(p.get('anioCompra')).toBe('2024');
        expect(p.get('numeroItem')).toBe('5');
        expect(p.get('codArticulo')).toBe('6');
        expect(p.get('descripcionArticulo')).toBe('test');
    });
});
