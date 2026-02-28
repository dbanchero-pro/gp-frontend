import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { CabezalConsultaComponent } from 'src/app/shared/components/cabezal-consulta/cabezal-consulta.component';
import { FiltroItemsArticulosComponent } from 'src/app/shared/components/filtro-items-articulos/filtro-items-articulos.component';
import { FiltroOrganismoComponent } from 'src/app/shared/components/filtro-organismo/filtro-organismo.component';
import { FiltroComponent } from 'src/app/shared/components/filtro/filtro.component';
import { InputDocumentoComponent } from 'src/app/shared/components/input-documento/input-documento.component';
import { PaginadoComponent } from 'src/app/shared/components/paginado/paginado.component';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoBusqueda } from 'src/app/shared/enum/tipo-busqueda-item.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { OrganismoService } from 'src/app/shared/services/organismo.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { Logger } from 'src/app/shared/utils/logger';
import { ConsultaUsuariosConformidadComponent } from './consulta-usuarios-conformidad.component';

export const mockUsuarioService = {
    obtenerTodosUsuarios: jasmine.createSpy('obtenerTodosUsuarios'),
    obtenerUsuarioPorId: jasmine
        .createSpy('obtenerUsuarioPorId')
        .and.returnValue(
            of({
                id: 'uy-ci-12345678',
                nombre: 'Test User',
                pais: { id: Pais.URUGUAY },
                nroDocumento: '12345678',
                tipoDocumento: { idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD, idPais: Pais.URUGUAY },
            })
        ),
};
export const mockTipoCompraService = {
    obtenerTiposCompraSinPaginado: jasmine
        .createSpy('obtenerTiposCompraSinPaginado')
        .and.returnValue(of([])),
};

export const mockOrganismoService = {
    obtenerIncisos: jasmine
        .createSpy('obtenerIncisos')
        .and.returnValue(of([])),
    obtenerUE: jasmine
        .createSpy('obtenerUE')
        .and.returnValue(of([])),
    obtenerUC: jasmine
        .createSpy('obtenerUC')
        .and.returnValue(of([])),
    obtenerOpcionesTiposCompra: jasmine
        .createSpy('obtenerOpcionesTiposCompra')
        .and.returnValue(of([])),
    obtenerOpcionesEntregables: jasmine
        .createSpy('obtenerOpcionesEntregables')
        .and.returnValue(of([])),
    obtenerOpcionesArticulos: jasmine
        .createSpy('obtenerOpcionesArticulos')
        .and.returnValue(of([])),
};

class MockSeguridadService {
    usuarioLogueadoEsUsuarioOrganismo() {
        return false;
    }
    tienePermiso(permiso: string) {
        return true;
    }
    tieneAlgunPermiso(permisos: string[]) {
        return true;
    }
}

