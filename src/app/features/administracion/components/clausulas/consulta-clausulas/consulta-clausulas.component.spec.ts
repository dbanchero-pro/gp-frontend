import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { FechaPipe } from 'src/app/shared/pipes/fecha.pipe';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { ConsultaClausulasComponent } from './consulta-clausulas.component';
import { ClausulaService } from '../../../services/clausula.service';

describe('ConsultaClausulasComponent', () => {
    let component: ConsultaClausulasComponent;
    let fixture: ComponentFixture<ConsultaClausulasComponent>;

    const activatedRouteStub = {
        snapshot: {
            queryParamMap: { get: (_key: string) => null },
            params: {},
            paramMap: { get: (_key: string) => null },
        },
    };
    const routerStub = {
        navigate: jasmine.createSpy('navigate'),
    };
    const locationStub = {
        back: jasmine.createSpy('back'),
        path: jasmine.createSpy('path').and.returnValue(''),
        replaceState: jasmine.createSpy('replaceState'),
    };
    const snapshotServiceStub = {
        load: jasmine.createSpy('load').and.returnValue(null),
        save: jasmine.createSpy('save'),
        clear: jasmine.createSpy('clear'),
    };
    const clausulaServiceStub = jasmine.createSpyObj('ClausulaService', [
        'obtenerFiltrosClausula',
        'buscarClausulas',
        'eliminarClausula',
    ]);
    clausulaServiceStub.obtenerFiltrosClausula.and.returnValue(
        of({
            incisos: [],
            unidadesEjecutoras: [],
            tiposCompra: [],
            subtiposCompra: [],
            familias: [],
            subfamilias: [],
            clases: [],
            subclases: [],
            articulos: [],
        }),
    );
    clausulaServiceStub.buscarClausulas.and.returnValue(of([]));
    clausulaServiceStub.eliminarClausula.and.returnValue(
        of({ exitoso: true, mensaje: '' }),
    );

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule, ConsultaClausulasComponent],
            providers: [
                { provide: ActivatedRoute, useValue: activatedRouteStub },
                { provide: Router, useValue: routerStub },
                { provide: Location, useValue: locationStub },
                {
                    provide: SnapshotGenericService,
                    useValue: snapshotServiceStub,
                },
                { provide: ClausulaService, useValue: clausulaServiceStub },
                FechaPipe,
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ConsultaClausulasComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
