import { Component, CUSTOM_ELEMENTS_SCHEMA, forwardRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { CompraSiceService } from 'src/app/shared/services/compra-sice.service';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioRolesService } from 'src/app/shared/services/usuario/usuario-roles.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { ConsultaUsuariosRolesCompraComponent } from './consulta-usuarios-roles-compra.component';

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

describe('ConsultaUsuariosRolesCompraComponent', () => {
    let component: ConsultaUsuariosRolesCompraComponent;
    let fixture: ComponentFixture<ConsultaUsuariosRolesCompraComponent>;

    const activatedRouteStub = {
        paramMap: of({ has: () => false, get: () => null }),
        snapshot: {
            queryParamMap: { get: (_key: string) => null },
            params: {},
            paramMap: { get: (_key: string) => null }
        }
    };
    const routerStub = {
        navigate: jasmine.createSpy('navigate')
    };
    const locationStub = {
        path: jasmine.createSpy('path').and.returnValue(''),
        replaceState: jasmine.createSpy('replaceState')
    };
    const bsModalServiceStub = jasmine.createSpyObj('BsModalService', ['show', 'hide', 'getModalsCount']);
    bsModalServiceStub.show.and.returnValue({ content: {}, hide: jasmine.createSpy('hide') });
    bsModalServiceStub.getModalsCount.and.returnValue(0);
    const snapshotServiceStub = jasmine.createSpyObj('SnapshotGenericService', ['load', 'save', 'clear']);
    snapshotServiceStub.load.and.returnValue(null);
    const compraSiceServiceStub = jasmine.createSpyObj('CompraSiceService', ['obtenerCompras']);
    compraSiceServiceStub.obtenerCompras.and.returnValue(of({ content: [], page: { totalElements: 0 } }));
    const tipoCompraServiceStub = jasmine.createSpyObj('TipoCompraService', ['obtenerTiposCompraSinPaginado']);
    tipoCompraServiceStub.obtenerTiposCompraSinPaginado.and.returnValue(of([]));
    const usuarioServiceStub = jasmine.createSpyObj('UsuarioService', ['obtenerUsuarioPorId']);
    usuarioServiceStub.obtenerUsuarioPorId.and.returnValue(of({}));
    const usuarioRolesServiceStub = jasmine.createSpyObj('UsuarioRolesService', ['agregarRolPorCompra']);
    usuarioRolesServiceStub.agregarRolPorCompra.and.returnValue(of({}));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConsultaUsuariosRolesCompraComponent, MockFiltroOrganismoComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: Router, useValue: routerStub },
                { provide: Location, useValue: locationStub },
                { provide: BsModalService, useValue: bsModalServiceStub },
                { provide: SnapshotGenericService, useValue: snapshotServiceStub },
                { provide: CompraSiceService, useValue: compraSiceServiceStub },
                { provide: TipoCompraService, useValue: tipoCompraServiceStub },
                { provide: UsuarioService, useValue: usuarioServiceStub },
                { provide: UsuarioRolesService, useValue: usuarioRolesServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ConsultaUsuariosRolesCompraComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
