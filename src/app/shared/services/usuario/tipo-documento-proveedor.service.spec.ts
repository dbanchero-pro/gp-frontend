import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Pais } from '../../enum/pais.enum';
import { TipoDocumentoUsuario } from '../../enum/tipo-documento-usuario.enum';
import { PageModel } from '../../models/common/page/page.model';
import { ITipoDocumentoProveedorDTO } from '../../models/proveedor/tipo-documento-proveedor.model';
import { RestService } from '../common/rest.service';
import { TipoDocumentoProveedorService } from './tipo-documento-proveedor.service';

describe('TipoDocumentoProveedorService', () => {
    let service: TipoDocumentoProveedorService;
    let gcRestSpy: jasmine.SpyObj<RestService>;

    beforeEach(() => {
        gcRestSpy = jasmine.createSpyObj('GcRestService', ['get']);
        TestBed.configureTestingModule({
            providers: [
                TipoDocumentoProveedorService,
                { provide: RestService, useValue: gcRestSpy },
            ],
        });
        service = TestBed.inject(TipoDocumentoProveedorService);
    });

    it('obtiene tipos de documento con filtros', () => {
        gcRestSpy.get.and.returnValue(
            of({} as PageModel<ITipoDocumentoProveedorDTO>),
        );
        service
            .obtenerTiposDocumentoProveedor(
                1,
                50,
                'id,asc',
                Pais.URUGUAY,
                TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            )
            .subscribe();

        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/tipos-documento-proveedor/all',
            jasmine.any(HttpParams),
        );

        const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
        expect(params.get('page')).toBe('1');
        expect(params.get('idTipoDocumento')).toBe(
            TipoDocumentoUsuario.CEDULA_IDENTIDAD,
        );
    });

    it('usa valores por defecto cuando no hay filtros', () => {
        gcRestSpy.get.and.returnValue(
            of({} as PageModel<ITipoDocumentoProveedorDTO>),
        );
        service.obtenerTiposDocumentoProveedor().subscribe();
        const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
        expect(params.get('page')).toBe('0');
        expect(params.get('size')).toBe('20');
        expect(params.get('sort')).toBe('id,asc');
    });

    it('obtiene todos los documentos', () => {
        const mock: PageModel<ITipoDocumentoProveedorDTO> = {
            content: [
                { tipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD },
            ] as any,
        } as any;
        gcRestSpy.get.and.returnValue(of(mock));
        service.obtenerTodos().subscribe((res) => {
            expect(res[0].tipoDocumento).toBe(
                TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            );
        });
    });
});
