import { HttpClient } from '@angular/common/http';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { CabezalConsultaComponent } from 'src/app/shared/components/cabezal-consulta/cabezal-consulta.component';
import { FiltroOrganismoComponent } from 'src/app/shared/components/filtro-organismo/filtro-organismo.component';
import { FiltroComponent } from 'src/app/shared/components/filtro/filtro.component';
import { InputDocumentoComponent } from 'src/app/shared/components/input-documento/input-documento.component';
import { PaginadoComponent } from 'src/app/shared/components/paginado/paginado.component';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { CompraService } from 'src/app/shared/services/compra.service';
import { OrganismoService } from 'src/app/shared/services/organismo.service';
import { UsuarioOrganismoService } from 'src/app/shared/services/usuario/usuario-organismo.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { ZonaService } from 'src/app/shared/services/zona.service';
import { Logger } from 'src/app/shared/utils/logger';
import { ConsultaUsuariosRecepcionComponent } from './consulta-usuarios-recepcion.component';

export const mockZonaService = {
    obtenerZonas: () => of([]),
};

export const mockCompraService = {
    obtenerTiposCompraSinPaginado: () => of([]),
};

export const mockOrganismoService = {
    obtenerIncisos: () => of([]),
    obtenerUE: () => of([]),
    obtenerUC: () => of([]),
};

export const mockPuntosRecepcionService = {
    obtenerPuntosRecepcion: () =>
        of({
            totalElements: 0,
            totalPages: 0,
            size: 0,
            page: 0,
            pageable: {
                sort: { sorted: false, unsorted: false, empty: false },
                offset: 0,
                pageSize: 0,
                pageNumber: 0,
                paged: true,
                unpaged: false,
            },
            empty: true,
            numberOfElements: 0,
            first: true,
            last: true,
            number: 0,
            sort: { sorted: false, unsorted: false, empty: false },
            content: [],
        }),
};

export const mockUsuarioOrganismoPerfilService = {
    obtenerPuntosRecepcionPorUsuario: () => of([]),
    obtenerPuntosRecepcionPorOrganismo: () => of([]),
    obtenerPuntosRecepcionPorOrganismoPaginado: () => of([]),
    obtenerTodos: jasmine
        .createSpy('obtenerTodos')
        .and.returnValue(
            of({
                content: [],
                totalElements: 0,
                totalPages: 0,
                size: 0,
                page: 0,
                pageable: {
                    sort: { sorted: false, unsorted: false, empty: false },
                    offset: 0,
                    pageSize: 0,
                    pageNumber: 0,
                    paged: true,
                    unpaged: false,
                },
                empty: true,
                numberOfElements: 0,
                first: true,
                last: true,
                number: 0,
                sort: { sorted: false, unsorted: false, empty: false },
            })
        ),
    eliminarPerfil: () => of(true),
    agregarResponsableRecepcionUC: jasmine
        .createSpy('agregarResponsableRecepcionUC')
        .and.returnValue(of({})),
    agregarResponsableRecepcionUCTodas: jasmine
        .createSpy('agregarResponsableRecepcionUCTodas')
        .and.returnValue(of({})),
    exportarUsuariosPerfil: jasmine.createSpy('exportarUsuariosPerfil'),
};

@Pipe({ name: 'formatoCi', standalone: true })
class FormatoCiPipe implements PipeTransform {
    transform(valor: any): any {
        return valor;
    }
}

