import { TestBed } from '@angular/core/testing';
import { Pais } from '../enum/pais.enum';
import { IdProveedorPipe } from './id-proveedor.pipe';

describe('IdProveedorPipe', () => {
    let pipe: IdProveedorPipe;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [IdProveedorPipe] });
        pipe = TestBed.inject(IdProveedorPipe);
    });

    it('retorna cadena vacía para undefined', () => {
        expect(pipe.transform(undefined)).toBe('');
    });

    it('concatena id y RUT', () => {
        expect(
            pipe.transform({
                paisDocumento: {
                    id: Pais.URUGUAY,
                    descripcion: 'Uruguay',
                },
                nroDocumento: '213409900014',
                tipoDocumento: 'RUT',
                nombre: 'KICKSTART S R L',
            }),
        ).toBe('UY-RUT-213409900014');
    });

    it('elimina guiones y convierte el resto a minúsculas', () => {
        expect(pipe.transform(undefined)).toBe('');
    });
});
