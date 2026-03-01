import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';

import { ActualizarService } from './shared/services/common/actualizar.service';
import { AuthRawService } from './shared/services/common/auth-raw-service';

import { AppComponent } from './app.component';

class MockActualizarService {
    cargando$ = new BehaviorSubject<boolean>(false);
    titulo$ = new BehaviorSubject<string[]>([]);
    subTitulo$ = new BehaviorSubject<string[]>([]);
    estado$ = new BehaviorSubject<string>('');
    alerta$ = new BehaviorSubject<any[]>([]);
    confirmar$ = new BehaviorSubject<any[]>([]);
}

class MockAuthRawService {
    isLoggedInValue = false;
    login = jasmine.createSpy('login');
    isLoggedIn() {
        return this.isLoggedInValue;
    }
}

describe('AppComponent', () => {
    beforeEach(async () => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [AppComponent],
            providers: [
                { provide: ActualizarService, useClass: MockActualizarService },
                { provide: AuthRawService, useClass: MockAuthRawService },
            ],
            schemas: [NO_ERRORS_SCHEMA],
            teardown: { destroyAfterEach: false },
        });
        TestBed.overrideComponent(AppComponent, {
            set: { imports: [], schemas: [NO_ERRORS_SCHEMA] },
        });
        await TestBed.compileComponents();
    });

    it('debe crear la aplicación', () => {
        const fixture: any = TestBed.createComponent(AppComponent);
        const app: any = fixture.componentInstance;
        expect(app).toBeTruthy();
    });

    it('debe tener como título gp-frontend', () => {
        const fixture: any = TestBed.createComponent(AppComponent);
        const app: any = fixture.componentInstance;
        expect(app.title).toEqual('gp-frontend');
    });

    it('debe llamar a login cuando el usuario no esta logueado', fakeAsync(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        const auth = TestBed.inject(
            AuthRawService,
        ) as unknown as MockAuthRawService;
        auth.isLoggedInValue = false;

        app.ngOnInit();
        tick();

        expect(auth.login).toHaveBeenCalled();
        expect(app.mostrarCargando).toBeTrue();
    }));

    it('debe ocultar el cargando si el usuario esta logueado', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        const auth = TestBed.inject(
            AuthRawService,
        ) as unknown as MockAuthRawService;
        auth.isLoggedInValue = true;

        app.ngOnInit();

        expect(auth.login).not.toHaveBeenCalled();
        expect(app.mostrarCargando).toBeFalse();
    });

    it('debe actualizar la propiedad cargado segun el observable', fakeAsync(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        const actualizar = TestBed.inject(
            ActualizarService,
        ) as unknown as MockActualizarService;
        actualizar.cargando$.next(true);
        tick(150);
        expect(app.cargado).toBeTrue();
    }));

    it('debe incluir un enlace para saltar al contenido principal', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const auth = TestBed.inject(
            AuthRawService,
        ) as unknown as MockAuthRawService;
        auth.isLoggedInValue = true;
        fixture.detectChanges();
        const compiled: HTMLElement = fixture.nativeElement as HTMLElement;
        const skipLink = compiled.querySelector(
            '.skip-link',
        ) as HTMLAnchorElement | null;
        const main = compiled.querySelector('#contenido') as HTMLElement | null;
        expect(skipLink).not.toBeNull();
        expect(skipLink?.getAttribute('href')).toBe('#contenido');
        expect(main).not.toBeNull();
        expect(main?.getAttribute('tabindex')).toBe('-1');
    });
});
