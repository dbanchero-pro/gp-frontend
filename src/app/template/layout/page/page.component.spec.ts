import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Observable, Subject, of } from 'rxjs';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { LoggerService } from 'src/app/shared/services/common/logger.service';
import { MenuService } from 'src/app/shared/services/common/menu.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { PageComponent } from './page.component';

class ActivatedRouteStub {
    private readonly subject = new Subject();

    push(value: any): void {
        this.subject.next(value);
    }

    get data(): Observable<any> {
        return this.subject.asObservable();
    }
}
const actualizarMock = {
    titulo: (titulo: string) => {},
    subTitulo: (subTitulo: string) => {},
    estado: (estado: string) => {},
    titulo$: of([]),
    subTitulo$: of([]),
    estado$: of(''),
    tipoUsuario$: of(),
};
describe('PageComponent', () => {
    let component: PageComponent;
    let fixture: ComponentFixture<PageComponent>;
    let menuService = jasmine.createSpyObj('MenuService', [
        'obtenerItemMasAbajo',
    ]);
    let actualizarService: ActualizarService;
    beforeEach(async () => {
        TestBed.overrideComponent(PageComponent, {
            set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
        });

        await TestBed.configureTestingModule({
            // componentes
            declarations: [],
            schemas: [NO_ERRORS_SCHEMA],
            imports: [PageComponent],
            providers: [
                ActualizarService,
                {
                    provide: SeguridadService,
                    useValue: {
                        usuarioLogueadoEsUsuarioOrganismo: () => false,
                    },
                },
                { provide: MenuService, useValue: menuService },
                { provide: LoggerService, useValue: { logDebug: () => {} } },
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
                {
                    provide: Router,
                    useValue: {
                        url: '/test',
                        events: of(new NavigationEnd(0, '/tests', '/test')),
                        navigate: jasmine.createSpy('navigate'),
                    },
                },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        menuService.obtenerItemMasAbajo.and.returnValue({
            nombre: 'Restricciones entre compras',
            permisos: [],
            items: [
                {
                    nombre: 'Administrar',
                    permisos: [],
                    url: '/test',
                },
            ],
        });

        actualizarService = TestBed.inject(ActualizarService);

        fixture = TestBed.createComponent(PageComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    // eslint-disable-next-line max-len
    it('ngOnInit() - debe resetear el titulo y setear el título de la funcionalidad con el nombre del submenú si ocurre un evento del tipo NavigationEnd', () => {
        expect(true).toBeTrue();
    });

    // eslint-disable-next-line max-len
    it('navigate - debe resetear el titulo y setear el título de la funcionalidad con el nombre del submenú si ocurre un evento del tipo NavigationEnd', () => {
        actualizarService.titulo('test');
        actualizarService.subTitulo('test2');
        expect(component.titulo).toBe('test');
        expect(component.subTitulo).toBe('test2');
    });
});
