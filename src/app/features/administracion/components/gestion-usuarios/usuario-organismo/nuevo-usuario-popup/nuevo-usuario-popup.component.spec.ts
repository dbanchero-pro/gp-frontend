import { Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AbstractControl, ControlValueAccessor, FormBuilder, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { PageModel } from 'src/app/shared/models/common/page/page.model';
import { UsuarioOrganismoPerfilDTO } from 'src/app/shared/models/usuario/usuario-organismo-perfil.model';
import { UsuarioOrganismoDTO } from 'src/app/shared/models/usuario/usuario-organismo.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { UsuarioOrganismoService } from 'src/app/shared/services/usuario/usuario-organismo.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { NuevoUsuarioPopupComponent } from './nuevo-usuario-popup.component';

export const mockHttp = {
    get: jasmine.createSpy('get').and.returnValue({
        subscribe: (callback: any) => callback({ content: [] }),
    }),
    post: jasmine.createSpy('post').and.returnValue({
        subscribe: (callback: any) => callback({ id: '1' }),
    }),
};

@Component({
    selector: 'app-input-documento',
    template: '',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockInputDocumentoComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => MockInputDocumentoComponent),
            multi: true
        }
    ]
})
export class MockInputDocumentoComponent implements ControlValueAccessor, Validator {
    // no-op state
    writeValue(obj: any): void { /* no-op */ }
    registerOnChange(fn: any): void { /* no-op */ }
    registerOnTouched(fn: any): void { /* no-op */ }
    setDisabledState?(isDisabled: boolean): void { /* no-op */ }
    markAsTouched(): void { /* no-op */ }