describe('ConsultaUsuariosConformidadComponent', () => {
    let component: ConsultaUsuariosConformidadComponent;
    let actualizarService: jasmine.SpyObj<ActualizarService>;
    let usuarioOrganismoPerfilService: jasmine.SpyObj<UsuarioOrganismoPerfilService>;
    let router: any;
    let activatedRoute: any;
    let snapshotGenericService: jasmine.SpyObj<SnapshotGenericService>;

    beforeEach(async () => {
        actualizarService = jasmine.createSpyObj('ActualizarService', [
            'confirmar',
            'mensajeCorrecto',
        ]);
        router = { navigate: jasmine.createSpy('navigate') };
        activatedRoute = {
            snapshot: {
                queryParamMap: {
                    get: jasmine.createSpy('get').and.returnValue(null),
                },
            },
        };
        snapshotGenericService = jasmine.createSpyObj(
            'SnapshotGenericService',
            ['load', 'save', 'clear']
        );
        usuarioOrganismoPerfilService = jasmine.createSpyObj(
            'UsuarioOrganismoPerfilService',
            [
                'eliminarPerfil',
                'obtenerTodos',
                'agregarConformidadTodasUc',
                'agregarConformidadUC',
                'exportarUsuariosPerfil',
            ]
        );

        await TestBed.configureTestingModule({
            declarations: [],
            imports: [
              ReactiveFormsModule,
              ConsultaUsuariosConformidadComponent,
              FiltroComponent,
              FiltroOrganismoComponent,
              InputDocumentoComponent,
              PaginadoComponent,
              CabezalConsultaComponent,
              FiltroItemsArticulosComponent,
            ],
            providers: [
                { provide: SeguridadService,  useClass: MockSeguridadService },
                {
                    provide: HttpClient,
                    useValue: jasmine.createSpyObj('HttpClient', [
                        'get',
                        'post',
                    ]),
                },

                { provide: ActualizarService, useValue: actualizarService },
                { provide: Router, useValue: router },
                { provide: ActivatedRoute, useValue: activatedRoute },
                {
                    provide: SnapshotGenericService,
                    useValue: snapshotGenericService,
                },
                {
                    provide: UsuarioOrganismoPerfilService,
                    useValue: usuarioOrganismoPerfilService,
                },
                { provide: UsuarioService, useValue: mockUsuarioService },
                { provide: OrganismoService, useValue: mockOrganismoService },
                { provide: TipoCompraService, useValue: mockTipoCompraService },
                { provide: BsModalService, useValue: {} },
                { provide: BsModalRef, useValue: {} },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(
            ConsultaUsuariosConformidadComponent
        );
        component = fixture.componentInstance;
        component.filtroItemsComponent = {
            setDisabledState: jasmine.createSpy('setDisabledState'),
            limpiar: jasmine.createSpy('limpiar'),
        } as any;

        // Default mock for obtenerTodos
        usuarioOrganismoPerfilService.obtenerTodos.and.returnValue(
            of({
                content: [],
                page: 0,
                size: 10,
                totalPages: 1,
                totalElements: 0,
                number: 0,
                sort: { sorted: false, unsorted: true, empty: false },
                first: true,
                last: true,
                numberOfElements: 0,
                pageable: {
                    sort: { sorted: false, unsorted: true, empty: false },
                    offset: 0,
                    pageSize: 10,
                    pageNumber: 0,
                    paged: true,
                    unpaged: false,
                },
                empty: true,
            })
        );
        fixture.detectChanges();

        component.form.addControl('filtroBase', new FormControl());
        component.form.addControl('idTipoCompra', new FormControl());
        component.form.addControl('nroAnioCompra', new FormControl());
        component.form.addControl('codEntregable', new FormControl());
        component.form.addControl('nomEntregable', new FormControl());
        component.form.addControl('organismo', new FormControl());
    });

    it('toggleCamposPorModo deshabilita y habilita controles', () => {
        (component as any).toggleCamposPorModo(component.MODO_TODAS_UC);
        expect(component.form.get('idTipoCompra')?.disabled).toBeTrue();
        (component as any).toggleCamposPorModo(component.MODO_FILTROS);
        expect(component.form.get('idTipoCompra')?.disabled).toBeFalse();
    });

    it('onFiltroItemsCambio debería fijar los parámetros de búsqueda', () => {
        usuarioOrganismoPerfilService.obtenerTodos.and.returnValue(
            of({
                content: [],
                page: 0,
                size: 10,
                totalPages: 1,
                totalElements: 0,
                number: 0,
                sort: { sorted: false, unsorted: true, empty: false },
                first: true,
                last: true,
                numberOfElements: 0,
                pageable: {
                    sort: { sorted: false, unsorted: true, empty: false },
                    offset: 0,
                    pageSize: 10,
                    pageNumber: 0,
                    paged: true,
                    unpaged: false,
                },
                empty: true,
            })
        );

        component.onFiltroItemsCambio({
            tipoBusqueda: TipoBusqueda.NROITEM,
            item: '5',
        } as any);
        expect(component.filtroItem?.item).toBe('5');
        component.onFiltroItemsCambio({
            tipoBusqueda: TipoBusqueda.ARTICULO,
            item: 'abc',
        } as any);
        expect(component.filtroItem?.item).toBe('abc');
    });

    it('nuevaConsulta reinicia el estado', () => {
        component.parametros.pagina = 2;
        component.total = 5;
        component.usuariosAgrupados = [{ id: '1', nombre: 'x', permisos: [] }];

        spyOn(component, 'buscar'); // Evita efectos de buscar()

        component.nuevaConsulta();

        expect(component.parametros.pagina).toBe(0);
        expect(component.total).toBe(-1);
        expect(component.usuariosAgrupados.length).toBe(0);
        expect(component.buscar).toHaveBeenCalled();
    });

    it('onFiltroOrganismo sets control value', () => {
        component.onFiltroOrganismo({ a: 1 } as any);
        expect(component.form.get('filtroBase')?.value).toEqual({ a: 1 });
    });
    it('limpiarFiltroItems clears item filters', () => {
        component.parametros.filtro.nroItem = 1;
        component.parametros.filtro.descArticulo = 'x';
        component.limpiarFiltroItems();
        expect(component.parametros.filtro.nroItem).toBeUndefined();
        expect(component.parametros.filtro.descArticulo).toBeUndefined();
    });

    it('ejecutarAccion navega cuando existe url', () => {
        component.ejecutarAccion({ url: ['/test'] } as any);
        expect(router.navigate).toHaveBeenCalledWith(['/test']);
    });

    it('actualizarFiltro limpia campos en modo todasUc', () => {
        component.form.patchValue({
            modoBusqueda: component.MODO_TODAS_UC,
            idTipoCompra: '1',
            nroAnioCompra: '10/2024',
            codEntregable: 'C',
            nomEntregable: 'N',
        });
        component.form.get('organismo')?.setValue({ idInciso: 1 });
        component.filtroItem = { tipoBusqueda: TipoBusqueda.NROITEM, item: '2' } as any;
        (component as any).actualizarFiltro();
        expect(component.parametros.filtro.idTipoCompra).toBeUndefined();
        expect(component.parametros.filtro.idInciso).toBeUndefined();
        expect(component.parametros.filtro.nroItem).toBeUndefined();
    });

    it('buscar respeta validacion segun modo', () => {
        usuarioOrganismoPerfilService.obtenerTodos.calls.reset();
        component.form.get('modoBusqueda')?.setValue(component.MODO_FILTROS);
        component.form.setErrors({ invalid: true } as any);
        component.buscar();
        expect(usuarioOrganismoPerfilService.obtenerTodos).not.toHaveBeenCalled();

        component.form.setErrors({ invalid: true } as any);
        component.form.get('modoBusqueda')?.setValue(component.MODO_TODAS_UC);
        usuarioOrganismoPerfilService.obtenerTodos.and.returnValue(of({ content: [], page: { totalElements: 0 } } as any));
        component.buscar();
        expect(usuarioOrganismoPerfilService.obtenerTodos).toHaveBeenCalled();
    });

    it('validarNroAnioCompra actualiza estado', () => {
        component.form.get('nroAnioCompra')?.setValue('123');
        component.validarNroAnioCompra();
        expect(component.nroCompraValido).toBeFalse();
        component.form.get('nroAnioCompra')?.setValue('1/2024');
        component.validarNroAnioCompra();
        expect(component.nroCompraValido).toBeTrue();
    });

    it('obtenerAcciones devuelve opciones segun modo', () => {
        component.form.get('modoBusqueda')?.setValue(component.MODO_TODAS_UC);
        const accionesTodos = component.obtenerAcciones({ id: '1', permisos: [], tienePermisoTodas: true } as any, component.MODO_TODAS_UC);
        expect(accionesTodos.length).toBe(2);

        component.form.get('modoBusqueda')?.setValue(component.MODO_FILTROS);
        const acciones = component.obtenerAcciones({ id: '1', permisos: [], tienePermisoTodas: false } as any, component.MODO_FILTROS);
        expect(acciones.length).toBe(3);
    });

    it('guardarPerfilUsuarioParaTodasUc llama al servicio', () => {
        actualizarService.confirmar.and.callFake((_m, cb) => cb());
        usuarioOrganismoPerfilService.agregarConformidadTodasUc.and.returnValue(of(true));
        const usuario = { id: '7' } as any;
        component.guardarPerfilUsuarioParaTodasUc(usuario);
        expect(usuarioOrganismoPerfilService.agregarConformidadTodasUc).toHaveBeenCalledWith('7');
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    });

    it('obtenerTiposCompra asigna el resultado', () => {
        (mockTipoCompraService.obtenerTiposCompraSinPaginado as jasmine.Spy).and.returnValue(
            of([{ id: '1' } as any])
        );
        component.obtenerTiposCompra();
        expect(component.tiposCompra.length).toBe(1);
        expect(component.tiposCompra[0].id).toBe('1');
    });

    it('buscarVolver restaura snapshot y ejecuta buscar', fakeAsync(() => {
        const snap = {
            filtro: {
                modoBusqueda: component.MODO_FILTROS,
                nroDocumento: '1',
                idTipoCompra: '2',
                nroAnioCompra: '1/2024',
                codEntregable: 'C',
                nomEntregable: 'N',
                idInciso: 1,
                idUnidadEjecutora: 2,
                idUnidadCompra: 3,
            },
            pagina: 1,
            tamanoPagina: 5,
            sort: 'col',
            order: 'desc',
            nroItem: 5,
            descripcionArticulo: 'd',
        };
        snapshotGenericService.load.and.returnValue(snap);
        spyOn(component, 'buscar');
        (component as any).buscarVolver();
        tick(250);
        expect(component.form.get('nroDocumento')?.value).toBe('1');
        expect(component.parametros.pagina).toBe(1);
        expect(component.buscar).toHaveBeenCalled();
    }));

    it('abrirOrganismoPopup delega a guardarPerfilUsuarioPorUc', () => {
        spyOn(component as any, 'abrirPopup').and.returnValue({
            guardarEvento: of({ idInciso: 1 }),
        });
        spyOn(component, 'guardarPerfilUsuarioPorUc');
        const usuario: any = { id: 'u1' };
        component.abrirOrganismoPopup(usuario);
        expect(component['abrirPopup']).toHaveBeenCalled();
        expect(component.guardarPerfilUsuarioPorUc).toHaveBeenCalledWith(
            { idInciso: 1 },
            usuario
        );
    });

    it('abrirAgregarPermisoPorCompra navega al buscador', () => {
        spyOn(component as any, 'abrirPopup').and.returnValue({
            guardarEvento: of({ idUsuario: '2' }),
        });
        spyOn(component, 'abrirBuscadorDeCompra');
        component.abrirAgregarPermisoPorCompra();
        expect(component['abrirPopup']).toHaveBeenCalled();
        expect(component.abrirBuscadorDeCompra).toHaveBeenCalledWith({
            idUsuario: '2',
        });
    });

    it('abrirBuscadorDeCompra realiza navegación', () => {
        component.abrirBuscadorDeCompra({ idUsuario: '3' });
        expect(router.navigate).toHaveBeenCalledWith([
            '/administracion/gestion-usuarios/consulta-usuario-conformidad',
            '3',
        ]);
    });

    it('eliminarPerfilUsuarioEspecifico confirma y elimina', () => {
        actualizarService.confirmar.and.callFake((_m, cb) => cb());
        usuarioOrganismoPerfilService.eliminarPerfil.and.returnValue(of(true));
        spyOn(component, 'buscar');
        component.eliminarPerfilUsuarioEspecifico({ id: 1 } as any);
        expect(usuarioOrganismoPerfilService.eliminarPerfil).toHaveBeenCalledWith(1);
        expect(component.buscar).toHaveBeenCalled();
    });

    it('descargarExcel en modo todasUc exporta con filtro reducido', () => {
        component.form.patchValue({
            modoBusqueda: component.MODO_TODAS_UC,
            nroDocumento: '1',
        });
        (component as any).actualizarFiltro();
        component.descargarExcel();
        expect(usuarioOrganismoPerfilService.exportarUsuariosPerfil).toHaveBeenCalledWith(
            jasmine.objectContaining({ permisoTodas: true, nroDocumento: '1' })
        );
    });

    it('toggleCamposPorModo deshabilita y habilita campos', () => {
        const campos = [
            'filtroBase',
            'idTipoCompra',
            'nroAnioCompra',
            'codEntregable',
            'nomEntregable',
            'organismo',
        ];
        (component as any).toggleCamposPorModo(component.MODO_TODAS_UC);
        campos.forEach(c => expect(component.form.get(c)?.disabled).toBeTrue());
        (component as any).toggleCamposPorModo(component.MODO_FILTROS);
        campos.forEach(c => expect(component.form.get(c)?.disabled).toBeFalse());
    });

    it('eliminarPerfilTodos con permiso faltante registra error', () => {
        spyOn(Logger, 'logError');
        component.eliminarPerfilTodos({ permisoTodasUc: undefined } as any);
        expect(Logger.logError).toHaveBeenCalled();
        expect(usuarioOrganismoPerfilService.eliminarPerfil).not.toHaveBeenCalled();
    });

    it('abrirAgregarPermisoTodasUcPopup invoca popup y guarda datos', () => {
        spyOn(component as any, 'abrirPopup').and.returnValue({
            guardarEvento: of({ idUsuario: '9' }),
        });
        spyOn(component, 'guardarPerfilNuevoUsuarioParaTodasUc');
        component.abrirAgregarPermisoTodasUcPopup();
        expect((component as any).abrirPopup).toHaveBeenCalled();
        expect(component.guardarPerfilNuevoUsuarioParaTodasUc).toHaveBeenCalledWith({ idUsuario: '9' });
    });

    it('abrirNuevoUsuarioUcPopup lanza popup y guarda usuario', () => {
        spyOn(component as any, 'abrirPopup').and.returnValue({
            guardarEvento: of({ idUsuario: '1', unidadCompra: { idInciso: 1 } }),
        });
        spyOn(component, 'guardarPerfilNuevoUsuarioPorUc');
        component.abrirNuevoUsuarioUcPopup();
        expect((component as any).abrirPopup).toHaveBeenCalled();
        expect(component.guardarPerfilNuevoUsuarioPorUc).toHaveBeenCalledWith({ idUsuario: '1', unidadCompra: { idInciso: 1 } });
    });

    it('guardarPerfilNuevoUsuarioPorUc oculta modal y guarda', () => {
        component['modalService'] = { getModalsCount: () => 1, hide: jasmine.createSpy('hide') } as any;
        spyOn(component, 'buscar');
        usuarioOrganismoPerfilService.agregarConformidadUC.and.returnValue(of(true));
        component.guardarPerfilNuevoUsuarioPorUc({
            idUsuario: '3',
            unidadCompra: { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 },
        });
        expect(component['modalService'].hide).toHaveBeenCalled();
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
        expect(component.buscar).toHaveBeenCalled();
    });

    it('eliminarPerfilTodos con permiso válido elimina y busca', () => {
        actualizarService.confirmar.and.callFake((_m, cb) => cb());
        usuarioOrganismoPerfilService.eliminarPerfil.and.returnValue(of(true));
        spyOn(component, 'buscar');
        component.eliminarPerfilTodos({ permisoTodasUc: { id: 9 } } as any);
        expect(usuarioOrganismoPerfilService.eliminarPerfil).toHaveBeenCalledWith(9);
        expect(component.buscar).toHaveBeenCalled();
    });

    it('toggleCamposPorModo informa al filtro de items', () => {
        component.filtroItemsComponent.setDisabledState = jasmine.createSpy('setDisabledState');
        (component as any).toggleCamposPorModo(component.MODO_TODAS_UC);
        expect(component.filtroItemsComponent.setDisabledState).toHaveBeenCalledWith(true);
        (component as any).toggleCamposPorModo(component.MODO_FILTROS);
        expect(component.filtroItemsComponent.setDisabledState).toHaveBeenCalledWith(false);
    });

    it('actualizarFiltro asigna descArticulo cuando se busca por artículo', () => {
        component.filtroItem = { tipoBusqueda: TipoBusqueda.ARTICULO, item: 'desc' } as any;
        component.form.patchValue({ modoBusqueda: component.MODO_FILTROS });
        (component as any).actualizarFiltro();
        expect(component.parametros.filtro.descArticulo).toBe('desc');
        expect(component.parametros.filtro.nroItem).toBeUndefined();
    });

    it('buscarVolver sin snapshot ejecuta nuevaConsulta', fakeAsync(() => {
        snapshotGenericService.load.and.returnValue(null);
        const nueva = spyOn(component, 'nuevaConsulta');
        (component as any).buscarVolver();
        tick(250);
        expect(nueva).toHaveBeenCalled();
    }));

    it('buscar con datos válidos agrupa usuarios y setea total', () => {
        const respuesta: any = {
            content: [
                { idUsuario: '1', nombre: 'X' },
                { idUsuario: '1', nombre: 'X', unidadCompra: { id: 1 } },
                { idUsuario: '2', nombre: 'Y', unidadCompra: { id: 2 } }
            ],
            page: { totalElements: 2 }
        };
        usuarioOrganismoPerfilService.obtenerTodos.and.returnValue(of(respuesta));
        component.form.get('modoBusqueda')?.setValue(component.MODO_TODAS_UC);
        component.buscar();
        expect(component.usuariosAgrupados.length).toBe(2);
        expect(component.total).toBe(2);
    });

    it('guardarPerfilNuevoUsuarioParaTodasUc confirma y guarda', fakeAsync(() => {
        component['modalService'] = { getModalsCount: () => 1, hide: jasmine.createSpy('hide') } as any;
        spyOn(component, 'buscar');
        actualizarService.confirmar.and.callFake((_m, cb) => cb());
        usuarioOrganismoPerfilService.agregarConformidadTodasUc.and.returnValue(of(true));
        component.guardarPerfilNuevoUsuarioParaTodasUc({ idUsuario: '4' });
        tick(150);
        expect(component['modalService'].hide).toHaveBeenCalled();
        expect(actualizarService.confirmar).toHaveBeenCalled();
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
        expect(component.buscar).toHaveBeenCalled();
    }));

    it('guardarPerfilUsuarioPorUc agrega permiso y busca', () => {
        spyOn(component, 'buscar');
        usuarioOrganismoPerfilService.agregarConformidadUC.and.returnValue(of(true));
        component.guardarPerfilUsuarioPorUc({ idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 }, { id: '5' } as any);
        expect(usuarioOrganismoPerfilService.agregarConformidadUC).toHaveBeenCalledWith(1, 2, 3, '5');
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
        expect(component.buscar).toHaveBeenCalled();
    });

    it('guardarPerfilUsuarioParaTodasUc confirma y guarda', () => {
        spyOn(component, 'buscar');
        actualizarService.confirmar.and.callFake((_m, cb) => cb());
        usuarioOrganismoPerfilService.agregarConformidadTodasUc.and.returnValue(of(true));
        component.guardarPerfilUsuarioParaTodasUc({ id: '7' } as any);
        expect(usuarioOrganismoPerfilService.agregarConformidadTodasUc).toHaveBeenCalledWith('7');
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
        expect(component.buscar).toHaveBeenCalled();
    });

    it('agruparPorUsuario genera mapa con permisos globales', () => {
        const resp: any = {
            content: [
                { idUsuario: '1', nombre: 'A' },
                { idUsuario: '1', nombre: 'A', unidadCompra: { id: 1 } },
                { idUsuario: '2', nombre: 'B', unidadCompra: { id: 2 } },
            ],
        };
        const mapa = new Map<string, any>();
        (component as any).agruparPorUsuario(resp, mapa);
        expect(mapa.size).toBe(2);
        expect(mapa.get('1').tienePermisoTodas).toBeTrue();
        expect(mapa.get('1').permisos.length).toBe(1);
        expect(mapa.get('2').tienePermisoTodas).toBeFalse();
    });
});
