import {
    provideHttpClient,
    withInterceptorsFromDi,
} from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NavigationEnd, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { UtilService } from 'src/app/shared/services/common/util.service';
import { AuthRawService } from '../../services/common/auth-raw-service';
import { Pagina403Component } from './pagina403.component';

class MockServices {
    // router
    public events = of(
        new NavigationEnd(
            0,
            'http://localhost:4200/prueba',
            'http://localhost:4200/prueba',
        ),
    );
}

describe('Pagina403Component', () => {
    let component: Pagina403Component;
    let fixture: ComponentFixture<Pagina403Component>;
    let seguridadServiceSpy: jasmine.SpyObj<SeguridadService>;
    let utilServiceSpy: jasmine.SpyObj<UtilService>;
    let actualizarServiceSpy: jasmine.SpyObj<ActualizarService>;

    beforeEach(async () => {
        const seguridadSpy = jasmine.createSpyObj('SeguridadService', [
            'cerrarSesion',
        ]);
        const actualizarSpy = jasmine.createSpyObj('ActualizarService', [
            'notificaciones',
            'subTitulo',
        ]);

        await TestBed.configureTestingModule({
            declarations: [],
            imports: [FormsModule, ReactiveFormsModule],
            providers: [
                FormBuilder,
                Router,
                AuthRawService,
                provideRouter([]),
                { provide: Router, useClass: MockServices },
                { provide: SeguridadService, useValue: seguridadSpy },
                { provide: ActualizarService, useValue: actualizarSpy },
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ],
        }).compileComponents();

        TestBed.inject(SeguridadService) as jasmine.SpyObj<SeguridadService>;
        TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
        TestBed.inject(ActualizarService) as jasmine.SpyObj<ActualizarService>;
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(Pagina403Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
