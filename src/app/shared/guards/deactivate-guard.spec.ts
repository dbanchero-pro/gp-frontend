import { TestBed } from '@angular/core/testing';
import { DeactivateGuard } from './deactivate-guard';
import { ActualizarService } from '../services/common/actualizar.service';

class MockComponent {
    canDeactivate() {
        return false;
    }
}

describe('DeactivateGuard', () => {
    let guard: DeactivateGuard;
    let service: jasmine.SpyObj<ActualizarService>;

    beforeEach(() => {
        service = jasmine.createSpyObj('ActualizarService', ['confirmar']);
        TestBed.configureTestingModule({
            providers: [
                DeactivateGuard,
                { provide: ActualizarService, useValue: service },
            ],
        });
        guard = TestBed.inject(DeactivateGuard);
    });

    it('solicita confirmación si el componente no puede desactivarse', async () => {
        let confirmCb: () => void = () => {};
        service.confirmar.and.callFake((_m: any, ok: () => void) => {
            confirmCb = ok;
        });
        const promise = guard.canDeactivate(
            new MockComponent() as any,
            null as any,
            null as any,
        );
        confirmCb();
        const res = await promise;
        expect(res).toBeTrue();
        expect(service.confirmar).toHaveBeenCalled();
    });

    it('retorna true directo si el componente permite salir', async () => {
        const comp = { canDeactivate: () => true } as any;
        const res = await guard.canDeactivate(comp, null as any, null as any);
        expect(res).toBeTrue();
        expect(service.confirmar).not.toHaveBeenCalled();
    });

    it('retorna true si el componente no implementa canDeactivate', () => {
        const res = guard.canDeactivate({} as any, null as any, null as any);
        expect(res).toBeTrue();
        expect(service.confirmar).not.toHaveBeenCalled();
    });
});
