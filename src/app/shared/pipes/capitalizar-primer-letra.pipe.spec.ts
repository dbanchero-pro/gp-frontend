import { TestBed } from '@angular/core/testing';
import { CapitalizarPrimerLetraPipe } from './capitalizar-primer-letra.pipe';

describe('CapitalizeFirtsLetterPipe', () => {
    let pipe: CapitalizarPrimerLetraPipe;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [CapitalizarPrimerLetraPipe],
        });
        pipe = TestBed.inject(CapitalizarPrimerLetraPipe);
    });

    it('retorna cadena vacía para undefined', () => {
        expect(pipe.transform(undefined)).toBe('');
    });

    it('capitaliza la primera letra', () => {
        expect(pipe.transform('hola')).toBe('Hola');
    });

    it('elimina guiones y pone en minúscula el resto', () => {
        expect(pipe.transform('hOLA-MUNDO')).toBe('Hola-mundo');
    });
});
