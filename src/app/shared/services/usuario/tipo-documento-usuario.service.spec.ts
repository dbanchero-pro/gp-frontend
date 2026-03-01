import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Pais } from '../../enum/pais.enum';
import { TipoDocumentoUsuario } from '../../enum/tipo-documento-usuario.enum';
import { PageModel } from '../../models/common/page/page.model';
import { ITipoDocumentoUsuarioDTO } from '../../models/usuario/tipo-documento-usuario.model';
import { RestService } from '../common/rest.service';
import { TipoDocumentoUsuarioService } from './tipo-documento-usuario.service';

describe('TipoDocumentoUsuarioService', () => {
    let service: TipoDocumentoUsuarioService;
    let gcRestSpy: jasmine.SpyObj<RestService>;

    beforeEach(() => {
        gcRestSpy = jasmine.createSpyObj('GcRestService', ['get']);
        TestBed.configureTestingModule({
            providers: [
                TipoDocumentoUsuarioService,
                { provide: RestService, useValue: gcRestSpy },
            ],
        });
        service = TestBed.inject(TipoDocumentoUsuarioService);
    });

    it('debería obtener tipos de documento con filtros', () => {
        gcRestSpy.get.and.returnValue(
            of({} as PageModel<ITipoDocumentoUsuarioDTO>),
        );
        service
            .obtenerTiposDocumentoUsuario(
                1,
                50,
                'nombre,asc',
                Pais.URUGUAY,
                TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            )
            .subscribe();

        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/tipos-documento-usuario/all',
            jasmine.any(HttpParams),
        );

        const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
        expect(params.get('page')).toBe('1');
        expect(params.get('size')).toBe('50');
        expect(params.get('sort')).toBe('nombre,asc');
        expect(params.get('idPais')).toBe(Pais.URUGUAY);
        expect(params.get('idTipoDocumento')).toBe(
            TipoDocumentoUsuario.CEDULA_IDENTIDAD,
        );
    });

    it('usa valores por defecto cuando no se pasan filtros', () => {
        gcRestSpy.get.and.returnValue(
            of({} as PageModel<ITipoDocumentoUsuarioDTO>),
        );
        service.obtenerTiposDocumentoUsuario().subscribe();
        const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
        expect(params.get('page')).toBe('0');
        expect(params.get('size')).toBe('20');
        expect(params.get('sort')).toBe('id.idTipoDocumento,asc');
    });

    it('debería obtener todos los tipos de documento', () => {
        const mockPage: PageModel<ITipoDocumentoUsuarioDTO> = {
            content: [
                {
                    idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
                    descripcion: 'Cédula',
                },
            ] as ITipoDocumentoUsuarioDTO[],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 1000,
            numberOfElements: 1,
            first: true,
            last: true,
            sort: {
                sorted: false,
                unsorted: false,
                empty: false,
            },
            page: 0,
            empty: false,
        };

        gcRestSpy.get.and.returnValue(of(mockPage));

        service.obtenerTodos().subscribe((result) => {
            expect(result.length).toBe(1);
            expect(result[0].idTipoDocumento).toBe(
                TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            );
        });

        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/tipos-documento-usuario/all',
            jasmine.any(HttpParams),
        );
    });

    it('debería obtener todos los tipos de documento para UY', () => {
        const mockPage: PageModel<ITipoDocumentoUsuarioDTO> = {
            content: [
                {
                    idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
                    descripcion: 'Cédula',
                },
            ] as ITipoDocumentoUsuarioDTO[],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 1000,
            numberOfElements: 1,
            first: true,
            last: true,
            sort: {
                sorted: false,
                unsorted: false,
                empty: false,
            },
            page: 0,

            empty: false,
        };

        gcRestSpy.get.and.returnValue(of(mockPage));

        service.obtenerTodosUY().subscribe((result) => {
            expect(result.length).toBe(1);
            expect(result[0].idTipoDocumento).toBe(
                TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            );
        });

        const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
        expect(params.get('idPais')).toBe(Pais.URUGUAY);
    });
});
