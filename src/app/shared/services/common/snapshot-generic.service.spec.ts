import { SnapshotGenericService } from './snapshot-generic.service';

describe('SnapshotGenericService', () => {
    let service: SnapshotGenericService;

    beforeEach(() => {
        service = new SnapshotGenericService();
        sessionStorage.clear();
    });

    it('guarda y carga datos correctamente', () => {
        service.save('clave', { a: 1 });
        expect(service.load('clave')).toEqual({ a: 1 });
    });

    it('devuelve null cuando no hay datos almacenados', () => {
        expect(service.load('inexistente')).toBeNull();
    });

    it('elimina datos almacenados', () => {
        service.save('clave', { a: 1 });
        service.clear('clave');
        expect(service.load('clave')).toBeNull();
    });
});
