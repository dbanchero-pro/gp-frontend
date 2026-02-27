import { Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { FormatoCiPipe } from 'src/app/shared/pipes/formato-ci.pipe';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioOrganismoService } from 'src/app/shared/services/usuario/usuario-organismo.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { NuevoUsuarioTipoCompraPopupComponent } from './nuevo-usuario-tipo-compra-popup.component';

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
class MockInputDocumentoComponent implements ControlValueAccessor, Validator {
    writeValue(_obj: any): void { /* no-op */ }
    registerOnChange(_fn: any): void { /* no-op */ }
    registerOnTouched(_fn: any): void { /* no-op */ }
    setDisabledState?(_isDisabled: boolean): void { /* no-op */ }
    validate(_control: AbstractControl): ValidationErrors | null {
        return null;
    }
}

describe('NuevoUsuarioTipoCompraPopupComponent', () => {
    let component: NuevoUsuarioTipoCompraPopupComponent;
    let fixture: ComponentFixture<NuevoUsuarioTipoCompraPopupComponent>;

    const bsModalServiceStub = jasmine.createSpyObj('BsModalService', ['show']);
    bsModalServiceStub.show.and.returnValue({ content: {}, hide: jasmine.createSpy('hide') });
    const usuarioOrganismoServiceStub = jasmine.createSpyObj('UsuarioOrganismoService', ['obtenerInformacionUsuarioSice']);
    usuarioOrganismoServiceStub.obtenerInformacionUsuarioSice.and.returnValue(of({}));
    const usuarioOrganismoPerfilServiceStub = jasmine.createSpyObj('UsuarioOrganismoPerfilService', ['obtenerTodos']);
    usuarioOrganismoPerfilServiceStub.obtenerTodos.and.returnValue(of({ content: [] }));
    const tipoCompraServiceStub = jasmine.createSpyObj('TipoCompraService', ['obtenerTiposCompraSinPaginado']);
    tipoCompraServiceStub.obtenerTiposCompraSinPaginado.and.returnValue(of([]));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NuevoUsuarioTipoCompraPopupComponent, MockInputDocumentoComponent, FormatoCiPipe],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: BsModalService, useValue: bsModalServiceStub },
                { provide: UsuarioOrganismoService, useValue: usuarioOrganismoServiceStub },
                { provide: UsuarioOrganismoPerfilService, useValue: usuarioOrganismoPerfilServiceStub },
                { provide: TipoCompraService, useValue: tipoCompraServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(NuevoUsuarioTipoCompraPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
