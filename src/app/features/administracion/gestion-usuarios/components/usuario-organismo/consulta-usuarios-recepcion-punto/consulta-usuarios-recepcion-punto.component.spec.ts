import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable, of } from 'rxjs';
import { PuntosRecepcionService } from 'src/app/features/administracion/puntos-recepcion/services/puntosRecepcion.service';
import { CabezalConsultaComponent } from 'src/app/shared/components/cabezal-consulta/cabezal-consulta.component';
import { FiltroOrganismoComponent } from 'src/app/shared/components/filtro-organismo/filtro-organismo.component';
import { FiltroComponent } from 'src/app/shared/components/filtro/filtro.component';
import { PaginadoComponent } from 'src/app/shared/components/paginado/paginado.component';
import { FormatoCiPipe } from 'src/app/shared/pipes/formato-ci.pipe';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { OrganismoService } from 'src/app/shared/services/organismo.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { ZonaService } from 'src/app/shared/services/zona.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Logger } from 'src/app/shared/utils/logger';
import { ConsultaUsuariosRecepcionPuntoComponent } from './consulta-usuarios-recepcion-punto.component';

class MockRoute {
    navigate = jasmine.createSpy('navigate');
    routerState = {};
    events = of();
    createUrlTree = jasmine.createSpy('createUrlTree');
    serializeUrl = jasmine.createSpy('serializeUrl');
    paramMap = of({ get: () => ({ idUsuario: 'uy-ci-33333333' }) });
}

export const mockZonaService = {
    obtenerZonas: () => of([]),
};

export const mockPuntosRecepcionService = {
    obtenerPuntosRecepcion: (
        _params?: any
    ): Observable<{
        content: any[];
        page: { totalElements: number };
    }> => of({ content: [], page: { totalElements: 0 } }),
    obtenerPuntosRecepcionSinPermisoUsuario: (
        _params?: any,
        _idUsuario?: string
    ): Observable<{
        content: any[];
        page: { totalElements: number };
    }> => of({ content: [], page: { totalElements: 0 } }),
};

export const mockUsuarioOrganismoPerfilService = {
    agregarResponsablePuntoRecepcion: () => of({}),
    eliminarPerfil: () => of({}),
    obtenerTodos: () => of([]),
};

