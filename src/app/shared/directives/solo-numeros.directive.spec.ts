import { SoloNumerosDirective } from './solo-numeros.directive';

describe('SoloNumerosDirective', () => {
    it('evita ingresar caracteres no numéricos', () => {
        const directive = new SoloNumerosDirective();
        const event: any = {
            key: 'a',
            code: 65,
            preventDefault: jasmine.createSpy(),
        };
        directive.onKeyPress(event);
        expect(event.preventDefault).toHaveBeenCalled();
    });

    it('permite ingresar números', () => {
        const directive = new SoloNumerosDirective();
        const event: any = {
            key: '5',
            code: 50,
            preventDefault: jasmine.createSpy(),
        };
        directive.onKeyPress(event);
        expect(event.preventDefault).not.toHaveBeenCalled();
    });
});
