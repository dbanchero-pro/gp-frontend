import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { CompraSiceService } from 'src/app/shared/services/compra-sice.service';
import { UsuarioRolesService } from 'src/app/shared/services/usuario/usuario-roles.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { ConsultaUsuariosRolesItemsComponent } from './consulta-usuarios-roles-items.component';

describe('ConsultaUsuariosRolesItemsComponent', () => {
    let component: ConsultaUsuariosRolesItemsComponent;
    let fixture: ComponentFixture<ConsultaUsuariosRolesItemsComponent>;

    const activatedRouteStub = {
        paramMap: of({ get: () => null }),
    };
    const routerStub = {
        navigate: jasmine.createSpy('navigate'),
    };
    const bsModalServiceStub = jasmine.createSpyObj('BsModalService', [
        'show',
        'hide',
        'getModalsCount',
    ]);
    bsModalServiceStub.show.and.returnValue({
        content: {},
        hide: jasmine.createSpy('hide'),
    });
    bsModalServiceStub.getModalsCount.and.returnValue(0);
    const usuarioServiceStub = jasmine.createSpyObj('UsuarioService', [
        'obtenerUsuarioPorId',
    ]);
    usuarioServiceStub.obtenerUsuarioPorId.and.returnValue(of({}));
    const compraSiceServiceStub = jasmine.createSpyObj('CompraSiceService', [
        'obtenerListaItemsCompra',
        'obtenerCompraPorId',
    ]);
    compraSiceServiceStub.obtenerListaItemsCompra.and.returnValue(of([]));
    compraSiceServiceStub.obtenerCompraPorId.and.returnValue(of({}));
    const usuarioRolesServiceStub = jasmine.createSpyObj(
        'UsuarioRolesService',
        ['agregarRolPorItem'],
    );
    usuarioRolesServiceStub.agregarRolPorItem.and.returnValue(of({}));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule, ConsultaUsuariosRolesItemsComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: Router, useValue: routerStub },
                { provide: BsModalService, useValue: bsModalServiceStub },
                { provide: UsuarioService, useValue: usuarioServiceStub },
                { provide: CompraSiceService, useValue: compraSiceServiceStub },
                {
                    provide: UsuarioRolesService,
                    useValue: usuarioRolesServiceStub,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ConsultaUsuariosRolesItemsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
