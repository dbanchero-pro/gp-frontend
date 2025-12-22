import { HttpParams } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { RestService } from 'src/app/shared/services/common/rest.service';
import { IPuntoRecepcionDTO } from '../models/punto-recepcion.model';
import { PuntosRecepcionService } from './puntosRecepcion.service';

describe('PuntosRecepcionService', () => {
    let service: PuntosRecepcionService;
    let gcRestSpy: jasmine.SpyObj<RestService>;
    let archivoServiceSpy: jasmine.SpyObj<ArchivoService>;


    beforeEach(() => {
        gcRestSpy = jasmine.createSpyObj('GcRestService', [
            'get',
            'post',
            'put',
            'patch',
        ]);

        archivoServiceSpy = jasmine.createSpyObj('ArchivoService', [
            'descargar',
        ]);

        TestBed.configureTestingModule({
            providers: [
                PuntosRecepcionService,
                { provide: RestService, useValue: gcRestSpy },
                { provide: ArchivoService, useValue: archivoServiceSpy },
            ],
        });

        service = TestBed.inject(PuntosRecepcionService);
    });

    it('debería llamar a obtenerPuntosRecepcion con HttpParams correctos', () => {
        gcRestSpy.get.and.returnValue(of([]));

        const params = {
            page: 0,
            size: 10,
            sort: 'nombre',
            order: 'asc',
            idInciso: 1,
            idUnidadEjecutora: 2,
            idUnidadCompra: 3,
            nombre: 'Central',
            direccion: 'Calle Falsa 123',
            eliminados: false,
            idZona: 5,
        };

        const expectedParams = new HttpParams()
            .set('page', '0')
            .set('size', '10')
            .set('sort', 'nombre,asc')
            .set('idInciso', '1')
            .set('idUnidadEjecutora', '2')
            .set('idUnidadCompra', '3')
            .set('nombre', 'Central')
            .set('direccion', 'Calle Falsa 123')
            .set('idZona', '5');

        service.obtenerPuntosRecepcion(params).subscribe();

        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/all',
            expectedParams
        );
    });

    it('debería obtener punto por ID', () => {
        gcRestSpy.get.and.returnValue(of({}));

        service.obtenerPuntoRecepcion(42).subscribe();

        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/42'
        );
    });

    it('debería guardar un punto de recepción', () => {
        const punto = {} as IPuntoRecepcionDTO;
        gcRestSpy.post.and.returnValue(of({}));

        service.altaPuntoRecepcion(punto).subscribe();

        expect(gcRestSpy.post).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion',
            punto
        );
    });

    it('debería modificar un punto de recepción', () => {
        const punto = {} as IPuntoRecepcionDTO;
        gcRestSpy.put.and.returnValue(of({}));

        service.modificarPuntoRecepcion(99, punto).subscribe();

        expect(gcRestSpy.put).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/99',
            punto
        );
    });

    it('debería dar de baja un punto de recepción', () => {
        gcRestSpy.patch.and.returnValue(of({}));

        service.inhabilitarPuntoRecepcion(77).subscribe();

        expect(gcRestSpy.patch).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/77/inhabilitar'
        );
    });

    it('debería habilitar un punto de recepción', () => {
        gcRestSpy.patch.and.returnValue(of({}));

        service.habilitarPuntoRecepcion(55).subscribe();

        expect(gcRestSpy.patch).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/55/habilitar'
        );
    });

    it('debería exportar excel de puntos de recepción', () => {
        const archivo = {
            contenido: 'YWJj',
            mimeType: 'text/plain',
            nombre: 'file.txt',
        };
        gcRestSpy.post.and.returnValue(of(archivo));
       
        service.exportarExcelPuntosRecepcion({ a: 1 });

        expect(gcRestSpy.post).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/excel',
            { a: 1 }
        );
        expect(archivoServiceSpy.descargar).toHaveBeenCalled();

    });

    it('debería obtener puntos de recepción sin permiso de usuario', () => {
        gcRestSpy.get.and.returnValue(of([]));
        const params = {
            page: 1,
            size: 5,
            sort: 'nombre',
            order: 'desc',
            idZona: 2,
        };
        service
            .obtenerPuntosRecepcionSinPermisoUsuario(params, 'user1')
            .subscribe();
        const expected = new HttpParams()
            .set('page', '1')
            .set('size', '5')
            .set('sort', 'nombre,desc')
            .set('idZona', '2')
            .set('idUsuario', 'user1');
        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/all-sin-permiso-usuario',
            expected
        );
    });

    it('debería obtener puntos de recepción sin parámetros', () => {
        gcRestSpy.get.and.returnValue(of([]));
        service.obtenerPuntosRecepcion({}).subscribe();
        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/all',
            new HttpParams()
        );
    });

    it('debería manejar sort sin order', () => {
        gcRestSpy.get.and.returnValue(of([]));
        service.obtenerPuntosRecepcion({ sort: 'nombre' }).subscribe();
        const expected = new HttpParams().set('sort', 'nombre');
        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/all',
            expected
        );
    });

    it('debería exportar excel sin contenido', () => {
        const archivo = { nombre: 'f', mimeType: 't/plain' } as any;
        gcRestSpy.post.and.returnValue(of(archivo));
        service.exportarExcelPuntosRecepcion({});
        expect(archivoServiceSpy.descargar).toHaveBeenCalled();
    });

    it('debería obtener puntos sin permiso sin idUsuario', () => {
        gcRestSpy.get.and.returnValue(of([]));
        service.obtenerPuntosRecepcionSinPermisoUsuario({}, undefined).subscribe();
        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/all-sin-permiso-usuario',
            new HttpParams()
        );
    });

    it('debería armar todos los parámetros en obtenerPuntosRecepcionSinPermisoUsuario', () => {
        gcRestSpy.get.and.returnValue(of([]));
        const params = {
            page: 0,
            size: 10,
            sort: 'nombre',
            order: 'asc',
            idInciso: 1,
            idUnidadEjecutora: 2,
            idUnidadCompra: 3,
            nombrePuntoRecepcion: 'p',
            direccion: 'd',
            inhabilitados: true,
            idZona: 5,
        };
        service.obtenerPuntosRecepcionSinPermisoUsuario(params, 'user').subscribe();
        const expected = new HttpParams()
            .set('page', '0')
            .set('size', '10')
            .set('sort', 'nombre,asc')
            .set('idUnidadEjecutora', '2')
            .set('idInciso', '1')
            .set('nombre', 'p')
            .set('idUnidadCompra', '3')
            .set('inhabilitados', 'true')
            .set('direccion', 'd')
            .set('idZona', '5')
            .set('idUsuario', 'user');
        expect(gcRestSpy.get).toHaveBeenCalledWith(
            '/api/gestion-contratos/v1/puntos-recepcion/all-sin-permiso-usuario',
            expected
        );
    });
});
