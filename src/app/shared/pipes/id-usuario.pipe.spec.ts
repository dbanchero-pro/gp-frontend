import { TestBed } from '@angular/core/testing';
import { IdUsuarioPipe } from './id-usuario.pipe';

describe('IdUsuarioPipe', () => {
    let pipe: IdUsuarioPipe;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [IdUsuarioPipe] });
        pipe = TestBed.inject(IdUsuarioPipe);
    });

    it('retorna cadena vacía para undefined', () => {
        expect(pipe.transform(undefined)).toBe('');
    });

    it('convierte a mayúsculas', () => {
        expect(pipe.transform('hola')).toBe('HOLA');
    });

    it('elimina guiones y mantiene mayúsculas', () => {
        expect(pipe.transform('hOLA-MUnDO')).toBe('HOLA-MUNDO');
    });
});
