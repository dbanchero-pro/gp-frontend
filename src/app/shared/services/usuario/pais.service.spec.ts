import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Pais } from '../../enum/pais.enum';
import { RestService } from '../common/rest.service';
import { PaisService } from './pais.service';

describe('PaisService', () => {
    let service: PaisService;
    let gcRestSpy: jasmine.SpyObj<RestService>;

    beforeEach(() => {
        gcRestSpy = jasmine.createSpyObj('GcRestService', ['get']);
        TestBed.configureTestingModule({
            providers: [
                PaisService,
                { provide: RestService, useValue: gcRestSpy },
            ],
        });
        service = TestBed.inject(PaisService);
    });

    it('debería obtener todos los países sin paginar', () => {
        const mockResponse = {
            content: [
                { id: Pais.URUGUAY, nombre: 'Uruguay' },
                { id: 'AR', nombre: 'Argentina' },
            ],
        };
        gcRestSpy.get.and.returnValue(of(mockResponse));

        service.obtenerTodos().subscribe((paises) => {
            expect(paises.length).toBe(2);
            expect(paises[0].id).toBe(Pais.URUGUAY);
            expect(paises[1].id).toBe('AR');
        });
    });

    it('debería obtener todos los países paginados', () => {
        gcRestSpy.get.and.returnValue(of({}));

        const page = 1;
        const size = 10;
        const sort = 'nombre,asc';

        service.obtenerPaises(page, size, sort).subscribe();

        const call = gcRestSpy.get.calls.mostRecent();
        expect(call.args[0]).toBe('/api/gestion-contratos/v1/paises/all');

        const params = call.args[1] as HttpParams;
        expect(params.get('page')).toBe('1');
        expect(params.get('size')).toBe('10');
        expect(params.get('sort')).toBe('nombre,asc');
    });

    it('debería usar los valores por defecto al paginar', () => {
        gcRestSpy.get.and.returnValue(of({}));
        service.obtenerPaises().subscribe();
        const call = gcRestSpy.get.calls.mostRecent();
        const params = call.args[1] as HttpParams;
        expect(params.get('page')).toBe('0');
        expect(params.get('size')).toBe('20');
        expect(params.get('sort')).toBe('id,asc');
    });
});
