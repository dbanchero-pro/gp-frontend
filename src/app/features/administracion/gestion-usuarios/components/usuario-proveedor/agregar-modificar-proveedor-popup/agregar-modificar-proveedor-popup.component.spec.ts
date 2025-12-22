import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import {
    ComponentFixture,
    fakeAsync,
    TestBed,
    tick,
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { of } from 'rxjs';
import { ProveedorService } from 'src/app/features/administracion/puntos-recepcion/services/proveedor.service';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { PaisService } from 'src/app/shared/services/usuario/pais.service';
import { TipoDocumentoUsuarioService } from 'src/app/shared/services/usuario/tipo-documento-usuario.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { AgregarModificarProveedorPopupComponent } from './agregar-modificar-proveedor-popup.component';

describe('AgregarModificarProveedorPopupComponent', () => {
    let component: AgregarModificarProveedorPopupComponent;
    let fixture: ComponentFixture<AgregarModificarProveedorPopupComponent>;
    let mockBsModalRef: jasmine.SpyObj<BsModalRef>;
    const paisSrv = jasmine.createSpyObj('PaisService', ['obtenerTodos']);
    const tipoDocSrv = jasmine.createSpyObj('TipoDocumentoUsuarioService', [
        'obtenerTiposDocumentoUsuario',
    ]);
    const proveedorService = jasmine.createSpyObj('ProveedorService', [
        'obtenerProveedoresRupe',
    ]);
    let usuarioServiceMock: jasmine.SpyObj<any>;

    beforeEach(() => {
        mockBsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
        paisSrv.obtenerTodos.and.returnValue(
            of([{ id: Pais.URUGUAY, descripcion: 'Uruguay' }])
        );
        tipoDocSrv.obtenerTiposDocumentoUsuario.and.returnValue(
            of({ content: [{ idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD }] })
        );
        proveedorService.obtenerProveedoresRupe.and.returnValue(of([
            {
                id: '1',
                nombre: 'Proveedor 1',
                nroDocumento: '12345679',
                tipoDocumento: 'RUT',
                paisDocumento: { id: Pais.URUGUAY, descripcion: 'Uruguay' },
            },
        ]));
        usuarioServiceMock = jasmine.createSpyObj('UsuarioService', [
            'buscarUsuarioPorId',
        ]);

        TestBed.configureTestingModule({
            declarations: [AgregarModificarProveedorPopupComponent],
            imports: [ReactiveFormsModule, NgxMaskDirective, SharedModule],
            providers: [
                { provide: BsModalRef, useValue: mockBsModalRef },
                BsModalService,
                { provide: PaisService, useValue: paisSrv },
                { provide: TipoDocumentoUsuarioService, useValue: tipoDocSrv },
                { provide: ProveedorService, useValue: proveedorService },
                { provide: UsuarioService, useValue: usuarioServiceMock },
                provideNgxMask(),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(
            AgregarModificarProveedorPopupComponent
        );
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crear el formulario correctamente', () => {
        expect(component.form).toBeDefined();
        expect(component.form.controls['pais']).toBeDefined();
        expect(component.form.controls['tipoDoc']).toBeDefined();
        expect(component.form.controls['nroDoc']).toBeDefined();
    });

    it('no debería emitir guardarEvento si el formulario es inválido', () => {
        spyOn(component.guardarEvento, 'emit');
        spyOn(component, 'cerrarPopup');
        
        component.form.patchValue({ nroDoc: '' });
        component.guardar();
        expect(component.guardarEvento.emit).not.toHaveBeenCalled();
        expect(component.cerrarPopup).not.toHaveBeenCalled();
    });

    it('debería emitir guardarEvento y cerrar modal si el formulario es válido', fakeAsync(() => {
        const emitSpy = spyOn(component.guardarEvento, 'emit');
        component.idUsuarioBuscado = 'uy-ci-12345678';
        component.resultadoBusqueda = {
            id: 'uy-ci-12345678',
            nombre: 'Test',
            pais: { id: Pais.URUGUAY, descripcion: 'Uruguay' },
            tipoDocumento: { idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD },
            nroDocumento: '12345678',
            correo: 'test@correo.com',
        } as any;

        component.form.patchValue({
            pais: Pais.URUGUAY,
            tipoDoc: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            nroDoc: '12345678',
            correo: 'test@correo.com',
            nombre: 'Test',
            proveedor: '1', // <-- mismo id que en el mock
        });

        tick(); // asegura that proveedores están cargados

        component.guardar();

        expect(emitSpy).toHaveBeenCalled();
    }));

    it('prepararFormularioInicialSiHayDatos habilita valores iniciales', () => {
        component.datosIniciales = {
            pais: Pais.URUGUAY,
            tipoDoc: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            nroDoc: '1',
            correo: 'a@a.com',
            nombre: 'Juan',
            proveedor: '1',
            fechaNombreConfirmado: new Date(),
        } as any;

        component.ngOnInit();

        expect(component.form.get('pais')?.disabled).toBeTrue();
        expect(component.tituloFormulario).toContain('Modificar');
    });

    it('campoVacio detecta controles inválidos', () => {
        component.form.get('pais')?.setValue('');
        component.form.get('pais')?.markAsTouched();
        expect(component.campoVacio('pais')).toBeTrue();
        component.form.get('pais')?.setValue(Pais.URUGUAY);
        expect(component.campoVacio('pais')).toBeFalse();
    });

    it('generarIdUsuario concatena valores', () => {
        component.form.patchValue({ pais: Pais.URUGUAY, tipoDoc: TipoDocumentoUsuario.CEDULA_IDENTIDAD, nroDoc: '123' });
        expect(component.generarIdUsuario()).toBe('uy-ci-123');
    });


    it('debería buscar un usuario y actualizar resultadoBusqueda', fakeAsync(() => {
        const usuarioMock = {
            id: 'uy-ci-12345678',
            nombre: 'Carlos',
            pais: { id: Pais.URUGUAY, descripcion: 'Uruguay' },
            tipoDocumento: { idTipoDocumento: TipoDocumentoUsuario.CEDULA_IDENTIDAD },
            nroDocumento: '12345678',
            correo: '',
            proveedor: undefined,
            fechaNombreConfirmado: undefined,
        };

        usuarioServiceMock.buscarUsuarioPorId.and.returnValue(of(usuarioMock));

        component.form.patchValue({
            pais: Pais.URUGUAY,
            tipoDoc: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            nroDoc: '12345678',
            correo: '',
        });
        component.buscar();
        tick();
        expect(component.resultadoBusqueda).toEqual(usuarioMock);
    }));

    it('debería manejar respuesta nula al buscar usuario', fakeAsync(() => {
        usuarioServiceMock.buscarUsuarioPorId.and.returnValue(of(undefined));

        component.form.patchValue({
            pais: { codigo: Pais.URUGUAY, nombre: 'Uruguay' },
            tipoDoc: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            nroDoc: '12345678',
            correo: 'foo@bar.com',
        });
        component.form.updateValueAndValidity();

        component.resultadoBusqueda = { id: 'algo' } as any;

        component.buscar();

        expect(component.resultadoBusqueda).toBeUndefined();
    }));

    it('cambioPais selecciona CI para Uruguay', fakeAsync(() => {
        component.form.get('pais')?.setValue(Pais.URUGUAY);
        component.cambioPais();
        tick();
        expect(component.form.get('tipoDoc')?.value).toBe(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
    }));

    it('guardar muestra error si documento no coincide con buscado', fakeAsync(() => {
        component.idUsuarioBuscado = 'uy-ci-1';
        component.form.patchValue({
            pais: Pais.URUGUAY,
            tipoDoc: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            nroDoc: '2',
            correo: 'a@a.com',
            nombre: 'Juan',
            proveedor: '1'
        });
        fixture.detectChanges();
        component.guardar();
        tick();
        expect(component.resultMsg.length).toBeGreaterThan(0);
    }));
});
