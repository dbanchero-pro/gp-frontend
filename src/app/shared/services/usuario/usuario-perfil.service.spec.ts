import { of } from 'rxjs';
import { UsuarioOrganismoPerfilService } from './usuario-perfil.service';

class MockGcRestService {
    lastUrl = '';
    lastParams: any;
    get(url: string, params: any) {
        this.lastUrl = url;
        this.lastParams = params;
        return of(null);
    }
    post(url: string, data: any, params: any) {
        this.lastUrl = url;
        this.lastParams = params;
        return of(true);
    }
    delete(url: string) {
        this.lastUrl = url;
        return of(true);
    }
}

class ArchivoServiceMock {
    descargar(archivo: any): void {
        // Mock implementation for testing
    }
}

describe('UsuarioOrganismoPerfilService', () => {
    let service: UsuarioOrganismoPerfilService;
    let rest: MockGcRestService;
    let archivoService: ArchivoServiceMock;

    beforeEach(() => {
        rest = new MockGcRestService();
        archivoService = new ArchivoServiceMock();
        service = new UsuarioOrganismoPerfilService(
            rest as any,
            archivoService as any,
        );
    });

    it('obtenerTodos debería enviar parámetros', () => {
        service
            .obtenerTodos({ nroDocumento: '1', idInciso: 2 }, 1, 5, 'id,asc')
            .subscribe();
        expect(rest.lastUrl).toBe(
            '/api/gestion-contratos/v1/usuarios-organismo-perfil/all',
        );
        expect(rest.lastParams.get('page')).toBe('1');
        expect(rest.lastParams.get('size')).toBe('5');
        expect(rest.lastParams.get('idInciso')).toBe('2');
        expect(rest.lastParams.get('nroDocumento')).toBe('1');
    });

    it('guardar debería enviar el DTO por POST', () => {
        const dto: any = { id: '1' };
        service.guardar(dto).subscribe();
        expect(rest.lastUrl).toBe(
            '/api/gestion-contratos/v1/usuarios-organismo-perfil',
        );
    });

    it('agregarConformidadUC debería hacer POST con parámetros', () => {
        service.agregarConformidadUC(1, 2, 3, 'user').subscribe();
        expect(rest.lastUrl).toContain('agregar-conformidad-uc');
        expect(rest.lastParams.get('idInciso')).toBe('1');
    });

    it('obtenerTodos sin filtros solo envía parámetros de paginación', () => {
        service.obtenerTodos().subscribe();
        expect(rest.lastParams.get('page')).toBe('0');
        expect(rest.lastParams.get('size')).toBe('10');
        expect(rest.lastParams.get('idInciso')).toBeNull();
    });

    it('obtenerTodos incluye todos los filtros', () => {
        service
            .obtenerTodos(
                {
                    nroDocumento: '11',
                    idInciso: 1,
                    idUnidadEjecutora: 2,
                    idUnidadCompra: 3,
                    nroCompra: 4,
                    anioCompra: 2024,
                    nroItem: 5,
                    tipoPerfil: 'CONFORMIDAD',
                    idEntregable: 6,
                    idPuntoRecepcion: 7,
                },
                1,
                2,
                'id,desc',
            )
            .subscribe();
        expect(rest.lastParams.get('nroDocumento')).toBe('11');
        expect(rest.lastParams.get('idInciso')).toBe('1');
        expect(rest.lastParams.get('idUnidadEjecutora')).toBe('2');
        expect(rest.lastParams.get('idUnidadCompra')).toBe('3');
        expect(rest.lastParams.get('nroCompra')).toBe('4');
        expect(rest.lastParams.get('anioCompra')).toBe('2024');
        expect(rest.lastParams.get('nroItem')).toBe('5');
        expect(rest.lastParams.get('tipoPerfil')).toBe('CONFORMIDAD');
        expect(rest.lastParams.get('idEntregable')).toBe('6');
        expect(rest.lastParams.get('idPuntoRecepcion')).toBe('7');
    });

    it('otros métodos del servicio llaman a las URLs correctas', () => {
        service.agregarConformidadTodasUc('u1').subscribe();
        expect(rest.lastUrl).toContain('agregar-conformidad-uc-todas');
        service.agregarConformidadPorCompra(1, 'u2').subscribe();
        expect(rest.lastUrl).toContain('agregar-conformidad-compra');
        service.agregarConformidadPorItem(1, 2, 'u3').subscribe();
        expect(rest.lastUrl).toContain('agregar-conformidad-item');
        service.agregarResponsablePuntoRecepcion(5, 'u4').subscribe();
        expect(rest.lastUrl).toContain('agregar-resonsable-punto-recepcion');
        service.agregarResponsableRecepcionUC(1, 2, 3, 'u5').subscribe();
        expect(rest.lastUrl).toContain('agregar-resonsable-recepcion-uc');
        service.agregarResponsableRecepcionUCTodas('u6').subscribe();
        expect(rest.lastUrl).toContain('agregar-resonsable-recepcion-uc-todas');
        service.eliminarPerfil(9).subscribe();
        expect(rest.lastUrl).toContain(
            '/api/gestion-contratos/v1/usuarios-organismo-perfil/9',
        );
    });

    it('exportarUsuariosPerfil debería crear un blob', () => {
        spyOn(window.URL, 'createObjectURL').and.returnValue('blob:url');
        spyOn(document, 'createElement').and.returnValue({
            click: jasmine.createSpy('click'),
        } as any);
        spyOn(rest, 'post').and.callFake(
            (url: string, data: any, params: any) => {
                rest.lastUrl = url;
                rest.lastParams = params;
                return of({
                    contenido: btoa('x'),
                    mimeType: 'text/plain',
                    nombre: 'a.txt',
                } as any);
            },
        );

        service.exportarUsuariosPerfil({ idInciso: 1 });
        expect(rest.lastUrl).toContain(
            '/api/gestion-contratos/v1/usuarios-organismo-perfil/excel',
        );
    });

    it('buscarArticulos incluye filtros', () => {
        spyOn(rest, 'get').and.callThrough();
        service
            .buscarArticulos('CONFORMIDAD', {
                numCompra: '1',
                descripcionArticulo: 'x',
            })
            .subscribe();
        expect(rest.get).toHaveBeenCalled();
        expect(rest.lastParams.get('numCompra')).toBe('1');
        expect(rest.lastParams.get('descripcionArticulo')).toBe('x');
    });

    it('buscarArticulos cubre otros campos', () => {
        spyOn(rest, 'get').and.callThrough();
        service
            .buscarArticulos('CONFORMIDAD', {
                anioCompra: '2024',
                nroItem: '2',
                filtrarPorArticulo: true,
            })
            .subscribe();
        expect(rest.get).toHaveBeenCalled();
        expect(rest.lastParams.get('anioCompra')).toBe('2024');
        expect(rest.lastParams.get('nroItem')).toBe('2');
        expect(rest.lastParams.get('filtrarPorArticulo')).toBe('true');
    });
});
