import { TestBed } from '@angular/core/testing';
import { FormatoCiPipe } from './formato-ci.pipe';

describe('FormatoCiPipe', () => {
    let pipe: FormatoCiPipe;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [FormatoCiPipe] });
        pipe = TestBed.inject(FormatoCiPipe);
    });

    it('formatea la cedula agregando puntos y guion', () => {
        expect(pipe.transform('1234567')).toBe('123.456-7');
        expect(pipe.transform('12345678')).toBe('1.234.567-8');
        expect(pipe.transform(1234567)).toBe('123.456-7');
    });
});
