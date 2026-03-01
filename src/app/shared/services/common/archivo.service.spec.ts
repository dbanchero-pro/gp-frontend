import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { IArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { ArchivoService } from './archivo.service';
import { RestService } from './rest.service';

describe('ArchivoService', () => {
    let service: ArchivoService;
    let gcRestSpy: jasmine.SpyObj<RestService>;

    beforeEach(() => {
        gcRestSpy = jasmine.createSpyObj('GcRestService', ['get']);

        TestBed.configureTestingModule({
            providers: [
                ArchivoService,
                { provide: RestService, useValue: gcRestSpy },
            ],
        });

        service = TestBed.inject(ArchivoService);
    });

    it('debería instanciarse correctamente', () => {
        expect(service).toBeTruthy();
    });

    it('debería llamar al endpoint correcto al obtener archivo por ID', () => {
        const mockArchivo: IArchivoDTO = {
            id: 1,
            nombre: 'archivo.txt',
            contenido: 'Y29udGVuaWRv',
            mimeType: 'text/plain',
        };

        gcRestSpy.get.and.returnValue(of(mockArchivo));

        service.obtener(1).subscribe((res) => {
            expect(res).toEqual(mockArchivo);
        });

        expect(gcRestSpy.get).toHaveBeenCalledWith('/api/v1/archivos/1');
    });

    it('debería crear un blob y simular la descarga de un archivo', () => {
        const archivo: IArchivoDTO = {
            id: 1,
            nombre: 'test.txt',
            contenido: btoa('Hola mundo'),
            mimeType: 'text/plain',
        };

        const createObjectURLSpy = spyOn(
            window.URL,
            'createObjectURL',
        ).and.returnValue('blob:url');
        const clickSpy = jasmine.createSpy('click');
        spyOn(document, 'createElement').and.callFake(() => {
            return {
                set href(val: string) {
                    this._href = val;
                },
                set download(val: string) {
                    this._download = val;
                },
                click: clickSpy,
            } as any;
        });

        service.descargar(archivo);

        expect(createObjectURLSpy).toHaveBeenCalled();
        expect(clickSpy).toHaveBeenCalled();
    });

    it('no debería hacer nada si el contenido es undefined', () => {
        const archivo: IArchivoDTO = {
            id: 1,
            nombre: 'sincontenido.txt',
            contenido: undefined,
            mimeType: 'text/plain',
        };

        const createSpy = spyOn(window.URL, 'createObjectURL');
        service.descargar(archivo);

        expect(createSpy).not.toHaveBeenCalled();
    });
});
