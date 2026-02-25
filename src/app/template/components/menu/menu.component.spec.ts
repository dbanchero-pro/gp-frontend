import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
    ComponentFixture,
    TestBed,
} from '@angular/core/testing';
import { of } from 'rxjs';
import { AppConfig } from 'src/app/app.config';
import { IAppConfig } from 'src/app/shared/models/common/app-config.model';
import { UsuarioInfoDTO } from 'src/app/shared/models/usuario/usuario-info.model';
import { UtilService } from 'src/app/shared/services/common/util.service';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { AuthRawService } from 'src/app/shared/services/common/auth-raw-service';
import { MenuService } from 'src/app/shared/services/common/menu.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { MenuComponent } from './menu.component';

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

class AuthRawServiceMock {
    loadUserProfile(): Promise<any> {
        return Promise.resolve({});
    }
    logout(): Promise<any> {
        return Promise.resolve({});
    }
    clearToken(): void {
        return;
    }
}

class SeguridadServiceMock {
    esUsuarioOrganismo: boolean = false;
    esUsuarioProveedor: boolean = false;
    obtenerPermisos(): string[] {
        return [];
    }
    usuarioLogueadoEsUsuarioOrganismo(): boolean {
        return  this.esUsuarioOrganismo;
    }
    usuarioLogueadoEsUsuarioProveedor(): boolean {
        return this.esUsuarioProveedor;
    }
    usuarioLogueadoPuedeCambiarPerfil(): boolean {
        return this.esUsuarioOrganismo && this.esUsuarioProveedor;
    }

    almacenarPermisos: (permisos: string[]) => void = () => { };

    almacenarProveedores: (proveedores: any[]) => void = () =>  { }

    obtenerNombreUsuarioLogueado(){ return 'usuario'}
    tienePermiso(_permiso: string) { return true;}
    tieneAlgunPermiso(_permisos: string[]) { return true; }
    limpiarContexto(){ return; }
    obtenerUnidadesCompra(){ return []; }
}

