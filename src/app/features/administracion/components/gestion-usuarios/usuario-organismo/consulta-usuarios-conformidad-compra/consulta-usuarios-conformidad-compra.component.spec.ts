import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxEditorModule } from 'ngx-editor';
import { of } from 'rxjs';
import { CabezalConsultaComponent } from 'src/app/shared/components/cabezal-consulta/cabezal-consulta.component';
import { FiltroItemsArticulosComponent } from 'src/app/shared/components/filtro-items-articulos/filtro-items-articulos.component';
import { FiltroOrganismoComponent } from 'src/app/shared/components/filtro-organismo/filtro-organismo.component';
import { FiltroComponent } from 'src/app/shared/components/filtro/filtro.component';
import { PaginadoComponent } from 'src/app/shared/components/paginado/paginado.component';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { CompraSiceService } from 'src/app/shared/services/compra-sice.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { ConsultaUsuariosConformidadCompraComponent } from './consulta-usuarios-conformidad-compra.component';

describe('ConsultaUsuariosConformidadCompraComponent', () => {
    let component: ConsultaUsuariosConformidadCompraComponent;
    let actualizarService: any;
    let router: any;
    let route: any;
    let usuarioService: any;
    let tipoCompraService: any;
    let compraSiceService: any;
    let usuarioOrganismoPerfilService: any;
    let snapshotSrv: any;

    let fixture: ComponentFixture<ConsultaUsuariosConformidadCompraComponent>;
    let bsModalRef: jasmine.SpyObj<BsModalRef>;
    beforeEach(async () => {
        actualizarService = jasmine.createSpyObj('ActualizarService', [
            'confirmar',
            'mensajeCorrecto',
        ]);
        router = { navigate: jasmine.createSpy('navigate')};
        const paramMap = { get: () => null };
        route = { paramMap: of(paramMap), queryParamMap: {} };
        usuarioService = jasmine.createSpyObj(
            'UsuarioService',
            ['obtenerUsuarioPorId'],
        );
        tipoCompraService = jasmine.createSpyObj('TipoCompraService', [
            'obtenerTiposCompraSinPaginado',
        ]);
        compraSiceService = jasmine.createSpyObj('CompraSiceService', [
            'obtenerCompras',
            'obtenerItemsCompra',
        ]);
        usuarioOrganismoPerfilService = jasmine.createSpyObj(
            'UsuarioOrganismoPerfilService',
            ['agregarConformidadPorCompra', 'agregarConformidadPorItem']
        );
        snapshotSrv = jasmine.createSpyObj('SnapshotGenericService', [
            'save',
            'load',
            'clear',
        ]);

        await TestBed.configureTestingModule({
            declarations: [],
            imports: [
              ReactiveFormsModule,
              NgxEditorModule.forRoot(),
              ConsultaUsuariosConformidadCompraComponent,
              FiltroComponent,
              FiltroOrganismoComponent,
              FiltroItemsArticulosComponent,
              PaginadoComponent,
              CabezalConsultaComponent,
            ],
            providers: [
                provideHttpClientTesting(),
                {
                    provide: HttpClient,
                    useValue: jasmine.createSpyObj('HttpClient', [
                        'get',
                        'post',
                    ]),
                },
                {
                    provide: BsModalRef,
                    useValue: jasmine.createSpyObj('BsModalRef', ['hide']),
                },
                {
                    provide: BsModalService,
                    useValue: jasmine.createSpyObj('BsModalService', ['show']),
                },
                { provide: ActualizarService, useValue: actualizarService },
                { provide: Router, useValue: router },
                { provide: ActivatedRoute, useValue: route },
                {
                    provide: UsuarioService,
                    useValue: usuarioService,
                },
                { provide: TipoCompraService, useValue: tipoCompraService },
                { provide: CompraSiceService, useValue: compraSiceService },
                {
                    provide: UsuarioOrganismoPerfilService,
                    useValue: usuarioOrganismoPerfilService,
                },
                { provide: SnapshotGenericService, useValue: snapshotSrv },
                { provide: Location, useValue: { path: () => '/p?volver=1', replaceState: jasmine.createSpy('replaceState') } },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(
            ConsultaUsuariosConformidadCompraComponent
        );
        component = fixture.componentInstance;
    });

    it('debe alternar las clases de colapso', () => {
        component.aplicarColapso();
        expect(component.colFiltro).toBe('col-lg-1');
        expect(component.colTabla).toBe('col-lg-11');
        component.aplicarColapso();
        expect(component.colFiltro).toBe('col-lg-3');
        expect(component.colTabla).toBe('col-lg-9');
    });

    it('debe actualizar el filtro base en onFiltroOrganismo', () => {
        component.form.addControl('filtroBase', new FormControl());
        component.cambiarFiltro({ test: 1 });
        expect(component.form.get('filtroBase')?.value).toEqual(null);
    });

    it('dividirNroAnioCompra debe parsear un valor válido', () => {
        const res = component['dividirNroAnioCompra']('12/2025');
        expect(res).toEqual({ numCompra: 12, anioCompra: 2025 });
    });

    it('dividirNroAnioCompra debe devolver un objeto vacío para un valor inválido', () => {
        const res = component['dividirNroAnioCompra']('abc');
        expect(res).toEqual({});
    });

    it('nuevaConsulta debe reiniciar los campos', () => {
        component.total = 10;
        component.parametros.pagina = 2;
        component.form.addControl('filtroBase', new FormControl());
        component.nuevaConsulta();
        expect(component.parametros.pagina).toBe(0);
        expect(component.total).toBe(-1);
    });

    it('volver navega a consulta principal', () => {
        component.volver();
        expect(router.navigate).toHaveBeenCalledWith(
            ['/administracion/gestion-usuarios/consulta-usuario-conformidad'],
            { queryParams: { volver: '1' } }
        );
    });

    it('obtenerAcciones devuelve accion agregar por compra', () => {
        const compra = {
            idCompra: 1,
            tipoCompra: { id: 1, nombre: 'Compra' },
        } as any;
        const acciones = component.obtenerAcciones(compra);
        expect(acciones[0].nombre).toContain('Agregar a toda la compra');
    });

    it('obtenerUsuario carga datos desde servicio', (done) => {
        route.paramMap = of({ get: () => '1' } as any);
        usuarioService.obtenerUsuarioPorId.and.returnValue(
            of({
                id: 'uy-ci-1',
                nombre: 'Test',
                nroDocumento: '12345678',
                pais: {},
                tipoDocumento: {},
            })
        );
        component.obtenerUsuario('123123');
        setTimeout(() => {
            expect(component.usuario.nroDocumento).toBe('12345678');
            done();
        });
    });

    it('cargarTiposCompra llena lista', () => {
        tipoCompraService.obtenerTiposCompraSinPaginado.and.returnValue(
            of([{ id: 1 }])
        );
        component.cargarTiposCompra();
        expect(component.tiposCompra.length).toBe(1);
    });

    it('agregarPermisoPorCompra ejecuta servicio si confirma', () => {
        const compra = { idCompra: 5 } as any;
        component.usuario = { id: 10 } as any;
        actualizarService.confirmar.and.callFake((msg: string, cb: Function) =>
            cb()
        );
        usuarioOrganismoPerfilService.agregarConformidadPorCompra.and.returnValue(
            of({})
        );
        component.agregarPermisoPorCompra(compra);
        expect(
            usuarioOrganismoPerfilService.agregarConformidadPorCompra
        ).toHaveBeenCalledWith(5, 10);
    });

    it('obtenerAcciones navega por item si hay id compuesto', () => {
        route.snapshot = { paramMap: { get: () => 'uy-ci-1-1-1-1-1' } } as any;
        spyOn(component as any, 'guardarFiltro');
        const compra = { idCompra: 7, tipoCompra: { id: 1 } } as any;
        const accion = component.obtenerAcciones(compra)[1];
        (accion as any).accion();
        expect(component['guardarFiltro']).toHaveBeenCalled();
        expect(router.navigate).toHaveBeenCalledWith([
            '/administracion/gestion-usuarios/consulta-usuario-conformidad',
            'uy-ci-1-1-1-1-1',
            'items',
            7,
        ]);
    });

    it('buscar realiza consulta cuando es válido', fakeAsync(() => {
        component.form = new FormGroup({
            idInciso: new FormControl(1),
            idUnidadEjecutora: new FormControl(1),
            idUnidadCompra: new FormControl(1),
        });

        const mockResp = {
            content: [{ idCompra: 1 }],
            page: { totalElements: 1 },
        };
        compraSiceService.obtenerCompras.and.returnValue(of(mockResp));

        component.buscar();
        tick();
        expect(component.compras.length).toBe(1);
    }));
    it('validarFormularioCompleto retorna error cuando idUnidadCompra invalido', () => {
        component.form.get('organismo')?.setValue({ idUnidadCompra: null });
        const res = (component as any).validarFormularioCompleto({} as any);
        expect(res).toEqual({ unidadCompraInvalido: true });
        component.form.get('organismo')?.setValue({ idUnidadCompra: '123' });
        const res2 = (component as any).validarFormularioCompleto({} as any);
        expect(res2).toBeNull();
    });

    it('agregarPermisoPorCompra no llama servicio si faltan ids', () => {
        actualizarService.confirmar.and.callFake((_m: any, cb: () => void) => cb());
        component.usuario = { id: undefined } as any;
        component.agregarPermisoPorCompra({ idCompra: undefined } as any);
        expect(usuarioOrganismoPerfilService.agregarConformidadPorCompra).not.toHaveBeenCalled();
    });

    it('guardarFiltro persiste snapshot con filtros', () => {
        component.usuario = { id: 'u1' } as any;
        component.form.patchValue({ idTipoCompra: '1', nroAnioCompra: '10/2024' });
        component.form.get('organismo')?.setValue({ idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 });
        (component as any).actualizarFiltro();
        (component as any).guardarFiltro();
        expect(snapshotSrv.save).toHaveBeenCalled();
        const saved = snapshotSrv.save.calls.mostRecent().args[1];
        expect(saved.filtro.idInciso).toBe(1);
        expect(saved.usuario.id).toBe('u1');
    });

    it('buscarInicial carga snapshot y ejecuta buscar', () => {
        const snap = {
            filtro: { idTipoCompra: '1', idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 },
        };
        snapshotSrv.load.and.returnValue(snap);
        spyOn(component, 'buscar');
        tipoCompraService.obtenerTiposCompraSinPaginado.and.returnValue(of([]));
        (component as any).cdr.detectChanges = jasmine.createSpy();
        (component as any).buscarInicial();
        expect(component.form.get('idTipoCompra')?.value).toBe('1');
        expect(component.buscar).toHaveBeenCalled();
    });

    it('buscarInicial no hace nada sin snapshot', () => {
        snapshotSrv.load.and.returnValue(undefined);
        spyOn(component, 'buscar');
        (component as any).cdr.detectChanges = jasmine.createSpy();
        (component as any).buscarInicial();
        expect(component.buscar).not.toHaveBeenCalled();
    });

    it('obtenerAcciones no navega si no hay id compuesto', () => {
        route.snapshot = { paramMap: { get: () => null } } as any;
        const compra = { idCompra: 3, tipoCompra: { id: 1 } } as any;
        const accion = component.obtenerAcciones(compra)[1];
        (accion as any).accion();
        expect(router.navigate).not.toHaveBeenCalled();
    });

    it('validarNroAnioCompra ajusta el indicador según el formato', () => {
        component.form.get('nroAnioCompra')?.setValue('1234');
        component.validarNroAnioCompra();
        expect(component.nroCompraValido).toBeFalse();
        component.form.get('nroAnioCompra')?.setValue('10/2024');
        component.validarNroAnioCompra();
        expect(component.nroCompraValido).toBeTrue();
    });



it('ngOnInit obtiene usuario cuando hay id compuesto en la ruta', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.paramMap = of({ has: () => true, get: () => 'uy-ci-1' });
    tipoCompraService.obtenerTiposCompraSinPaginado.and.returnValue(of([]));
    const spyObtener = spyOn(component, 'obtenerUsuario').and.stub();

    component.ngOnInit();

    expect(spyObtener).toHaveBeenCalledWith('uy-ci-1');
});

it('ngOnInit no intenta obtener usuario si la ruta no trae id', () => {
    const activatedRoute = TestBed.inject(ActivatedRoute) as any;
    activatedRoute.paramMap = of({ has: () => false, get: () => null });
    tipoCompraService.obtenerTiposCompraSinPaginado.and.returnValue(of([]));
    const spyObtener = spyOn(component, 'obtenerUsuario').and.stub();

    component.ngOnInit();

    expect(spyObtener).not.toHaveBeenCalled();
});

it('ngAfterViewInit llama a buscarVolver cuando el parámetro volver es 1', () => {
    const volverSpy = spyOn(component as any, 'buscarVolver');
    const inicialSpy = spyOn(component as any, 'buscarInicial');
    (component as any).route = { snapshot: { queryParamMap: { get: () => '1' } } } as any;

    component.ngAfterViewInit();

    expect(volverSpy).toHaveBeenCalled();
    expect(inicialSpy).not.toHaveBeenCalled();
});

it('ngAfterViewInit espera a que se cargue el usuario cuando no hay parámetro volver', () => {
    const volverSpy = spyOn(component as any, 'buscarVolver');
    const inicialSpy = spyOn(component as any, 'buscarInicial');
    (component as any).route = { snapshot: { queryParamMap: { get: () => null } } } as any;

    component.ngAfterViewInit();
    (component as any).usuarioCargado$.next(true);

    expect(volverSpy).not.toHaveBeenCalled();
    expect(inicialSpy).toHaveBeenCalled();
});

it('buscarVolver restaura snapshot y ejecuta la búsqueda', fakeAsync(() => {
    const location = TestBed.inject(Location) as any;
    const snapshot = {
        pagina: 2,
        tamanoPagina: 15,
        sort: 'numCompra',
        order: 'desc',
        filtro: {
            idTipoCompra: '1',
            nroAnioCompra: '12/2024',
            idInciso: 1,
            idUnidadEjecutora: 2,
            idUnidadCompra: 3,
        },
        usuario: { id: 'u1' }
    };
    snapshotSrv.load.and.returnValue(snapshot);
    const buscarSpy = spyOn(component, 'buscar');
    const detectSpy = spyOn(component['cdr'] as any, 'detectChanges');

    (component as any).buscarVolver();
    tick(100);

    expect(detectSpy).toHaveBeenCalled();
    expect(component.parametros.pagina).toBe(2);
    expect(component.usuario?.id).toBe(snapshot.usuario.id);
    expect(buscarSpy).toHaveBeenCalled();
    expect(location.replaceState).toHaveBeenCalledWith('/p');
}));

it('buscarVolver limpia el parámetro volver aunque no haya snapshot', () => {
    const location = TestBed.inject(Location) as any;
    snapshotSrv.load.and.returnValue(undefined);

    (component as any).buscarVolver();

    expect(location.replaceState).toHaveBeenCalledWith('/p');
});

it('buscar marca el formulario cuando no es búsqueda inicial', () => {
    const markSpy = spyOn(component.form, 'markAllAsTouched');
    component.form.get('organismo')?.setValue({ idInciso: 1, idUnidadEjecutora: 1, idUnidadCompra: 1 });
    compraSiceService.obtenerCompras.and.returnValue(of({ content: [], page: { totalElements: 0 } }));

    component.buscar();

    expect(markSpy).toHaveBeenCalled();
});

it('buscar no marca el formulario cuando la búsqueda inicial no tiene filtros completos', () => {
    const markSpy = spyOn(component.form, 'markAllAsTouched');
    component.form.get('organismo')?.setValue({ idInciso: 1, idUnidadEjecutora: 1, idUnidadCompra: 1 });
    compraSiceService.obtenerCompras.and.returnValue(of({ content: [], page: { totalElements: 0 } }));

    component.buscar(false, { filtro: { idInciso: 1 } }, true);

    expect(markSpy).not.toHaveBeenCalled();
});

it('buscar resetea la página cuando se solicita', () => {
    component.parametros.pagina = 5;
    component.form.get('organismo')?.setValue({ idInciso: 1, idUnidadEjecutora: 1, idUnidadCompra: 1 });
    compraSiceService.obtenerCompras.and.returnValue(of({ content: [], page: { totalElements: 0 } }));

    component.buscar(true);

    expect(component.parametros.pagina).toBe(0);
});

it('buscar no ejecuta la consulta cuando el formulario es inválido', () => {
    spyOnProperty(component.form, 'valid', 'get').and.returnValue(false);

    component.buscar();

    expect(compraSiceService.obtenerCompras).not.toHaveBeenCalled();
});

it('dividirNroAnioCompra devuelve objeto vacío cuando el valor es undefined', () => {
    expect(component['dividirNroAnioCompra'](undefined as any)).toEqual({});
});

});
