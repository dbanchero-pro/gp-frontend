import { Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioRolesService } from 'src/app/shared/services/usuario/usuario-roles.service';
import { ConsultaUsuariosRolesComponent } from './consulta-usuarios-roles.component';

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

@Component({
    selector: 'app-filtro-organismo',
    template: '',
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => MockFiltroOrganismoComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => MockFiltroOrganismoComponent),
            multi: true
        }
    ]
})
class MockFiltroOrganismoComponent implements ControlValueAccessor, Validator {
    writeValue(_obj: any): void { /* no-op */ }
    registerOnChange(_fn: any): void { /* no-op */ }
    registerOnTouched(_fn: any): void { /* no-op */ }
    setDisabledState?(_isDisabled: boolean): void { /* no-op */ }
    validate(_control: AbstractControl): ValidationErrors | null {
        return null;
    }
}

describe('ConsultaUsuariosRolesComponent', () => {
    let component: ConsultaUsuariosRolesComponent;
    let fixture: ComponentFixture<ConsultaUsuariosRolesComponent>;

    const activatedRouteStub = {
        snapshot: {
            queryParamMap: { get: (_key: string) => null },
            params: {},
            paramMap: { get: (_key: string) => null }
        }
    };
    const routerStub = {
        navigate: jasmine.createSpy('navigate'),
        navigateByUrl: jasmine.createSpy('navigateByUrl'),
        url: '/mock'
    };
    const bsModalServiceStub = jasmine.createSpyObj('BsModalService', ['show', 'hide', 'getModalsCount']);
    bsModalServiceStub.show.and.returnValue({ content: {}, hide: jasmine.createSpy('hide') });
    bsModalServiceStub.getModalsCount.and.returnValue(0);
    const snapshotServiceStub = jasmine.createSpyObj('SnapshotGenericService', ['load', 'save', 'clear']);
    snapshotServiceStub.load.and.returnValue(null);
    const tipoCompraServiceStub = jasmine.createSpyObj('TipoCompraService', ['obtenerTiposCompraSinPaginado']);
    tipoCompraServiceStub.obtenerTiposCompraSinPaginado.and.returnValue(of([]));
    const usuarioRolesServiceStub = jasmine.createSpyObj('UsuarioRolesService', [
        'obtenerTodos',
        'exportarUsuariosRol',
        'agregarRolUC',
        'agregarRolTodasUc',
        'eliminarRol',
        'modificarRol',
        'agregarRolTipoCompra'
    ]);
    usuarioRolesServiceStub.obtenerTodos.and.returnValue(of({ content: [], totalElements: 0 }));
    usuarioRolesServiceStub.agregarRolUC.and.returnValue(of({}));
    usuarioRolesServiceStub.agregarRolTodasUc.and.returnValue(of({}));
    usuarioRolesServiceStub.eliminarRol.and.returnValue(of({}));
    usuarioRolesServiceStub.modificarRol.and.returnValue(of({}));
    usuarioRolesServiceStub.agregarRolTipoCompra.and.returnValue(of({}));
    const seguridadServiceStub = jasmine.createSpyObj('SeguridadService', ['tienePermiso', 'tieneAlgunPermiso']);
    seguridadServiceStub.tienePermiso.and.returnValue(true);
    seguridadServiceStub.tieneAlgunPermiso.and.returnValue(true);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConsultaUsuariosRolesComponent, MockInputDocumentoComponent, MockFiltroOrganismoComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: Router, useValue: routerStub },
                { provide: BsModalService, useValue: bsModalServiceStub },
                { provide: SnapshotGenericService, useValue: snapshotServiceStub },
                { provide: TipoCompraService, useValue: tipoCompraServiceStub },
                { provide: UsuarioRolesService, useValue: usuarioRolesServiceStub },
                { provide: SeguridadService, useValue: seguridadServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ConsultaUsuariosRolesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