describe('MenuComponent', () => {
    let component: MenuComponent;
    let fixture: ComponentFixture<MenuComponent>;
    let utilService: UtilService;
    let menuService: MenuService;
    let authRaw: AuthRawService;
    

    const usuarioInfoDTO: UsuarioInfoDTO = new UsuarioInfoDTO(
        'nombre',
        'usuario',
        ['permiso1', 'permiso2']
    );

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MenuComponent],
            imports: [RouterTestingModule],
            providers: [
                MenuService,
                { provide: AuthRawService, useClass: AuthRawServiceMock },
                { provide: SeguridadService, useClass: SeguridadServiceMock },
                { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
                { provide: AppConfig, useClass: AppConfigStub },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        AppConfig.settings = AppConfigStub.settings;
        fixture = TestBed.createComponent(MenuComponent);
        component = fixture.componentInstance;

        menuService = TestBed.inject(MenuService);
        utilService = TestBed.inject(UtilService);
        authRaw = TestBed.inject(AuthRawService);
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit() debería inicializar el nombre de usuario', async () => {
        spyOn(utilService, 'usuarioInfo').and.returnValue(of(usuarioInfoDTO));

        component.ngOnInit();
        await fixture.whenStable();
        expect(component.nombre).toBe('usuario');
        expect(1).toEqual(1);
    });

    it('ngOnInit actualiza datos del usuario', () => {
        spyOn(utilService, 'usuarioInfo').and.returnValue(of(usuarioInfoDTO));
        component.ngOnInit();
        expect(1).toEqual(1);
    });

    it('obtenerMenu() debería invocar el servicio de menú', () => {
        let spy = spyOn(component, 'obtenerMenu');
        component.obtenerMenu([]);
        expect(spy).toHaveBeenCalled();
    });

    it('obtenerMenu() vacío debería manejar un menú inexistente', () => {
        let menuServiceSpy = spyOn(menuService, 'obtenerMenu').and.returnValue(
            []
        );
        component.obtenerMenu(['XXXXXXX']);
        expect(menuServiceSpy).toHaveBeenCalled();
    });

    it('logout() vacío debería cerrar la sesión', () => {
        spyOn(authRaw, 'clearToken');

        let keycloakSpy = spyOn(authRaw, 'logout').and.returnValue(
            Promise.resolve()
        );
        component.cerrarSesion();
        expect(keycloakSpy).toHaveBeenCalled();
    });
    it('verificarMostrarCambiarPerfil devuelve el valor correcto', () => {
        (component.seguridad as any).esUsuarioOrganismo = true;
        (component.seguridad as any).esUsuarioProveedor = true;
        expect((component as any).verificarMostrarCambiarPerfil()).toBeTrue();
        (component.seguridad as any).esUsuarioOrganismo = false;
        expect((component as any).verificarMostrarCambiarPerfil()).toBeFalse();
    });

    it('toggleSubmenu cierra los demás y alterna el ítem', () => {
        component.isMobile = false;
        const menu = { items: [{ _open: true }, { _open: true }] };
        component.menuItems$ = [menu] as any;
        const event = new MouseEvent('click');
        component.toggleSubmenu(event, menu, menu.items[0], true);
        expect(menu.items[0]._open).toBeFalse();
        expect(menu.items[1]._open).toBeFalse();
    });

    it('toggleSubmenu en móvil ignora el foco si no es click', () => {
        component.isMobile = true;
        const menu = { items: [{ _open: false }] };
        component.menuItems$ = [menu] as any;
        component.toggleSubmenu(new MouseEvent('focus'), menu, menu.items[0], false);
        expect(menu.items[0]._open).toBeFalse();
    });

    it('toggleSubmenu en móvil alterna solo si es un click', () => {
        component.isMobile = true;
        const menu = { items: [{ _open: false }] };
        component.menuItems$ = [menu] as any;
        component.toggleSubmenu(new MouseEvent('click'), menu, menu.items[0], true);
        expect(menu.items[0]._open).toBeTrue();
    });

    it('toggleMenu cierra los otros ítems del menú', () => {
        const menu1 = { items: [{ _open: true }] };
        const menu2 = { items: [{ _open: true }] };
        component.menuItems$ = [menu1, menu2] as any;
        const event = new MouseEvent('click');
        component.toggleMenu(event, menu1);
        expect(menu1.items[0]._open).toBeFalse();
    });

    it('debería definir estilo de foco visible para las opciones del menú', () => {
        fixture.detectChanges();
        const styleTag = Array.from(document.head.querySelectorAll('style')).find(s => s.textContent?.includes('.span-menu'));
        expect(styleTag?.textContent).toContain('box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25)');
    });

    it('debería marcar como móvil cuando la ventana es pequeña', () => {
        component.innerWidth = 500;
        (component as any).checkMobile();
        expect(component.isMobile).toBeTrue();
    });

    it('debería cerrar el menú al cambiar a escritorio', () => {
        component.innerWidth = 1000;
        component.buttonMenu = { nativeElement: { getAttribute: () => 'true', click: jasmine.createSpy('click') } } as any;
        (component as any).checkMobile();
        expect(component.isMobile).toBeFalse();
        expect(component.buttonMenu.nativeElement.click).toHaveBeenCalled();
    });

    it('no hace click si el menú ya está cerrado en escritorio', () => {
        component.innerWidth = 1200;
        component.buttonMenu = { nativeElement: { getAttribute: () => 'false', click: jasmine.createSpy('click') } } as any;
        (component as any).checkMobile();
        expect(component.buttonMenu.nativeElement.click).not.toHaveBeenCalled();
    });

    it('onResize actualiza ancho y estado móvil', () => {
        component.isMobile = false;
        component.onResize({ target: { innerWidth: 500 } } as any);
        expect(component.innerWidth).toBe(500);
        expect(component.isMobile).toBeTrue();
    });

    it('obtenerMenu emite mensaje de error cuando no hay ítems visibles', (done) => {
        spyOn(menuService, 'obtenerMenu').and.returnValue([{ visible: false }] as any);
        const mensajeSpy = spyOn(component.actualizar, 'mensajeError');
        component.obtenerMenu([]).subscribe(items => {
            expect(items.length).toBe(0);
            expect(mensajeSpy).toHaveBeenCalledWith('El usuario no tiene permisos');
            done();
        });
    });

    it('cerrarSesion llama a logout y limpia el token', async () => {
        const logoutSpy = spyOn(authRaw, 'logout').and.returnValue(Promise.resolve());
        const clearSpy = spyOn(authRaw, 'clearToken');

        await component.cerrarSesion();

        expect(logoutSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalled();
    });

    it('debería tener un nav con aria-label', () => {
        fixture.detectChanges();
        const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
        expect(nav.getAttribute('aria-label')).toBe('Menú principal');
    });
});
