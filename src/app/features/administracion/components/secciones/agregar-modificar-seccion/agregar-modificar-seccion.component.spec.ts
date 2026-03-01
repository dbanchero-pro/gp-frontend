import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';
import { AgregarModificarSeccionComponent } from './agregar-modificar-seccion.component';
import { SeccionService } from '../../../services/seccion.service';

describe('AgregarModificarSeccionComponent', () => {
    let component: AgregarModificarSeccionComponent;
    let fixture: ComponentFixture<AgregarModificarSeccionComponent>;

    const activatedRouteStub = {
        params: of({}),
        snapshot: {
            params: {},
            paramMap: { get: (_key: string) => null },
            queryParamMap: { get: (_key: string) => null },
        },
    };
    const routerStub = {
        navigate: jasmine.createSpy('navigate'),
        getCurrentNavigation: () => null,
    };
    const bsModalServiceStub = {
        show: jasmine
            .createSpy('show')
            .and.returnValue({ content: {}, hide: jasmine.createSpy('hide') }),
    };
    const seccionServiceStub = jasmine.createSpyObj('SeccionService', [
        'obtenerSeccionPorId',
        'crearSeccion',
        'actualizarSeccion',
        'aprobarSeccion',
    ]);
    seccionServiceStub.obtenerSeccionPorId.and.returnValue(of(undefined));
    seccionServiceStub.crearSeccion.and.returnValue(of({}));
    seccionServiceStub.actualizarSeccion.and.returnValue(of({}));
    seccionServiceStub.aprobarSeccion.and.returnValue(of({}));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule, AgregarModificarSeccionComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: Router, useValue: routerStub },
                { provide: BsModalService, useValue: bsModalServiceStub },
                { provide: SeccionService, useValue: seccionServiceStub },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AgregarModificarSeccionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
