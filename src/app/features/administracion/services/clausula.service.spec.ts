import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ClausulaService } from './clausula.service';

describe('ClausulaService', () => {
    let service: ClausulaService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ClausulaService);
    });

    it('deberia crearse', () => {
        expect(service).toBeTruthy();
    });

    it('obtiene catalogos para filtros de clausula', fakeAsync(() => {
        let filtros: any;
        service.obtenerFiltrosClausula().subscribe((resp) => {
            filtros = resp;
        });
        tick(200);

        expect(filtros).toBeTruthy();
        expect(filtros.incisos.length).toBeGreaterThan(0);
        expect(filtros.tiposCompra.length).toBeGreaterThan(0);
        expect(filtros.familias.length).toBeGreaterThan(0);
    }));

    it('retorna clausulas con redacciones en los mocks base', fakeAsync(() => {
        let clausulas: any[] = [];

        service.buscarClausulas({} as any).subscribe((resp) => {
            clausulas = resp;
        });
        tick(300);

        expect(clausulas.length).toBeGreaterThan(0);
        expect(
            clausulas.some((c) => (c.redacciones || []).length > 0),
        ).toBeTrue();
    }));

    it('retorna modelos vinculados con colecciones cargadas', fakeAsync(() => {
        let modelos: any[] = [];

        service.obtenerModelosPorClausula(1).subscribe((resp) => {
            modelos = resp;
        });
        tick(300);

        expect(modelos.length).toBeGreaterThan(0);
        expect(modelos.every((m) => (m.secciones || []).length > 0)).toBeTrue();
        expect(
            modelos.every((m) => (m.tiposCompra || []).length > 0),
        ).toBeTrue();
    }));
});
