import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RestService } from './common/rest.service';
import { ZonaService } from './zona.service';

describe('ZonaService', () => {
    let service: ZonaService;
    let gcRestSpy: jasmine.SpyObj<RestService>;

    beforeEach(() => {
        gcRestSpy = jasmine.createSpyObj('GcRestService', ['get']);
        TestBed.configureTestingModule({
            providers: [
                ZonaService,
                { provide: RestService, useValue: gcRestSpy },
            ],
        });
        service = TestBed.inject(ZonaService);
    });

    it('debería obtener todas las zonas', () => {
        const mockZonas = [
            { id: 1, descripcionZona: 'Zona 1' },
            { id: 2, descripcionZona: 'Zona 2' },
        ];

        gcRestSpy.get.and.returnValue(of(mockZonas));

        service.obtenerZonas().subscribe((zonas) => {
            expect(zonas.length).toBe(2);
            expect(zonas[0].descripcionZona).toBe('Zona 1');
            expect(zonas[1].descripcionZona).toBe('Zona 2');
        });

        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/zonas/all',
        );
    });
});
