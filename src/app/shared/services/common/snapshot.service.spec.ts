import { SnapshotService } from './snapshot.service';

describe('SnapshotService', () => {
    let service: SnapshotService;
    beforeEach(() => {
        service = new SnapshotService();
        sessionStorage.clear();
    });

    it('debería guardar y cargar datos', () => {
        service.save({ a: 1 });
        expect(service.load()).toEqual({ a: 1 });
    });

    it('debería limpiar los datos', () => {
        service.save({ a: 1 });
        service.clear();
        expect(service.load()).toBeNull();
    });
});
