import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '@env/gc/environment';
import { AppConfig } from './app.config';
import { IAppConfig } from './shared/models/common/app-config.model';

const mockConfig: IAppConfig = {
    apiCargaMasivaUrl: '/carga',
    apiUrl: '/api',
    keycloak: { url: 'u', realm: 'r', clientId: 'c' },
    extensionesPermitidas: 'pdf',
    urlBaseFrontEnd: '/front',
    loggingLevel: 'Debug',
    archivosCantidadMax: 10,
    archivosTamanoMaxBytes: 1000000,
    contenidoInicio: ''
};

describe('AppConfig', () => {
    let service: AppConfig;
    let http: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [],
            providers: [AppConfig, provideRouter([]),
            provideHttpClient(),
            provideHttpClientTesting(),]
        });
        service = TestBed.inject(AppConfig);
        http = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        http.verify();
    });

    it('carga el archivo de configuración por defecto', fakeAsync(() => {
        environment.nombre = '';
        let done = false;
        service.load().then(() => { done = true; });

        const req = http.expectOne('./assets/config.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockConfig);
        tick();

        expect(done).toBeTrue();
        expect(AppConfig.settings).toEqual(mockConfig);
    }));

    it('carga la configuración del ambiente específico', fakeAsync(() => {
        environment.nombre = 'beta';
        service.load();
        const req = http.expectOne('./assets/config-beta.json');
        expect(req.request.method).toBe('GET');
        req.flush(mockConfig);
        tick();
        expect(AppConfig.settings).toEqual(mockConfig);
    }));

    it('rechaza cuando la solicitud falla', fakeAsync(() => {
        environment.nombre = '';
        let error: any;
        service.load().catch(e => error = e);
        const req = http.expectOne('./assets/config.json');
        req.error(new ProgressEvent('error'));
        tick();
        expect(error).toBeTruthy();
    }));
});
