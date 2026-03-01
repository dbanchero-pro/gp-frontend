import { TestBed } from '@angular/core/testing';
import { ReqErrorHandlerService } from './req-error-handler.service';

describe('ReqErrorHandlerService', () => {
    let service: ReqErrorHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [ReqErrorHandlerService],
        });

        service = TestBed.inject(ReqErrorHandlerService);
    });

    it('debería crearse', () => {
        expect(service).toBeTruthy();
    });

    it('debería emitir mensaje de error al ejecutar show', () => {
        const errorMessage = 'Test error message';
        spyOn(console, 'error'); // Espía el método console.error para asegurarnos de que sea llamado

        service.evShowError.subscribe((emittedErrorMessage) => {
            expect(emittedErrorMessage).toBe(errorMessage);
        });

        service.show(errorMessage);

        // Verifica que console.error haya sido llamado con el mensaje de error
        expect(console.error).toHaveBeenCalledWith(errorMessage);
    });
});