export const mockOrganismoService = {
    obtenerIncisos: () => of([]),
    obtenerUE: () => of([]),
    obtenerUC: () => of([]),
};
describe('ConsultaUsuariosRecepcionPuntoComponent', () => {
    let component: ConsultaUsuariosRecepcionPuntoComponent;
    let actualizarService: jasmine.SpyObj<ActualizarService>;

    beforeEach(async () => {
        actualizarService = jasmine.createSpyObj('ActualizarService', [
            'confirmar',
            'mensajeCorrecto',
        ]);
        const route = {
            paramMap: of({ get: () => ({ idUsuario: 'uy-ci-33333333' }) }),
        };
        const usuarioService = jasmine.createSpyObj('UsuarioOrganismoService', [
            'obtenerUsuarioPorId',
            'obtenerInformacionUsuarioSice',
        ]);
        usuarioService.obtenerUsuarioPorId.and.returnValue(
            of({ id: 'test-id' })
        ); // Mock usuario response
        usuarioService.obtenerInformacionUsuarioSice.and.returnValue(
            of({ id: 'test-id' })
        ); // Mock usuario response

        await TestBed.configureTestingModule({
            declarations: [
                ConsultaUsuariosRecepcionPuntoComponent,
                FiltroComponent,
                FiltroOrganismoComponent,
                FormatoCiPipe,
                PaginadoComponent,
                CabezalConsultaComponent,
            ],
            imports: [ReactiveFormsModule, SharedModule, RouterTestingModule],
            providers: [
                {
                    provide: HttpClient,
                    useValue: jasmine.createSpyObj('HttpClient', [
                        'get',
                        'post',
                    ]),
                },
                { provide: ActualizarService, useValue: actualizarService },
                { provide: OrganismoService, useValue: mockOrganismoService },
                { provide: ActivatedRoute, useValue: route },
                { provide: UsuarioService, useValue: usuarioService },
                {
                    provide: UsuarioOrganismoPerfilService,
                    useValue: mockUsuarioOrganismoPerfilService,
                },
                { provide: ZonaService, useValue: mockZonaService },
                {
                    provide: PuntosRecepcionService,
                    useValue: mockPuntosRecepcionService,
                },
                { provide: BsModalService, useValue: {} },
                { provide: BsModalRef, useValue: {} },
            ],
        }).compileComponents();

        const fixture = TestBed.createComponent(
            ConsultaUsuariosRecepcionPuntoComponent
        );
        component = fixture.componentInstance;
        component.total = 0;
        fixture.detectChanges();

        component.form.addControl('filtroBase', new FormControl());
        component.form.addControl('tipoCompra', new FormControl());
        component.form.addControl('nroAnioCompra', new FormControl());
    });

    it('actualizarFiltro genera filtro sin reiniciar página', () => {
        component.usuario = { id: 'test-id' } as any;

        (component as any).usuario = component.usuario;

        if (!component.parametros) {
            component.parametros = { filtro: {}, pagina: 5 } as any;
        } else {
            component.parametros.pagina = 5;
        }
        component.form.patchValue({ tipoCompra: 'A', nroAnioCompra: '1' });
        component.form.get('filtroBase')?.setValue({ a: 1 });
        component.actualizarFiltro();
        expect(component.parametros.filtro).toEqual(
            jasmine.objectContaining({
                a: 1,
                tipoCompra: 'A',
                nroAnioCompra: '1',
            })
        );
        expect(component.parametros.pagina).toBe(5);
    });

    it('actualizarFiltroBase arma el filtro correctamente', () => {
        component.form.patchValue({ tipoCompra: 'B', nroAnioCompra: '2' });
        component.form.get('filtroBase')?.setValue({ b: 2 });
        (component as any).actualizarFiltroBase();
        expect(component.parametros.filtro).toEqual(
            jasmine.objectContaining({
                b: 2,
                tipoCompra: 'B',
                nroAnioCompra: '2',
            })
        );
    });

    it('nuevaConsulta reinicia estado', () => {
        component.puntosRecepcion = [{} as any];
        component.total = 5;
        component.parametros.pagina = 2;
        component.usuario = { id: 'test-id' } as any; // Ensure usuario is defined if needed

        component.nuevaConsulta();
        expect(component.puntosRecepcion.length).toBe(0);
        expect(component.parametros.pagina).toBe(0);
    });

    it('obtenerAccionesItem retorna accion agregar', () => {
        const acciones = component.obtenerAccionesItem({ id: 1 } as any);
        expect(acciones[0].nombre).toContain('Agregar');
    });

    it('agregarPermisoParaPunto valida id nulo', () => {
        spyOn(Logger, 'logError');
        actualizarService.confirmar.and.callFake((_msg, callback) =>
            callback()
        );

        component.agregarPermisoParaPunto({ id: null } as any);

        expect(Logger.logError).toHaveBeenCalledWith(
            'El id del punto de recepción es nulo.'
        );
    });

    it('agregarPermisoParaPunto con id llama servicio y buscar', () => {
        actualizarService.confirmar.and.callFake((m: any, cb: () => void) =>
            cb()
        );
        spyOn(component, 'buscar');
        component.usuario = { id: 'u' } as any;
        component.agregarPermisoParaPunto({ id: 5 } as any);
        expect(component.buscar).toHaveBeenCalled();
    });

    it('obtenerDepartamentos actualiza zonas', () => {
        spyOn(mockZonaService, 'obtenerZonas').and.returnValue(of([{ id: 1 }] as any));
        component.obtenerDepartamentos();
        expect(component.opcionesZona.length).toBe(1);
    });

    it('obtenerUsuario asigna datos del servicio', () => {
        const usuarioService = TestBed.inject(UsuarioService) as any;
        usuarioService.obtenerUsuarioPorId.and.returnValue(
            of({ id: '7', nombre: 'U' })
        );
        component.obtenerUsuario('7');
        expect(component.usuario.id).toBe('7');
    });

    it('buscar consulta puntos y transforma respuesta', () => {
        const service = TestBed.inject(PuntosRecepcionService) as any;
        spyOn(service, 'obtenerPuntosRecepcionSinPermisoUsuario').and.returnValue(
            of({
                content: [
                    {
                        id: 1,
                        unidadCompra: {
                            idUnidadCompra: 1,
                            descUnidadCompra: 'D',
                            idUnidadEjecutora: 2,
                            descUnidadEjecutora: 'UE',
                            idInciso: 3,
                            descInciso: 'I',
                        },
                    },
                ],
                page: { totalElements: 1 },
            })
        );
        component.idUsuario = 'u';
        component.buscar(true);
        expect(service.obtenerPuntosRecepcionSinPermisoUsuario).toHaveBeenCalled();
        expect(component.puntosRecepcion[0].idUnidadCompra).toBe(1);
        expect(component.parametros.pagina).toBe(0);
    });

    it('construirFiltroCompleto devuelve filtro completo', () => {
        component.parametros.pagina = 2;
        component.parametros.tamanoPagina = 5;
        component.parametros.sort = 'nombre';
        component.parametros.order = 'asc';
        component.form.patchValue({ idZona: '1', nombrePuntoRecepcion: 'Punto' });
        component.form.get('organismo')?.setValue({ idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 });
        component.actualizarFiltro();
        const filtro = component.construirFiltroCompleto();
        expect(filtro).toEqual(jasmine.objectContaining({
            page: 2,
            size: 5,
            sort: 'nombre',
            order: 'asc',
            idInciso: 1,
            idUnidadEjecutora: 2,
            idUnidadCompra: 3,
            idZona: '1',
            nombrePuntoRecepcion: 'Punto'
        }));
    });

    it('construirFiltroCompleto filtra nombres de punto con menos de 3 caracteres', () => {
        component.parametros.pagina = 2;
        component.parametros.tamanoPagina = 5;
        component.parametros.sort = 'nombre';
        component.parametros.order = 'asc';
        component.form.patchValue({ idZona: '1', nombrePuntoRecepcion: 'P' });
        component.form.get('organismo')?.setValue({ idInciso: 1, idUnidadEjecutora: 2, idUnidadCompra: 3 });
        component.actualizarFiltro();
        const filtro = component.construirFiltroCompleto();
        expect(filtro).toEqual(jasmine.objectContaining({
            page: 2,
            size: 5,
            sort: 'nombre',
            order: 'asc',
            idInciso: 1,
            idUnidadEjecutora: 2,
            idUnidadCompra: 3,
            idZona: '1',
            nombrePuntoRecepcion: ''
        }));
    });

    it('puntoInhabilitado verifica fecha', () => {
        const past = new Date(Date.now() - 1000);
        const future = new Date(Date.now() + 1000);
        expect(component.puntoInhabilitado({ fechaBaja: past } as any)).toBeTrue();
        expect(component.puntoInhabilitado({ fechaBaja: future } as any)).toBeFalse();
    });
});
