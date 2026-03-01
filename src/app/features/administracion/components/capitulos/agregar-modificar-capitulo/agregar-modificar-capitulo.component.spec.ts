import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of } from 'rxjs';

import { AgregarModificarCapituloComponent } from './agregar-modificar-capitulo.component';
import { CapituloService } from '../../../services/capitulo.service';

describe('AgregarModificarCapituloComponent', () => {
    let component: AgregarModificarCapituloComponent;
    let fixture: ComponentFixture<AgregarModificarCapituloComponent>;

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
    const capituloServiceStub = jasmine.createSpyObj('CapituloService', [
        'obtenerCapituloPorId',
        'crearCapitulo',
        'actualizarCapitulo',
        'aprobarCapitulo',
    ]);
    capituloServiceStub.obtenerCapituloPorId.and.returnValue(of(undefined));
    capituloServiceStub.crearCapitulo.and.returnValue(of({}));
    capituloServiceStub.actualizarCapitulo.and.returnValue(of({}));
    capituloServiceStub.aprobarCapitulo.and.returnValue(of({}));

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule, AgregarModificarCapituloComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: Router, useValue: routerStub },
                { provide: BsModalService, useValue: bsModalServiceStub },
                { provide: CapituloService, useValue: capituloServiceStub },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AgregarModificarCapituloComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
