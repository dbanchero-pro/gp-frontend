import { Injector } from '@angular/core';
import { InjectorHolder } from './injector-holder';

describe('InjectorHolder', () => {
    it('debe almacenar y recuperar el injector', () => {
        const mockInjector = {
            get: jasmine.createSpy('get').and.returnValue('works'),
        } as unknown as Injector;
        InjectorHolder.setInjector(mockInjector);
        const result = InjectorHolder.get('token');
        expect(result).toBe('works');
        expect(mockInjector.get).toHaveBeenCalledWith('token');
    });
});
