import { EventEmitter, NO_ERRORS_SCHEMA } from '@angular/core';
import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { of } from 'rxjs';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { ITipoDocumentoUsuarioDTO } from 'src/app/shared/models/usuario/tipo-documento-usuario.model';
import { UsuarioProveedorDTO } from 'src/app/shared/models/usuario/usuario-proveedor.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { PaisService } from 'src/app/shared/services/usuario/pais.service';
import { TipoDocumentoUsuarioService } from 'src/app/shared/services/usuario/tipo-documento-usuario.service';
import { UsuarioProveedorService } from 'src/app/shared/services/usuario/usuario-proveedor.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Logger } from 'src/app/shared/utils/logger';
import { UsuarioProveedorGuardarDTO } from '../../../models/usuario-proveedor-guardar.model';
import { ConsultaUsuariosProveedorComponent } from './consulta-usuarios-proveedor.component';

class MockRouter {
  navigate = jasmine.createSpy('navigate');
  routerState = {};
  events = of();
  createUrlTree = jasmine.createSpy('createUrlTree');
  serializeUrl = jasmine.createSpy('serializeUrl');
}

describe('ConsultaUsuariosProveedor', () => {
    let component: ConsultaUsuariosProveedorComponent;
    let fixture: ComponentFixture<ConsultaUsuariosProveedorComponent>;

    let paisServiceMock: jasmine.SpyObj<PaisService>;
    let tipoDocumentoServiceMock: jasmine.SpyObj<TipoDocumentoUsuarioService>;
    let usuarioProveedorServiceMock: jasmine.SpyObj<UsuarioProveedorService>;
    let modalServiceMock: jasmine.SpyObj<BsModalService>;
    let actualizarServiceMock: jasmine.SpyObj<ActualizarService>;
    let seguridadServiceMock: jasmine.SpyObj<SeguridadService>;
    let route = new MockRouter();

    beforeEach(async () => {
        paisServiceMock = jasmine.createSpyObj('PaisService', ['obtenerTodos']);
        tipoDocumentoServiceMock = jasmine.createSpyObj(
            'TipoDocumentoUsuarioService',
            ['obtenerTiposDocumentoUsuario']
        );
        usuarioProveedorServiceMock = jasmine.createSpyObj(
            'UsuarioProveedorService',
            [
                'obtenerUsuarioPorId',
                'guardarUsuarioProveedor',
                'eliminarUsuarioProveedor',
                'obtenerTodosUsuariosProveedores',
                'obtenerTodosUsuariosProveedoresUsuarioOrganismos',
                'exportarExcelUsuariosProveedor',
                'exportarExcelUsuariosProveedorUsuarioOrganismo',
                'actualizarUsuarioProveedor',
            ]
        );
        modalServiceMock = jasmine.createSpyObj('BsModalService', ['show']);
        actualizarServiceMock = jasmine.createSpyObj(
            'ActualizarService',
            ['confirmar', 'mensajeCorrecto', 'mensajeOcultar'],
            {
                tipoUsuario$: of(TipoUsuario.PROVEEDOR),
                capturarErrores: false,
            }
        );
        actualizarServiceMock.popups = [];
        seguridadServiceMock = jasmine.createSpyObj('SeguridadService', [
            'tienePermiso',
            'tieneAlgunPermiso',
            'obtenerTipoUsuario',
            'obtenerProveedores',
        ]);
        seguridadServiceMock.tienePermiso.and.returnValue(true);
        seguridadServiceMock.obtenerTipoUsuario.and.returnValue(
            TipoUsuario.PROVEEDOR
        );
        seguridadServiceMock.obtenerProveedores.and.returnValue([]);
        spyOn(Logger, 'logError').and.stub();

        await TestBed.configureTestingModule({
            imports: [
                ReactiveFormsModule,
                FormsModule,
                RouterTestingModule,
                SharedModule,
                BrowserAnimationsModule,
                NgxMaskDirective,
            ],
            declarations: [ConsultaUsuariosProveedorComponent],
            providers: [
                { provide: PaisService, useValue: paisServiceMock },
                {
                    provide: TipoDocumentoUsuarioService,
                    useValue: tipoDocumentoServiceMock,
                },
                {
                    provide: UsuarioProveedorService,
                    useValue: usuarioProveedorServiceMock,
                },
                { provide: BsModalService, useValue: modalServiceMock },
                { provide: ActualizarService, useValue: actualizarServiceMock },
                { provide: SeguridadService, useValue: seguridadServiceMock },
                { provide: BsModalRef, useValue: {} },
                provideNgxMask(),
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(fakeAsync(() => {
        paisServiceMock.obtenerTodos.and.returnValue(
            of([{ id: Pais.URUGUAY, descripcion: 'Uruguay' }])
        );

        tipoDocumentoServiceMock.obtenerTiposDocumentoUsuario.and.returnValue(
            of({
                content: [{ idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD }],
            } as PageModel<ITipoDocumentoUsuarioDTO>)
        );

        usuarioProveedorServiceMock.obtenerTodosUsuariosProveedores.and.returnValue(
            of({
                content: [],
                pageable: {},
                totalPages: 0,
                totalElements: 0,
                last: false,
            } as unknown as PageModel<UsuarioProveedorDTO>)
        );

        actualizarServiceMock.confirmar.and.callFake(
            (_: string, cb: () => void) => cb()
        );

        fixture = TestBed.createComponent(ConsultaUsuariosProveedorComponent);
        component = fixture.componentInstance;

        spyOn(component, 'buscar').and.stub();

        fixture.detectChanges();
        tick();
        fixture.detectChanges();
    }));

    it('debería crear el componente', () => {
        expect(component).toBeTruthy();
    });

    it('debería actualizar tipoDocumentoOpciones al cambiar país', () => {
        tipoDocumentoServiceMock.obtenerTiposDocumentoUsuario.and.returnValue(
            of({
                content: [{ idTipoDocumento: 'DNI' }],
            } as PageModel<ITipoDocumentoUsuarioDTO>)
        );
        component.form.get('paisControl')?.setValue('AR');
        component.cargarTiposDocumento('DNI');
        fixture.detectChanges();
        expect(component.tiposDocumento[0].idTipoDocumento).toBe('DNI');
    });

    it('debería guardar un usuario proveedor correctamente', () => {
        usuarioProveedorServiceMock.guardarUsuarioProveedor.and.returnValue(
            of({
                id: '',
                nombre: '',
                pais: '',
                tipoDocumento: '',
                nroDocumento: '',
                proveedor: '',
                correo: '',
            } as unknown as UsuarioProveedorDTO)
        );

        component.paises = [{ id: Pais.URUGUAY, descripcion: 'Uruguay' }];

        
        const datos: UsuarioProveedorGuardarDTO = {
            id: 'uy-cy-123134',
            proveedor: {
                id: '1',
                nombre: 'Empresa 1',
                nroDocumento: '23242555',
                tipoDocumento: 'RUT',
                paisDocumento: { id: Pais.URUGUAY, descripcion: 'Uruguay' },
            },
            nombre: 'Juan',
            correo: 'mail@mail.com',
        };

        component.guardarUsuario(datos);

        expect(
            usuarioProveedorServiceMock.guardarUsuarioProveedor
        ).toHaveBeenCalled();
    });
    it('agruparUsuarios debería unir usuarios por documento', () => {
        const dto = {
            id: 'id',
            pais: { id: Pais.URUGUAY, descripcion: 'Uruguay' },
            tipoDocumento: { idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD, descripcion: TipoDocumentoUsuario.CEDULA_IDENTIDAD },
            nroDocumento: '12345678',
            nombre: 'Juan',
            correo: 'a@a.com',
            proveedor: { nombre: 'Emp', id: '1' },
        } as unknown as UsuarioProveedorDTO;

        const agrupado = (component as any).agruparUsuarios([dto, dto]);
        expect(agrupado.length).toBe(1);
        expect(agrupado[0].usuarioProveedores.length).toBe(2);
    });

    it('cambioColumnaOrden actualiza el parámetro sort', () => {
        component.cambioColumnaOrden('nombre');
        expect(component.parametros.sort).toBe('nombre');
    });

    it('cargarPaises actualiza la lista', () => {
        paisServiceMock.obtenerTodos.and.returnValue(
            of([{ id: 'BR', descripcion: 'Brasil' }])
        );
        component.cargarPaises();
        expect(component.paises[0].id).toBe('BR');
    });

    it('buscar no llama al servicio si el formulario es inválido', () => {
        usuarioProveedorServiceMock.obtenerTodosUsuariosProveedores.calls.reset();
        component.buscar();
        expect(
            usuarioProveedorServiceMock.obtenerTodosUsuariosProveedores
        ).not.toHaveBeenCalled();
    });

    it('nuevaConsulta reinicia parametros y formulario', () => {
        component.form.patchValue({
            paisControl: Pais.URUGUAY,
            tipoDocControl: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            nroDocumento: '123',
        });
        component.parametros.pagina = 2;
        component.parametros.sort = 'nombre';
        component.parametros.order = 'desc';
        component.usuarios = [{} as any];
        component.total = 5;

        component.nuevaConsulta();

        expect(component.form.get('paisControl')?.value).toBe('');
        expect(component.form.get('tipoDocControl')?.value).toBe('');
        expect(component.parametros.pagina).toBe(0);
        expect(component.parametros.sort).toBe('nroDocumento');
        expect(component.usuarios.length).toBe(0);
        expect(component.total).toBe(-1);
        expect(component.buscar).toHaveBeenCalled();
    });
    it('descargarExcel llama al servicio', () => {
        (component as any).actualizarFiltro();
        component.descargarExcel();
        expect(usuarioProveedorServiceMock.exportarExcelUsuariosProveedor).toHaveBeenCalledWith({
            idPais: '',
            idTipoDocumento: '',
            nroDocumento: '',
        });
    });
    it('eliminarUsuarioProveedor ejecuta confirmación y recarga', () => {
        const usuario = {
            idUsuario: 'UY-CI-1',
            documentoFormateado: '',
            nombre: '',
            paisDoc: 'Uruguay',
            tipoDoc: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            usuarioProveedores: [],
        } as any;
        const usuarioProveedor = {
            correo: 'test@test.com',
            proveedor: {
                id: '1',
                nroDocumento: '123',
                tipoDocumento: 'RUT',
                paisDocumento: { id: Pais.URUGUAY },
            },
        } as UsuarioProveedorDTO;
        usuarioProveedorServiceMock.eliminarUsuarioProveedor.and.returnValue(
            of(true)
        );

        component.eliminarUsuarioProveedor(usuario, usuarioProveedor);

        expect(
            usuarioProveedorServiceMock.eliminarUsuarioProveedor
        ).toHaveBeenCalledWith('uy-ci-1', Pais.URUGUAY, 'RUT', '123');
        expect(actualizarServiceMock.mensajeCorrecto).toHaveBeenCalled();
        expect(component.buscar).toHaveBeenCalled();
    });

    it('guardarUsuario actualiza usuario cuando hay datos iniciales', () => {
        usuarioProveedorServiceMock.actualizarUsuarioProveedor.and.returnValue(
            of({} as any)
        );
        const dto: UsuarioProveedorGuardarDTO = {
            id: 'uy-ci-1',
            proveedor: {
                paisDocumento: { id: Pais.URUGUAY },
                tipoDocumento: 'RUT',
                nroDocumento: '123',
            } as any,
            nombre: '',
            correo: '',
        };
        component.guardarUsuario(dto, { idUsuario: 'UY-CI-1' } as any);
        expect(
            usuarioProveedorServiceMock.actualizarUsuarioProveedor
        ).toHaveBeenCalled();
    });

    it('abrirPopupModificar usa modalService', () => {
        const modalRef = {
            content: {
                guardarEvento: new EventEmitter<UsuarioProveedorGuardarDTO>(),
            },
        } as any;
        modalServiceMock.show.and.returnValue(modalRef);
        component.abrirPopupModificar({ idUsuario: '1' } as any);
        expect(modalServiceMock.show).toHaveBeenCalled();
    });

    it('abrirVinculoEmpresaPopup muestra mensaje', () => {
        const modalRef = {
            content: {
                guardarEvento: new EventEmitter<UsuarioProveedorGuardarDTO>(),
            },
        } as any;
        modalServiceMock.show.and.returnValue(modalRef);
        component.abrirVinculoEmpresaPopup({} as any);
        modalRef.content.guardarEvento.emit({} as any);
        expect(actualizarServiceMock.mensajeCorrecto).toHaveBeenCalled();
    });
    it('obtenerAccionesEmpresa devuelve acciones', () => {
        seguridadServiceMock.obtenerTipoUsuario.and.returnValue(
            TipoUsuario.PROVEEDOR
        );

        const usuarioProveedor = {
            correo: 'test@test.com',
            proveedor: {
                id: '1',
                nombre: 'Empresa Test',
                nroDocumento: '123',
                tipoDocumento: 'RUT',
                paisDocumento: { id: Pais.URUGUAY },
            },
        } as UsuarioProveedorDTO;

        const acciones = component.obtenerAccionesEmpresa(
            { idUsuario: '1', usuarioProveedores: [] } as any,
            usuarioProveedor,
            TipoUsuario.PROVEEDOR
        );
        expect(acciones.length).toBe(2);
        expect(acciones[0].nombre).toBe('Modificar');
    });

    it('cambioPais asigna CI cuando pais es UY', fakeAsync(() => {
        component.form.get('paisControl')?.setValue(Pais.URUGUAY);
        component.cambioPais();
        tick();
        expect(component.form.get('tipoDocControl')?.value).toBe(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
    }));

    it('vincularEmpresa delega a abrirVinculoEmpresaPopup', () => {
        spyOn(component, 'abrirVinculoEmpresaPopup');
        component.vincularEmpresa({} as any);
        expect(component.abrirVinculoEmpresaPopup).toHaveBeenCalled();
    });

    it('cambioTipoDoc mantiene el número de documento', fakeAsync(() => {
        component.form.get('nroDocumento')?.setValue('12');
        component.cambioTipoDoc();
        tick();
        expect(component.form.get('nroDocumento')?.value).toBe('12');
    }));

    it('buscar asigna usuarios y total', () => {
        (component.buscar as jasmine.Spy).and.callThrough();
        usuarioProveedorServiceMock.obtenerTodosUsuariosProveedores.and.returnValue(
            of({
                content: [
                    {
                        pais: { id: Pais.URUGUAY },
                        tipoDocumento: { idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD },
                        nroDocumento: '1',
                        proveedor: { nombre: 'P' },
                    } as UsuarioProveedorDTO,
                ],
                page: { totalElements: 3 },
            } as any)
        );
        component.buscar();
        expect(usuarioProveedorServiceMock.obtenerTodosUsuariosProveedores).toHaveBeenCalled();
        expect(component.usuarios.length).toBe(1);
        expect(component.total).toBe(3);
    });

    it('buscar usa servicio de organismo cuando no es proveedor', () => {
        component.tipoUsuario = TipoUsuario.ORGANISMO;
        (component.buscar as jasmine.Spy).and.callThrough();
        usuarioProveedorServiceMock.obtenerTodosUsuariosProveedoresUsuarioOrganismos.and.returnValue(
            of({ content: [], page: { totalElements: 0 } } as any)
        );
        component.buscar();
        expect(
            usuarioProveedorServiceMock.obtenerTodosUsuariosProveedoresUsuarioOrganismos
        ).toHaveBeenCalled();
    });

    it('descargarExcel usa servicio organismo segun tipo', () => {
        component.tipoUsuario = TipoUsuario.ORGANISMO;
        component.descargarExcel();
        expect(
            usuarioProveedorServiceMock.exportarExcelUsuariosProveedorUsuarioOrganismo
        ).toHaveBeenCalled();
    });

    it('modificarUsuarioProveedor usa valores por defecto cuando faltan datos', () => {
        spyOn(component, 'abrirPopupModificar');
        component.modificarUsuarioProveedor({} as any, {} as any);
        expect(component.abrirPopupModificar).toHaveBeenCalledWith(
            jasmine.objectContaining({
                idUsuario: '',
                nombre: '',
                correo: '',
                proveedor: '',
            })
        );
    });

    it('modificarUsuarioProveedor delega a abrirPopupModificar', () => {
        spyOn(component, 'abrirPopupModificar');
        component.paises = [{ id: Pais.URUGUAY, descripcion: 'Uruguay' }];
        component.tiposDocumento = [{ idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD, descripcion: TipoDocumentoUsuario.CEDULA_IDENTIDAD }];
        const uAg = {
            idUsuario: 'UY-CI-1',
            nombre: 'Juan',
            paisDoc: 'Uruguay',
            tipoDoc: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            fechaNombreConfirmado: new Date(),
        } as any;
        const uProv = {
            correo: 'c@test',
            proveedor: {
                id: '1',
                tipoDocumento: 'RUT',
                nroDocumento: '123',
                paisDocumento: { id: Pais.URUGUAY },
            },
        } as any;
        component.modificarUsuarioProveedor(uAg, uProv);
        expect(component.abrirPopupModificar).toHaveBeenCalled();
    });

    it('cargarTiposDocumento vacía la lista cuando no hay país', () => {
        component.form.get('paisControl')?.setValue(null);
        component.cargarTiposDocumento('');
        expect(component.tiposDocumento.length).toBe(0);
        expect(component.form.get('tipoDocControl')?.value).toBe('');
    });

    it('cargarTiposDocumento mantiene el tipo si no hay valor por defecto', () => {
        component.cargarTiposDocumento('');
        expect(component.form.get('tipoDocControl')?.value).toBe('');
    });

    it('nuevaConsulta carga tipos de documento cuando el país cambia', () => {
        spyOn(component, 'cargarTiposDocumento');
        component.form.patchValue({ paisControl: 'AR' });
        component.nuevaConsulta();
        expect(component.cargarTiposDocumento).toHaveBeenCalledWith(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
    });

    it('buscar reinicia la página cuando se resetea', () => {
        (component.buscar as jasmine.Spy).and.callThrough();
        component.parametros.pagina = 5;
        usuarioProveedorServiceMock.obtenerTodosUsuariosProveedores.and.returnValue(
            of({ content: [], page: { totalElements: 0 } } as any)
        );
        component.buscar(true);
        expect(component.parametros.pagina).toBe(0);
    });

    it('guardarUsuario no actualiza si faltan datos del proveedor', () => {
        const dto: UsuarioProveedorGuardarDTO = {
            id: 'uy-ci-1',
            proveedor: {} as any,
            nombre: '',
            correo: '',
        };
        component.guardarUsuario(dto, { idUsuario: 'UY-CI-1' } as any);
        expect(
            usuarioProveedorServiceMock.actualizarUsuarioProveedor
        ).not.toHaveBeenCalled();
    });

    it('obtenerAccionesEmpresa devuelve vacío para otro tipo de usuario', () => {
        const acciones = component.obtenerAccionesEmpresa(
            {} as any,
            {} as any,
            TipoUsuario.ORGANISMO
        );
        expect(acciones.length).toBe(0);
    });

    it('mostrarAccionVinculo devuelve true con más de un proveedor', () => {
        seguridadServiceMock.obtenerProveedores.and.returnValue([{},{ } as any]);
        expect(component.mostrarAccionVinculo()).toBeTrue();
    });

    it('mostrarAccionVinculo devuelve false si no es proveedor', () => {
        seguridadServiceMock.obtenerTipoUsuario.and.returnValue(
            TipoUsuario.ORGANISMO
        );
        expect(component.mostrarAccionVinculo()).toBeFalse();
    });
});
