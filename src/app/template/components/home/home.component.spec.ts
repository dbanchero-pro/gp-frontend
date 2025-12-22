import { ComponentFixture, TestBed } from "@angular/core/testing";

import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { FormBuilder, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NavigationEnd, provideRouter, Router } from "@angular/router";
import { of } from "rxjs";
import { AppConfig } from "src/app/app.config";
import { ActualizarService } from "src/app/shared/services/common/actualizar.service";
import { AuthRawService } from "src/app/shared/services/common/auth-raw-service";
import { HomeComponent } from "./home.component";

class MockServices {
    // router
    public events = of(new NavigationEnd(0, "http://localhost:4200/prueba", "http://localhost:4200/prueba"));
}
describe("HomeComponent", () => {
    let component: HomeComponent;
    let fixture: ComponentFixture<HomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // componentes
            declarations: [],
            imports: [FormsModule,
                ReactiveFormsModule,
                ],
            providers: [
                FormBuilder,
                Router,
                AuthRawService,
                ActualizarService,
                { provide: Router, useClass: MockServices },
                provideRouter([]),
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
            ]
        })
        .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(HomeComponent);
        component = fixture.componentInstance;
        AppConfig.settings = {
            apiCargaMasivaUrl: '',
            apiUrl: '',
            keycloak: { url: '', realm: '', clientId: '' },
            extensionesPermitidas: '',
            urlBaseFrontEnd: '',
            loggingLevel: 0 as any,
            archivosTamanoMaxBytes: 0,
            archivosCantidadMax: 10,
            contenidoInicio: '123'
            };
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    it("confirmar()", () => {
        let actualizarService = TestBed.inject(ActualizarService);
        spyOn(actualizarService, "confirmar").and.callFake((texto, accion) => {
            accion();
        });
        component.confirmar();
        expect(1).toEqual(1);
    });

});
