import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { BandejaEntradaService } from '../../services/bandeja-entrada.service';
import { AsignarUsuariosComponent } from './asignar-usuarios.component';

describe('AsignarUsuariosComponent', () => {
    let component: AsignarUsuariosComponent;
    let fixture: ComponentFixture<AsignarUsuariosComponent>;

    const activatedRouteStub = {
        snapshot: {
            params: { id: '1' },
            paramMap: { get: (_key: string) => null },
            queryParamMap: { get: (_key: string) => null },
        },
    };
    const routerStub = {
        navigate: jasmine.createSpy('navigate'),
    };
    const bsModalServiceStub = {
        show: jasmine
            .createSpy('show')
            .and.returnValue({ content: {}, hide: jasmine.createSpy('hide') }),
    };
    const bandejaEntradaServiceStub = jasmine.createSpyObj(
        'BandejaEntradaService',
        [
            'obtenerProceso',
            'obtenerUsuariosAsignadosPorPliego',
            'asignarUsuariosYFinalizar',
        ],
    );
    bandejaEntradaServiceStub.obtenerProceso.and.returnValue(
        of({ id: 1, usuariosAsignados: [] }),
    );
    bandejaEntradaServiceStub.obtenerUsuariosAsignadosPorPliego.and.returnValue(
        of([]),
    );
    bandejaEntradaServiceStub.asignarUsuariosYFinalizar.and.returnValue(of({}));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule, AsignarUsuariosComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: Router, useValue: routerStub },
                { provide: BsModalService, useValue: bsModalServiceStub },
                {
                    provide: BandejaEntradaService,
                    useValue: bandejaEntradaServiceStub,
                },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(AsignarUsuariosComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