describe('ConsultaUsuariosRecepcionComponent', () => {
    let component: ConsultaUsuariosRecepcionComponent;
    let actualizarService: jasmine.SpyObj<ActualizarService>;
    let router: any;
    let usuarioService: any;
    let activatedRoute: any;
    let snapshotService: jasmine.SpyObj<SnapshotGenericService>;

    beforeEach(async () => {
        actualizarService = jasmine.createSpyObj('ActualizarService', [
            'confirmar',
            'mensajeCorrecto',
        ]);
        actualizarService.popups = [];
        router = { navigate: jasmine.createSpy('navigate') };
        usuarioService = jasmine.createSpyObj('UsuarioOrganismoService', [
            'obtenerTodosUsuarios',
            'obtenerUsuariosOrganismo',
        ]);
        activatedRoute = {
            snapshot: {
                queryParamMap: {
                    get: jasmine.createSpy('get').and.returnValue(null),
                },
            },
        };
        snapshotService = jasmine.createSpyObj('SnapshotGenericService', [
            'load',
            'save',
            'clear',
        ]);
        await TestBed.configureTestingModule({
            declarations: [
                ConsultaUsuariosRecepcionComponent,
                FiltroComponent,
                FiltroOrganismoComponent,
                CabezalConsultaComponent,
                InputDocumentoComponent,
                PaginadoComponent,
            ],
            imports: [ReactiveFormsModule, FormsModule, FormatoCiPipe],
            providers: [
                { provide: SeguridadService, useValue: { usuarioLogueadoEsUsuarioOrganismo: () => false,
                    tienePermiso: (permiso: string) => true,
                    tieneAlgunPermiso: (permisos: string[]) => true,
                 } },
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
                { provide: SnapshotGenericService, useValue: snapshotService },
                {
                    provide: UsuarioOrganismoPerfilService,
                    useValue: mockUsuarioOrganismoPerfilService,
                },
                { provide: CompraService, useValue: mockCompraService },
                { provide: OrganismoService, useValue: mockOrganismoService },
                { provide: UsuarioOrganismoService, useValue: usuarioService },
                { provide: ZonaService, useValue: mockZonaService },
                {
                    provide: BsModalService,
                    useValue: {
                        show: () => ({}),
                        getModalsCount: () => 0,
                        hide: () => {},
                    },
                },
                { provide: BsModalRef, useValue: {} },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();

        const fixture = TestBed.createComponent(
            ConsultaUsuariosRecepcionComponent
        );
        component = fixture.componentInstance;

        fixture.detectChanges();

        component.form.addControl('filtroBase', new FormControl());
        component.form.addControl('idZona', new FormControl());
        component.form.addControl('nombrePuntoRecepcion', new FormControl());
    });

    it('toggleCamposPorModo habilita y deshabilita', () => {
        (component as any).toggleCamposPorModo(component.MODO_TODOS_PUNTOS);
        expect(component.form.get('idZona')?.disabled).toBeTrue();
        (component as any).toggleCamposPorModo(component.MODO_FILTROS);
        expect(component.form.get('idZona')?.disabled).toBeFalse();
    });
    it('obtenerAcciones retorna eliminar en modo todos puntos', () => {
        component.form
            .get('modoBusqueda')
            ?.setValue(component.MODO_TODOS_PUNTOS);
        const acciones = component.obtenerAcciones({
            id: '1',
            nombre: 'x',
            permisos: [],
            tienePermisoTodas: true,
            permisoTodasUc: { id: 1 } as any,
        }, component.MODO_TODOS_PUNTOS);
        expect(acciones[0].nombre).toContain('Eliminar');
    });

    it('nuevaConsulta reinicia valores', () => {
        component.total = 5;
        component.usuariosAgrupados = [{ id: '1' } as any];
        component.parametros.pagina = 5;

        spyOn(component, 'buscar'); // Evita efectos de buscar()

        component.nuevaConsulta();

        expect(component.total).toBe(-1);
        expect(component.usuariosAgrupados.length).toBe(0);
        expect(component.parametros.pagina).toBe(0);
        expect(component.buscar).toHaveBeenCalled();
    });

    it('eliminarPerfilUsuarioEspecifico confirma y elimina', () => {
        actualizarService.confirmar.and.callFake((m, cb) => cb());
        component.eliminarPerfilUsuarioEspecifico({
            permisoTodasUc: { id: 8 },
        });
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    });

    it('onFiltroOrganismo sets filtroBase', () => {
        component.onFiltroOrganismo({ x: 1 } as any);
        expect(component.form.get('filtroBase')?.value).toEqual({ x: 1 });
    });

    it('ejecutarAccion navega con url', () => {
        component.ejecutarAccion({ url: ['/ir'] } as any);
        expect(router.navigate).toHaveBeenCalledWith(['/ir']);
    });

    it('eliminarPerfilTodos sin id muestra error', () => {
        spyOn(Logger, 'logError');
        component.eliminarPerfilTodos({ permisoTodasUc: undefined } as any);
        expect(Logger.logError).toHaveBeenCalled();
    });

    it('obtenerDepartamentos actualiza opciones', () => {
        spyOn(mockZonaService, 'obtenerZonas').and.returnValue(
            of([{ id: 1 }] as any)
        );
        component.obtenerDepartamentos();
        expect(component.opcionesDepartamento.length).toBe(1);
    });

    it('guardarPerfilUsuarioPorUc con ids válidos', () => {
        actualizarService.confirmar.and.callFake((m, cb) => cb());

        const mockData = {
            idInciso: 1,
            idUnidadEjecutora: 2,
            idUnidadCompra: 3,
        };
        const mockUsuario = {
            id: 'uy-ci-12345678',
            nombre: 'Test Usuario',
            permisos: [],
            permisoTodasUc: undefined,
        };

        component.guardarPerfilUsuarioPorUc(mockData, mockUsuario as any);
        expect(actualizarService.mensajeCorrecto).toHaveBeenCalled();
    });

    it('abrirOrganismoPopup delega guardarPerfilUsuarioPorUc', () => {
        const usuario = { id: '1' } as any;
        spyOn(component as any, 'abrirPopup').and.returnValue({
            guardarEvento: of({ idInciso: 1 }),
        });
        spyOn(component, 'guardarPerfilUsuarioPorUc');
        component.abrirOrganismoPopup(usuario);
        expect(component['abrirPopup']).toHaveBeenCalled();
        expect(component.guardarPerfilUsuarioPorUc).toHaveBeenCalledWith(
            { idInciso: 1 },
            usuario
        );
    });

    it('abrirAgregarPermisoPorPunto navega al buscador', () => {
        spyOn(component as any, 'abrirPopup').and.returnValue({
            guardarEvento: of({ idUsuario: '2' }),
        });
        spyOn(component, 'abrirBuscadorDePuntos');
        component.abrirAgregarPermisoPorPunto();
        expect(component['abrirPopup']).toHaveBeenCalled();
        expect(component.abrirBuscadorDePuntos).toHaveBeenCalledWith({
            idUsuario: '2',
        });
    });

    it('abrirNuevoUsuarioUcPopup muestra modal y maneja guardar', () => {
        const showSpy = spyOn(
            (component as any).modalService,
            'show'
        ).and.returnValue({ content: { guardarEvento: of('x') } });
        spyOn(component, 'guardarPerfilNuevoUsuarioPorUc');
        component.abrirNuevoUsuarioUcPopup();
        expect(showSpy).toHaveBeenCalled();
        expect(component.guardarPerfilNuevoUsuarioPorUc).toHaveBeenCalledWith(
            'x'
        );
    });

    it('guardarPerfilNuevoUsuarioPorUc valida ids', () => {
        actualizarService.confirmar.and.callFake((m, cb) => cb());
        const data = {
            unidadCompra: {
                idInciso: 1,
                idUnidadEjecutora: 2,
                idUnidadCompra: 3,
            },
            idUsuario: '7',
        };
        component.guardarPerfilNuevoUsuarioPorUc(data as any);
        expect(
            mockUsuarioOrganismoPerfilService.agregarResponsableRecepcionUC
        ).toHaveBeenCalled();
    });

    it('abrirBuscadorDePuntos navega con id', () => {
        component.abrirBuscadorDePuntos({ idUsuario: '10' });
        expect(router.navigate).toHaveBeenCalledWith([
            '/administracion/gestion-usuarios/consulta-usuario-recepcion',
            '10',
        ]);
    });
    it('buscar solo ejecuta servicio en modo correcto', () => {
        mockUsuarioOrganismoPerfilService.obtenerTodos.calls.reset();
        component.form.get('modoBusqueda')?.setValue(component.MODO_TODOS_PUNTOS);
        component.buscar();
        expect(mockUsuarioOrganismoPerfilService.obtenerTodos).toHaveBeenCalled();
    });

    it('descargarExcel envia filtro segun modo', () => {
        component.form.get('modoBusqueda')?.setValue(component.MODO_TODOS_PUNTOS);
        component.descargarExcel();
        expect(mockUsuarioOrganismoPerfilService.exportarUsuariosPerfil).toHaveBeenCalled();
    });

    it('guardarPerfilUsuarioTodasUc actualiza usuario', () => {
        actualizarService.confirmar.and.callFake((_m, cb) => cb());
        const usuario: any = { id: '5', tienePermisoTodas: false };
        component.guardarPerfilUsuarioTodasUc(usuario);
        expect(mockUsuarioOrganismoPerfilService.agregarResponsableRecepcionUCTodas).toHaveBeenCalledWith('5');
        expect(usuario.tienePermisoTodas).toBeTrue();
    });


    it('guardarPerfilUsuarioPorUc muestra error con ids faltantes', () => {
        spyOn(Logger, 'logError');
        actualizarService.confirmar.and.callFake((_m, cb) => cb());
        component.guardarPerfilUsuarioPorUc({}, { id: 'u' } as any);
        expect(Logger.logError).toHaveBeenCalled();
    });

    it('guardarPerfilNuevoUsuarioParaTodasUc confirma y ejecuta', fakeAsync(() => {
        actualizarService.confirmar.and.callFake((_m, cb) => cb());
        const data = { idUsuario: '9' };
        spyOn(component, 'buscar');
        component.guardarPerfilNuevoUsuarioParaTodasUc(data);
        tick(100);
        expect(mockUsuarioOrganismoPerfilService.agregarResponsableRecepcionUCTodas).toHaveBeenCalledWith('9');
        expect(component.buscar).toHaveBeenCalled();
    }));

    it('abrirAgregarUsuarioTodasLasUc abre popup y maneja evento', () => {
        spyOn(component as any, 'abrirPopup').and.returnValue({
            guardarEvento: of({ idUsuario: '1' }),
        });
        spyOn(component, 'guardarPerfilNuevoUsuarioParaTodasUc');
        component.abrirAgregarUsuarioTodasLasUc();
        expect(component['abrirPopup']).toHaveBeenCalled();
        expect(component.guardarPerfilNuevoUsuarioParaTodasUc).toHaveBeenCalledWith({ idUsuario: '1' });
    });

    it('guardarFiltro almacena snapshot', () => {
        (component as any).guardarFiltro();
        expect(snapshotService.save).toHaveBeenCalled();
    });

    it('buscarVolver restaura filtros y parametros', fakeAsync(() => {
        const snap = {
            filtro: { idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 },
            pagina: 2,
            tamanoPagina: 5,
            sort: 'col',
            order: 'desc',
        };
        snapshotService.load.and.returnValue(snap);
        (component as any).buscarVolver();
        tick(200);
        expect(component.parametros.pagina).toBe(2);
        expect(component.form.get('organismo')?.value.idInciso).toBe(1);
    }));

    it('obtenerAcciones retorna tres opciones sin permiso global', () => {
        component.form.get('modoBusqueda')?.setValue(component.MODO_FILTROS);
        const acciones = component.obtenerAcciones({
            id: '1',
            nombre: 'X',
            permisos: [],
            tienePermisoTodas: false,
            permisoTodasUc: undefined,
        }, component.MODO_FILTROS);
        expect(acciones.length).toBe(3);
    });

    it('buscar no ejecuta servicio si formulario invalido', () => {
        mockUsuarioOrganismoPerfilService.obtenerTodos.calls.reset();
        component.form.setErrors({ invalido: true } as any);
        component.buscar();
        expect(mockUsuarioOrganismoPerfilService.obtenerTodos).not.toHaveBeenCalled();
    });

    it('validarNombrePuntoRecepcion marca inválido cuando no cumple longitud', () => {
        component.form.get('nombrePuntoRecepcion')?.setValue('ab');
        component.validarNombrePuntoRecepcion();
        expect(component.nombrePuntoRecepcionValido).toBeFalse();
        component.form.get('nombrePuntoRecepcion')?.setValue('abcd');
        component.validarNombrePuntoRecepcion();
        expect(component.nombrePuntoRecepcionValido).toBeTrue();
    });

    it('buscar no consulta cuando el nombre de punto es inválido', () => {
        mockUsuarioOrganismoPerfilService.obtenerTodos.calls.reset();
        component.nombrePuntoRecepcionValido = false;
        component.form.get('modoBusqueda')?.setValue(component.MODO_FILTROS);
        component.buscar();
        expect(mockUsuarioOrganismoPerfilService.obtenerTodos).not.toHaveBeenCalled();
    });

    it('buscar agrupa usuarios y setea acciones', () => {
        const respuesta = {
            content: [
                { idUsuario: '1', nombre: 'Uno' },
                { idUsuario: '1', nombre: 'Uno', unidadCompra: { id: 1 } },
                { idUsuario: '2', nombre: 'Dos', unidadCompra: { id: 2 } }
            ],
            page: { totalElements: 2 }
        } as any;
        mockUsuarioOrganismoPerfilService.obtenerTodos.and.returnValue(of(respuesta));
        component.nombrePuntoRecepcionValido = true;
        component.form.get('modoBusqueda')?.setValue(component.MODO_TODOS_PUNTOS);
        component.buscar();
        expect(component.usuariosAgrupados.length).toBe(2);
        expect(component.usuariosAgrupados[0].acciones?.length).toBeGreaterThan(0);
        expect(component.total).toBe(2);
    });

    it('descargarExcel envía el filtro actual', () => {
        (component as any).actualizarFiltro();
        component.descargarExcel();
        expect(mockUsuarioOrganismoPerfilService.exportarUsuariosPerfil).toHaveBeenCalledWith(jasmine.any(Object));
    });

    it('buscarVolver sin snapshot ejecuta nuevaConsulta', () => {
        snapshotService.load.and.returnValue(null);
        const nuevaSpy = spyOn(component, 'nuevaConsulta');
        (component as any).buscarVolver();
        expect(nuevaSpy).toHaveBeenCalled();
    });
});
