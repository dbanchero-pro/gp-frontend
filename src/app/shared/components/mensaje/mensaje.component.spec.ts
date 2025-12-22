import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { of, Subject } from "rxjs";

import { AlertModule } from "ngx-bootstrap/alert";
import { MensajeComponent } from "./mensaje.component";

describe('MensajeComponent', () => {
    let component: MensajeComponent;
    let fixture: ComponentFixture<MensajeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // componentes
            declarations: [MensajeComponent],
            // modulos
            imports: [AlertModule],
            // servicios
            providers: [
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
                {
                    provide: Router,
                    useValue: {
                        url: "/test",
                        events: of(new NavigationEnd(0, "/test", "/test")),
                        navigate: jasmine.createSpy("navigate")
                    }
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MensajeComponent);
        component = fixture.componentInstance;
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });


    it("ngOnInit() debería setear El showMsg en false si ocurre un eventos del tipo NavigationEnd y si showMsg era true ", () => {
        component.showMsg = true;
        fixture.detectChanges();

        expect(component.showMsg).toBeFalse();
    });

    it("onClose() debería setear El showMsg en false", () => {
        component.showMsg = true;

        component.onClose();

        expect(component.showMsg).toBeFalse();
    });
});


class ActivatedRouteStub {
    private readonly subject = new Subject();

    push(value: any): void {
        this.subject.next(value);
    }

    get data(): any {
        return this.subject.asObservable();
    }
}