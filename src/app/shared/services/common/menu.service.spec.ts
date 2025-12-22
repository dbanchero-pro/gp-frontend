import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { of } from 'rxjs';
import { MenuService } from 'src/app/shared/services/common/menu.service';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TipoUsuario } from '../../enum/tipo-usuario.enum';
import { SeguridadService } from './seguridad.service';

describe('MenuService', () => {
    let service: MenuService;
    let seguridadServiceMock = {
        obtenerPermisos(): string[] {
            return [];
        },
        obtenerTipoUsuario(): TipoUsuario {
            return TipoUsuario.ORGANISMO; // Valor por defecto para las pruebas
        },
        cambiarTipoUsuario(tipo: TipoUsuario): void {}
    }
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [],
            providers: [
                { provide: SeguridadService, useValue: seguridadServiceMock },
                {
                    provide: Router,
                    useValue: {
                        url: '/gestion-contratos/',
                        events: of(new NavigationEnd(0, '/gestion-contratos/', '/gestion-contratos/')),
                        navigate: jasmine.createSpy('navigate'),
                    },
                },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        service = new MenuService(
            TestBed.inject(Router),
            TestBed.inject(SeguridadService)
        );
    });

    beforeEach(() => {
        spyOn(service as any, 'obtenerItem').and.returnValue({});
    });

    it('debería crearse', () => {
        expect(service).toBeTruthy();
    });

    it('filtra el menú según los permisos otorgados', () => {
        expect(service.obtenerMenu(['GC_GESTION_USU.ALTA'], TipoUsuario.ORGANISMO).length).toEqual(1);
    });

    it('se chequea permiso', () => {
        let seguridadService: SeguridadService =
            TestBed.inject(SeguridadService);
        spyOn(seguridadService, 'obtenerPermisos').and.returnValue(['GC_GESTION_USU_P.CONSULTA']);
        expect(service.tienePermisoUrl('/administracion/gestion-usuarios/consulta-usuario-proveedor', TipoUsuario.PROVEEDOR)).toBeTrue();
    });
    it('se chequea no se tiene permiso', () => {
        let seguridadService: SeguridadService =
            TestBed.inject(SeguridadService);
        spyOn(seguridadService, 'obtenerPermisos').and.returnValue(['XXXX']);
        expect(service.tienePermisoUrl('/administracion/gestion-usuarios/consulta-usuario-proveedor')).toBeFalse();
    });


    it('filtrarMenu()', () => {
        let seguridadService: SeguridadService =
            TestBed.inject(SeguridadService);
        let router: Router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/gestion-contratos/ver-contratos';
        spyOn(seguridadService, 'obtenerPermisos').and.returnValue([
            'ANIOS_PAC.CONSULTA',
        ]);
        expect(
            service.filtrarMenu(
                [
                    {
                        nombre: 'Administración',
                        items: [
                            {
                                nombre: 'Gestionar Días',
                                permisos: undefined,
                                url: '/restricciones',
                            },
                            {
                                nombre: 'Gestionar Incisos',
                                permisos: [],
                                url: '/incisos',
                            },
                        ],
                    },
                ],
                []
            )
        ).toBeTruthy();
    });


    it('debería devolver un item personalizado con URL directa', () => {
        const seguridadService = TestBed.inject(SeguridadService);
        spyOn(seguridadService, 'obtenerPermisos').and.returnValue(['TEST.PERMISO']);

        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/test-directo';

        // Creamos instancia manual con override
        const mockMenuService = new MenuService(router, seguridadService);

        // @ts-ignore
        spyOn(mockMenuService as any, 'obtenerMenuItems').and.returnValue([
            {
                nombre: 'Test Item',
                titulo: 'Test Título',
                subtitulo: 'Test Subtítulo',
                url: '/test-directo',
                visible: true,
                permisos: ['TEST.PERMISO'],
            }
        ]);

        const item = mockMenuService.obtenerItem();

        expect(item).not.toBeNull();
        expect(item?.nombre).toBe('Test Item');
        expect(item?.url).toBe('/test-directo');
        expect(item?.titulo).toBe('Test Título');
        expect(item?.subtitulo).toBe('Test Subtítulo');
    });

    it('debería devolver null si no hay subitem que coincida con la URL', () => {
        const seguridadService = TestBed.inject(SeguridadService);
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/ruta-inexistente';

        const nuevoService = new MenuService(router, seguridadService);
        // @ts-ignore
        spyOn(nuevoService, 'obtenerItem').and.returnValue({ items: [] });

        const subItem = nuevoService.obtenerSubItem();

        expect(subItem).toBeNull();
    });

    it('obtenerSubItem2 y obtenerSubItem3 detectan segmentos', () => {
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/algo/agregar';
        expect(service.obtenerSubItem2()).toEqual({ nombre: 'Agregar', url: null });

        // @ts-ignore
        router.url = '/algo/modificar';
        expect(service.obtenerSubItem2()).toEqual({ nombre: 'Modificar', url: null });
    });

    it('obtenerItemMasAbajo retorna el item mas profundo', () => {
        // @ts-ignore
        service.obtenerMenuItems = () => [{
            nombre: 'Padre', visible: true, items: [
                { nombre: 'Hijo', url: '/padre/hijo', visible: true }
            ]
        }];
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/padre/hijo';
        const item = service.obtenerItemMasAbajo('/padre/hijo');
        expect(item?.nombre).toBe('Hijo');
    });

    it('tienePermisoItemsPorUrl detecta URL en items anidados', () => {
        const items = [{ nombre: 'padre', items: [{ nombre: 'hijo', url: '/x/y' }] }];
        expect(service.tienePermisoItemsPorUrl(items as any, '/x/y')).toBeTrue();
        expect(service.tienePermisoItemsPorUrl(items as any, '/z')).toBeFalse();
    });

    it('obtenerItem encuentra urls en nietos', () => {
        // @ts-ignore
        service.obtenerMenuItems = () => [{ nombre: 'p', items: [{ items: [{ url: '/deep' }] }] }];
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/deep';
        const item = service.obtenerItem();
        expect(item).not.toBeNull();
    });

    it('obtenerSubItem2PorUrl reconoce agregar y listado', () => {
        const router = TestBed.inject(Router);

        // Caso 1: /algo/agregar
        // @ts-ignore
        router.url = '/algo/agregar';
        const res1 = (service as any).obtenerSubItem2PorUrl('/algo');
        expect(res1).toEqual({ nombre: 'Agregar', url: null });

        // Caso 2: /final/listar-procedimiento-compra-ver-publicado
        // @ts-ignore
        router.url = '/final/listar-procedimiento-compra-ver-publicado';
        const res2 = (service as any).obtenerSubItem2PorUrl('/final');
        expect(res2).toEqual({ nombre: 'Listado Procedimientos de Compra', url: null });
    });

    it('obtenerSubItem2PorUrl maneja caso ajuste-plan', () => {
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/ajuste-plan/x/listar';
        const res = (service as any).obtenerSubItem2PorUrl('/ajuste-plan');
        expect(res).toEqual({ nombre: 'Listado Ajustes de Procedimientos de Compra', url: null });
    });

    it('hayMasEspecifica detecta URLs más específicas', () => {
        spyOn(service, 'obtenerItemMasAbajo').and.returnValue({ url: '/padre/hijo' } as any);
        expect(service.hayMasEspecifica('/padre')).toBeTrue();
    });

    it('hayMasEspecifica retorna false cuando la URL coincide', () => {
        spyOn(service, 'obtenerItemMasAbajo').and.returnValue({ url: '/algo' } as any);
        expect(service.hayMasEspecifica('/algo')).toBeFalse();
    });

    it('obtenerMenu para proveedor ignora permisos', () => {
        const res = service.obtenerMenu([], TipoUsuario.PROVEEDOR);
        expect(res.length).toBeGreaterThan(0);
    });

    it('filtrarMenu ignora permisos cuando corresponde', () => {
        const items: any = [{ nombre: 'A', permisos: ['X'] }];
        const res = service.filtrarMenu(items, [], true);
        expect(res.length).toBe(1);
    });

    it('filtrarMenu excluye items sin subitems permitidos', () => {
        const items: any = [{ nombre: 'P', items: [{ nombre: 'H', permisos: ['A'] }] }];
        const res = service.filtrarMenu(items, []);
        expect(res.length).toBe(0);
    });

    it('tienePermisoUrl retorna false cuando no hay permisos', () => {
        const seguridadService = TestBed.inject(SeguridadService);
        spyOn(seguridadService, 'obtenerPermisos').and.returnValue([]);
        spyOn(service, 'obtenerItemMasAbajo').and.returnValue({ permisos: ['X'] } as any);
        expect(service.tienePermisoUrl('/algo')).toBeFalse();
    });

    it('tienePermisoUrl retorna false cuando no encuentra item', () => {
        const seguridadService = TestBed.inject(SeguridadService);
        spyOn(seguridadService, 'obtenerPermisos').and.returnValue(['X']);
        spyOn(service, 'obtenerItemMasAbajo').and.returnValue(null as any);
        expect(service.tienePermisoUrl('/algo')).toBeFalse();
    });

    it('filtrarMenu devuelve item con permisos coincidentes', () => {
        const items: any = [{ nombre: 'A', permisos: ['P'] }];
        const res = service.filtrarMenu(items, ['P']);
        expect(res.length).toBe(1);
    });

    it('filtrarMenu no devuelve item sin permisos coincidentes', () => {
        const items: any = [{ nombre: 'A', permisos: ['P'] }];
        const res = service.filtrarMenu(items, ['Q']);
        expect(res.length).toBe(0);
    });

    it('filtrarPorTipoUsuario filtra según el tipo', () => {
        const items: any = [
            { nombre: 'A', tipoUsuario: TipoUsuario.PROVEEDOR },
            { nombre: 'B', tipoUsuario: TipoUsuario.ORGANISMO }
        ];
        const res = service.filtrarPorTipoUsuario(items, TipoUsuario.PROVEEDOR);
        expect(res.length).toBe(1);
        expect(res[0].nombre).toBe('A');
    });

    it('tienePermisoItemsPorUrl recorre hijos sin url', () => {
        const items = [{ items: [{ url: '/a' }] }];
        expect(service.tienePermisoItemsPorUrl(items as any, '/a')).toBeTrue();
    });

  it('obtenerItem con ruta de tres segmentos y sin coincidencias devuelve null', () => {
        // @ts-ignore
        (service.obtenerItem as jasmine.Spy).and.callThrough();
        // @ts-ignore
        spyOn(service as any, 'obtenerMenuItems').and.returnValue([]);
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/uno/dos/tres';
        expect(service.obtenerItem()).toBeNull();
    });

    it('obtenerItemMasAbajo retorna item cuando la URL comienza igual', () => {
        // @ts-ignore
        spyOn(service as any, 'obtenerMenuItems').and.returnValue([{ nombre: 'Padre', url: '/padre' }]);
        const item = service.obtenerItemMasAbajo('/padre/hijo');
        expect(item?.url).toBe('/padre');
    });

    it('obtenerSubItem2 reconoce responsables', () => {
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/puntos-recepcion/responsables';
        expect(service.obtenerSubItem2()).toEqual({ nombre: 'Responsables', url: null });
    });

    it('obtenerSubItem2 reconoce consulta de proveedor', () => {
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/administracion/gestion-usuarios/consulta-usuario-proveedor';
        expect(service.obtenerSubItem2()).toEqual({ nombre: 'Proveedor', url: null });
    });

    it('obtenerSubItem2PorUrl detecta responsables', () => {
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/puntos-recepcion/responsables';
        // @ts-ignore
        (service.obtenerItem as jasmine.Spy).and.returnValue({});
        const res = (service as any).obtenerSubItem2PorUrl('/puntos-recepcion');
        expect(res).toEqual({ nombre: 'Responsables', url: null });
    });

    it('obtenerSubItem2PorUrl detecta edición numérica', () => {
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/algo/123';
        // @ts-ignore
        (service.obtenerItem as jasmine.Spy).and.returnValue({});
        const res = (service as any).obtenerSubItem2PorUrl('/algo');
        expect(res).toEqual({ nombre: 'Editar', url: null });
    });

    it('obtenerSubItem2PorUrl detecta modificar', () => {
        const router = TestBed.inject(Router);
        // @ts-ignore
        router.url = '/algo/modificar';
        // @ts-ignore
        (service.obtenerItem as jasmine.Spy).and.returnValue({});
        const res = (service as any).obtenerSubItem2PorUrl('/algo');
        expect(res).toEqual({ nombre: 'Modificar', url: null });
    });

  it('debería ignorar permisos al filtrar el menú', () => {
    const items: any = [{ nombre: 'Privado', permisos: ['P'], url: '/privado' }];
    const resultado = service.filtrarMenu(items, [], true);
    expect(resultado.length).toBe(1);
  });

  it('obtenerSubItem2 reconoce agregar', () => {
    const router = TestBed.inject(Router);
    // @ts-ignore
    router.url = '/entregas/agregar';
    expect(service.obtenerSubItem2()).toEqual({ nombre: 'Agregar', url: null });
  });

  it('obtenerSubItem2 devuelve null cuando no hay coincidencias', () => {
    const router = TestBed.inject(Router);
    // @ts-ignore
    router.url = '/sin/coincidencias';
    expect(service.obtenerSubItem2()).toBeNull();
  });

  it('obtenerSubItem2PorUrl devuelve null cuando coincide exactamente', () => {
    const router = TestBed.inject(Router);
    // @ts-ignore
    router.url = '/gestion';
    (service.obtenerItem as jasmine.Spy).and.returnValue({});
    const res = (service as any).obtenerSubItem2PorUrl('/gestion');
    expect(res).toBeNull();
  });

  it('obtenerSubItem2PorUrl detecta listado de procedimientos de compra', () => {
    const router = TestBed.inject(Router);
    // @ts-ignore
    router.url = '/ajustes/listar-procedimiento-compra';
    (service.obtenerItem as jasmine.Spy).and.returnValue({});
    const res = (service as any).obtenerSubItem2PorUrl('/ajustes');
    expect(res).toEqual({ nombre: 'Listado Procedimientos de Compra', url: null });
  });

  it('obtenerSubItem2PorUrl detecta listado de ajustes de procedimiento', () => {
    const router = TestBed.inject(Router);
    // @ts-ignore
    router.url = '/ajuste-plan/abc/detalle';
    (service.obtenerItem as jasmine.Spy).and.returnValue({});
    const res = (service as any).obtenerSubItem2PorUrl('/ajuste-plan');
    expect(res).toEqual({ nombre: 'Listado Ajustes de Procedimientos de Compra', url: null });
  });

  it('filtrarPorTipoUsuario devuelve vacío cuando no se indica tipo', () => {
    const items: any = [{ nombre: 'A', tipoUsuario: TipoUsuario.PROVEEDOR }];
    expect(service.filtrarPorTipoUsuario(items, undefined).length).toBe(0);
  });

  it('filtrarPorTipoUsuario filtra hijos compatibles', () => {
    const items: any = [{
      nombre: 'Padre',
      tipoUsuario: TipoUsuario.AMBOS,
      items: [
        { nombre: 'Proveedor', tipoUsuario: TipoUsuario.PROVEEDOR },
        { nombre: 'Organismo', tipoUsuario: TipoUsuario.ORGANISMO }
      ]
    }];
    const res = service.filtrarPorTipoUsuario(items, TipoUsuario.PROVEEDOR);
    expect(res.length).toBe(1);
    expect(res[0].items?.length).toBe(1);
    expect(res[0].items?.[0].nombre).toBe('Proveedor');
  });

  it('urlEnNietos retorna false cuando no hay coincidencias', () => {
    const menu: any = { items: [{ items: [{ url: '/otro' }] }] };
    expect((service as any).urlEnNietos(menu, '/sin-match')).toBeFalse();
  });


});
