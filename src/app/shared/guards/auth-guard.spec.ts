import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { KeycloakService } from 'keycloak-angular'; //NOSONAR
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { TipoUsuario } from '../enum/tipo-usuario.enum';
import { IAppConfig } from '../models/common/app-config.model';
import { IMenuItem } from '../models/common/menu-item.model';
import { AuthRawService } from '../services/common/auth-raw-service';
import { MenuService } from '../services/common/menu.service';
import { SeguridadService } from '../services/common/seguridad.service';
import { AuthGuard } from './auth-guard';
class MockRouter {
    navigateByUrl(url: string) {
        return url;
    }
    parseUrl(url: string): UrlTree {
        return new UrlTree();
    }
}

class MockAuthRawService {
    getToken() {
        return of('mocked-token');
    }

    login(options: any) {
        // Simula el inicio de sesión
     }
}


class MockMenuService {
    tienePermisoUrl(url: string) {
        // Simula la lógica de permisos de tu aplicación
        return true;
    }
    obtenerItemMasAbajo(url: string): IMenuItem | undefined {
        return { titulo: 'Mocked Item', subtitulo: 'Mocked Subitem', nombre: 'nombre'  };
    }
}

class MockSeguridadService {
    cargarPermisos() {
        return Promise.resolve();
    }
    obtenerTipoUsuario(): TipoUsuario {
        return TipoUsuario.ORGANISMO; // Valor por defecto para las pruebas
    }
    cambiarTipoUsuario(tipo: TipoUsuario): void {
        //mock
    }
}
class AppConfigStub {
    static readonly settings: IAppConfig = {
        apiCargaMasivaUrl: '',
        apiUrl: '',
        keycloak: {
            url: 'http://localhost',
            realm: 'realm',
            clientId: 'clientId',
        },
        extensionesPermitidas: 'pdf',
        urlBaseFrontEnd: '',
        loggingLevel: 'DEBUG',
        archivosCantidadMax: 10,
        archivosTamanoMaxBytes: 1000000,
        contenidoInicio: ''
    };
}
describe('AuthGuard', () => {
    let guard: AuthGuard;
    let authRawService: AuthRawService;
    let menuService: MenuService;
    let activatedRouteSnapshot: ActivatedRouteSnapshot;
    let routerStateSnapshot: RouterStateSnapshot;

    beforeEach(() => {
        AppConfig.settings = AppConfigStub.settings;
        
        TestBed.configureTestingModule({
            imports: [],
            providers: [
                AuthGuard,
                { provide: Router, useClass: MockRouter },
                { provide: AuthRawService, useClass: MockAuthRawService },
                { provide: KeycloakService, useClass: MockAuthRawService }, //NOSONAR
                { provide: MenuService, useClass: MockMenuService },
                { provide: SeguridadService, useClass: MockSeguridadService },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ]
        });

        guard = TestBed.inject(AuthGuard);
        authRawService = TestBed.inject(AuthRawService);
        menuService = TestBed.inject(MenuService);

        // Configura snapshot de ruta para las pruebas
        activatedRouteSnapshot = {} as ActivatedRouteSnapshot;
        routerStateSnapshot = {} as RouterStateSnapshot;
    });

    it('debe crearse', () => {
        expect(guard).toBeTruthy();
    });

    it('debe retornar true si el usuario tiene acceso', fakeAsync(() => {
        spyOn(authRawService, 'getToken').and.returnValue(Promise.resolve('mocked-token'));
        spyOn(menuService, 'tienePermisoUrl').and.returnValue(true);

        let result: any;
        guard.isAccessAllowed(activatedRouteSnapshot, routerStateSnapshot).then((res: any) => (result = res));
        tick(2000);

        expect(result).toBeTrue();
    }));

    it('debe redirigir a 403 cuando no tiene permiso', fakeAsync(() => {
        spyOn(authRawService, 'getToken').and.returnValue(Promise.resolve('mocked-token'));
        spyOn(menuService, 'tienePermisoUrl').and.returnValue(false);
        let result: any;
        guard.isAccessAllowed(activatedRouteSnapshot, routerStateSnapshot).then((res: any) => result = res);
        tick(2000);
        expect(result instanceof UrlTree).toBeTrue();
    }));

    it('debe iniciar sesión si el usuario no está autenticado', fakeAsync(() => {
        spyOn(authRawService, 'getToken').and.returnValue(Promise.resolve(''));
        spyOn(authRawService, 'login');

        guard.isAccessAllowed(activatedRouteSnapshot, routerStateSnapshot);
        tick(2000);
        expect(authRawService.login).toHaveBeenCalled();
    }));

    it('debe permitir acceso luego de reintentar obtener el token', fakeAsync(() => {
        spyOn(authRawService, 'getToken').and.returnValues(Promise.resolve(''), Promise.resolve('retry-token'));
        spyOn(menuService, 'tienePermisoUrl').and.returnValue(true);
        let result: any;
        guard.isAccessAllowed(activatedRouteSnapshot, routerStateSnapshot).then((res: any) => result = res);
        tick(2000);
        expect(result).toBeTrue();
    }));

    it('debe redirigir si falta el token luego del reintento', fakeAsync(() => {
        spyOn(authRawService, 'getToken').and.returnValue(Promise.resolve(''));
        spyOn(menuService, 'tienePermisoUrl').and.returnValue(false);
        let result: any;
        guard.isAccessAllowed(activatedRouteSnapshot, routerStateSnapshot).then(res => result = res);
        tick(2000);
        expect(result instanceof UrlTree).toBeTrue();
    }));
});
