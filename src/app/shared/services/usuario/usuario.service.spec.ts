import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { RestService } from '../common/rest.service';
import { UsuarioService } from './usuario.service';

describe('UsuarioService', () => {
    let service: UsuarioService;
    let gcRestSpy: jasmine.SpyObj<RestService>;

    beforeEach(() => {
        gcRestSpy = jasmine.createSpyObj('GcRestService', [
            'get',
            'post',
            'delete',
        ]);
        TestBed.configureTestingModule({
            providers: [
                UsuarioService,
                { provide: RestService, useValue: gcRestSpy },
            ],
        });
        service = TestBed.inject(UsuarioService);
    });

    it('debería obtener todos los usuarios con filtros', () => {
        gcRestSpy.get.and.returnValue(of({}));
        service
            .obtenerTodosUsuarios(1, 15, 'nombre,desc', 'AR', 'DNI', '87654321')
            .subscribe();

        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/usuarios/all',
            jasmine.any(HttpParams),
        );

        const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
        expect(params.get('page')).toBe('1');
        expect(params.get('size')).toBe('15');
        expect(params.get('sort')).toBe('nombre,desc');
        expect(params.get('idPais')).toBe('AR');
        expect(params.get('idTipoDocumento')).toBe('DNI');
        expect(params.get('nroDocumento')).toBe('87654321');
    });

    it('debería obtener usuario por ID', () => {
        gcRestSpy.get.and.returnValue(of({}));
        service.obtenerUsuarioPorId('juanito').subscribe();
        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/usuarios/juanito',
        );
    });

    it('obtenerTodosUsuarios sin filtros no agrega params extra', () => {
        gcRestSpy.get.and.returnValue(of({}));
        service.obtenerTodosUsuarios(0, 20, 'id,asc').subscribe();
        const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
        expect(params.get('idPais')).toBeNull();
        expect(params.get('idTipoDocumento')).toBeNull();
        expect(params.get('nroDocumento')).toBeNull();
    });

    it('usa valores por defecto cuando no se pasan parametros', () => {
        gcRestSpy.get.and.returnValue(of({}));
        service.obtenerTodosUsuarios().subscribe();
        const params = gcRestSpy.get.calls.mostRecent().args[1] as HttpParams;
        expect(params.get('page')).toBe('0');
        expect(params.get('size')).toBe('20');
        expect(params.get('sort')).toBe('id,asc');
    });
});