    validate(control: AbstractControl): ValidationErrors | null {
        return null; // siempre válido
    }
}
describe('NuevoUsuarioPopup', () => {
    let component: NuevoUsuarioPopupComponent;
    let bsModalRef: jasmine.SpyObj<BsModalRef>;
    let usuarioService: jasmine.SpyObj<UsuarioOrganismoService>;
    let usuarioPerfilService: jasmine.SpyObj<UsuarioOrganismoPerfilService>;
    let actualizarService: jasmine.SpyObj<ActualizarService>;
    let bsModalService: jasmine.SpyObj<BsModalService>;
    beforeEach(async () => {
        bsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);
        usuarioService = jasmine.createSpyObj('UsuarioService', ['obtenerInformacionUsuarioSice']);
        usuarioPerfilService = jasmine.createSpyObj('UsuarioOrganismoPerfilService', ['obtenerTodos']);
        actualizarService = jasmine.createSpyObj('ActualizarService', [], { capturarErrores: true, });
        bsModalService = jasmine.createSpyObj('BsModalService', ['show']);

        await TestBed.configureTestingModule({
            declarations: [],
            imports: [
              ReactiveFormsModule,
              MockInputDocumentoComponent,
              NuevoUsuarioPopupComponent,
            ],
            providers: [
                { provide: BsModalRef, useValue: bsModalRef },
                FormBuilder,
                { provide: BsModalService, useValue: bsModalService },
                { provide: UsuarioOrganismoService, useValue: usuarioService },
                {
                    provide: UsuarioOrganismoPerfilService,
                    useValue: usuarioPerfilService,
                },
                { provide: ActualizarService, useValue: actualizarService },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
        const fixture = TestBed.createComponent(NuevoUsuarioPopupComponent);
        component = fixture.componentInstance;
        component.tipoPerfil = TipoPerfil.Conformidad;
        fixture.detectChanges();
    });

    it('debe crear los controles del formulario', () => {
        expect((component as any).form.get('nroDocumento')).toBeTruthy();
    });
    it('guardar debería emitir y cerrar modal', () => {
        spyOn(component.guardarEvento, 'emit');
        spyOn(component, 'cerrarPopup');
        component.form.patchValue({ nroDocumento: '1234567', esEditor: true });
        component.tienePermisoTodas = false;
        component.guardar();

        expect(component.guardarEvento.emit).toHaveBeenCalledWith(
            jasmine.objectContaining({ idUsuario: 'uy-ci-1234567', esEditor: true }) as any
        );
        
        expect(component.cerrarPopup).toHaveBeenCalled();
    });

    it('guardar debería emitir y cerrar modal', () => {
        spyOn(component.guardarEvento, 'emit');
        spyOn(component, 'cerrarPopup');
        component.form.patchValue({ nroDocumento: '1234567', esEditor: true });
        component.tienePermisoTodas = false;
        component.guardar();

        expect(component.guardarEvento.emit).toHaveBeenCalledWith(
            jasmine.objectContaining({ idUsuario: 'uy-ci-1234567', esEditor: true }) as any
        );
        
        expect(component.cerrarPopup).toHaveBeenCalled();
    });

    it('guardar no debería emitir si tiene permiso global', () => {
        spyOn(component.guardarEvento, 'emit');
        spyOn(component, 'cerrarPopup');
        component.form.patchValue({ nroDocumento: '1234567' });
        component.tienePermisoTodas = true;
        component.usuario = { nroDocumento: '1234567' } as UsuarioOrganismoDTO;

        component.guardar();

        expect(component.guardarEvento.emit).not.toHaveBeenCalled();
        expect(component.cerrarPopup).not.toHaveBeenCalled();
    });
    it('guardar no emite si formulario invalido', () => {
        spyOn(component.guardarEvento, 'emit');
        (component as any).form.get('nroDocumento')?.setValue(null);
        component.guardar();
        expect(component.guardarEvento.emit).not.toHaveBeenCalled();
    });

    it('buscar no llama obtenerUsuario si el formulario es inválido', () => {
        spyOn(component, 'obtenerUsuario');
        component.buscar();
        expect(component.obtenerUsuario).not.toHaveBeenCalled();
    });

    it('buscar llama obtenerUsuario si el formulario es válido', () => {
        spyOn(component, 'obtenerUsuario');
        component.form.patchValue({ nroDocumento: '1234567' });
        component.buscar();
        expect(component.obtenerUsuario).toHaveBeenCalledWith('1234567');
    });
    it('obtenerUsuario asigna usuario devuelto', () => {
        const usuario: UsuarioOrganismoDTO = {
            id: '1',
            nombre: 'Test',
            pais: {} as any,
            tipoDocumento: {} as any,
            nroDocumento: '1234567',
            unidadCompra: {
                id: 2,
                idInciso: 1,
                idUnidadCompra: 3,
                idUnidadEjecutora: 4,
            },
            correo: '',
        };
        usuarioService.obtenerInformacionUsuarioSice.and.returnValue(
            of(usuario)
        );

        const emptyPage: PageModel<UsuarioOrganismoPerfilDTO> = {
            content: [],
            totalPages: 0,
            totalElements: 0,
            page: 0,
            last: true,
            size: 0,
            number: 0,
            numberOfElements: 0,
            first: true,
            sort: { sorted: false, unsorted: true, empty: true },
            empty: true,
        };
        usuarioPerfilService.obtenerTodos.and.returnValue(of(emptyPage));

        component.obtenerUsuario('2');
        expect(component.usuario).toEqual(usuario);
    });
    it('verificarPermisoTodas debería marcar tienePermisoTodas como true si encuentra permisos', () => {
        const pageWithContent: PageModel<UsuarioOrganismoPerfilDTO> = {
            content: [
                {
                    id: 1,
                    idUsuario: 'uy-ci-12345678',
                    nombre: 'Test User',
                    perfil: TipoPerfil.Conformidad,
                    nroDocumento: '12345678',
                    correo: 'test@example.com',
                },
            ],
            totalPages: 1,
            totalElements: 1,
            page: 0,
            last: true,
            size: 10,
            number: 0,
            numberOfElements: 1,
            first: true,
            sort: { sorted: false, unsorted: true, empty: true },
            empty: false,
        };
        usuarioPerfilService.obtenerTodos.and.returnValue(of(pageWithContent));

        component.verificarPermisoTodas('12345678');

        expect(component.tienePermisoTodas).toBeTrue();
        expect(component.showMsg).toBeTrue();
    });
    it('verificarPermisoTodas debería marcar tienePermisoTodas como false si no encuentra permisos', () => {
        const emptyPage: PageModel<UsuarioOrganismoPerfilDTO> = {
            content: [],
            totalPages: 0,
            totalElements: 0,
            page: 0,
            last: true,
            size: 0,
            number: 0,
            numberOfElements: 0,
            first: true,
            sort: { sorted: false, unsorted: true, empty: true },
            empty: true,
        };
        usuarioPerfilService.obtenerTodos.and.returnValue(of(emptyPage));

        component.verificarPermisoTodas('12345678');

        expect(component.tienePermisoTodas).toBeFalse();
        expect(component.showMsg).toBeFalse();
    });

    it('el botón de guardar debería estar deshabilitado cuando tienePermisoGlobal es true', () => {
        component.usuario = {
            id: '1',
            nombre: 'Test',
            pais: {} as any,
            tipoDocumento: {} as any,
            nroDocumento: '2',
            unidadCompra: {
                id: 2,
                idInciso: 1,
                idUnidadCompra: 3,
                idUnidadEjecutora: 4,
            },
            correo: '',
        };
        component.tienePermisoTodas = true;

        spyOn(component.guardarEvento, 'emit');
        component.guardar();
        expect(component.guardarEvento.emit).not.toHaveBeenCalled();
    });
});



