import { TestBed } from '@angular/core/testing';
import { NumeroCompraPipe } from './nro-compra-pipe';

describe('NumeroCompraPipe', () => {
    let pipe: NumeroCompraPipe;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [NumeroCompraPipe] });
        pipe = TestBed.inject(NumeroCompraPipe);
    });

    it('formatea número y año', () => {
        expect(pipe.transform({ numCompra: 3, anioCompra: 2024 })).toBe(
            '3/2024',
        );
    });

    it('maneja ausencia de año', () => {
        expect(pipe.transform({ numCompra: 5 })).toBe('5');
    });

    it('retorna vacío para null', () => {
        expect(pipe.transform(null)).toBe('');
    });
});
