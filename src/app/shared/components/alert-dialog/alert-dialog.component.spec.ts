import { EventEmitter, Injectable, NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { BehaviorSubject } from "rxjs";

import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { AlertModule } from "ngx-bootstrap/alert";
import { ActualizarService } from "../../services/common/actualizar.service";
import { AlertDialogComponent } from "./alert-dialog.component";

@Injectable()
class StubbedModalService {
    onShown = new EventEmitter<void>();
    show(): BsModalRef<any> {
        return new BsModalRef<any>();
    }
}

@Injectable()
class StubbedActualizarService {
    alerta$ = new BehaviorSubject<[string] | [string, string] | [string, string, string] | []>([]);
}

describe("AlertDialogComponent", () => {
    let component: AlertDialogComponent;
    let fixture: ComponentFixture<AlertDialogComponent>;
    let modalService: StubbedModalService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [
              AlertModule,
              AlertDialogComponent,
            ],
            providers: [
                { provide: BsModalService, useClass: StubbedModalService },
                { provide: ActualizarService, useClass: StubbedActualizarService },
                provideRouter([]),
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
            schemas: [NO_ERRORS_SCHEMA]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AlertDialogComponent);
        component = fixture.componentInstance;
        modalService = fixture.debugElement.injector.get(BsModalService) as any;
        spyOn(modalService, "show").and.callThrough();
        spyOn(document, "querySelector").and.returnValue({ focus: () => { } } as any);
        fixture.detectChanges();
    });

    it('debería reaccionar a alertas simples', () => {
        const svc = TestBed.inject(ActualizarService) as StubbedActualizarService;
        svc.alerta$.next(["hola"]);
        expect(component.titulo).toBe("Alerta");
        expect(component.mensajeInicial).toBe("hola");
        expect(modalService.show).toHaveBeenCalled();
    });

    it('debería manejar alertas con título', () => {
        const svc = TestBed.inject(ActualizarService) as StubbedActualizarService;
        svc.alerta$.next(["T", "M"]);
        expect(component.titulo).toBe("T");
        expect(component.mensajeInicial).toBe("M");
        expect(modalService.show).toHaveBeenCalled();
    });

    it('debería manejar alertas con texto adicional', () => {
        const svc = TestBed.inject(ActualizarService) as StubbedActualizarService;
        svc.alerta$.next(["T", "M", "X"]);
        expect(component.titulo).toBe("T");
        expect(component.mensajeInicial).toBe("M");
        expect(component.textoAdicional).toBe("X");
        expect(component.mostrarTextoAdicional).toBeTrue();
    });
});
