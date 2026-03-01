import { TestBed } from '@angular/core/testing';
import { DocumentoProveedorPipe } from './documento-proveedor.pipe';

describe('DocumentoProveedorPipe', () => {
    let pipe: DocumentoProveedorPipe;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [DocumentoProveedorPipe] });
        pipe = TestBed.inject(DocumentoProveedorPipe);
    });

    it('formatea correctamente tipo, nro y pais', () => {
        const prov: any = {
            tipoDocumento: 'RUT',
            nroDocumento: '23812831823',
            paisDocumento: { descripcion: 'Uruguay' },
        };
        expect(pipe.transform(prov)).toBe('RUT 23812831823 Uruguay');
    });

    it('devuelve vacío si no hay proveedor', () => {
        expect(pipe.transform(undefined)).toBe('');
    });

    it('maneja campos faltantes', () => {
        const prov: any = { tipoDocumento: 'RUT' };
        expect(pipe.transform(prov)).toBe('RUT');
    });
});
