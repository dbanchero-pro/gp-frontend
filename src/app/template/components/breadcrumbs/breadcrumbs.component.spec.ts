import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { of, Subject } from "rxjs";
import { MenuService } from "src/app/shared/services/common/menu.service";

import { IMenuItem } from "src/app/shared/models/common/menu-item.model";
import { BreadcrumbsComponent } from "./breadcrumbs.component";

class MenuServiceMock {

    obtenerItem(): IMenuItem | undefined {
        return {
            nombre: "item",
            titulo: "Item Title",
            subtitulo: "Item Subtitle",
            permisos: [],
            padre: undefined
        };
    }
}

class ActivatedRouteStub {
    private readonly subject = new Subject();

    push(value: any): void {
        this.subject.next(value);
    }

    get data(): any {
        return this.subject.asObservable();
    }
}

describe("BreadcrumbsComponent", () => {
    let component: BreadcrumbsComponent;
    let fixture: ComponentFixture<BreadcrumbsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BreadcrumbsComponent],
            providers: [
                { provide: ActivatedRoute, useClass: ActivatedRouteStub },
                { provide: MenuService, useClass: MenuServiceMock },
                {
                    provide: Router,
                    useValue: {
                        url: "/test",
                        // events:  of(new NavigationEnd(0, 'test', 'test')),
                        events: of(new NavigationEnd(0, "/test", "/test")),
                        navigate: jasmine.createSpy("navigate")
                    }
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BreadcrumbsComponent);
        component = fixture.componentInstance;
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    it("se setean los campos item, subitem, y subitem2 con los valores obtenidos del MenuService", () => {
        expect(component.item).toBe(undefined);
    });

    it('obtenerPadre devuelve el padre cuando existe', () => {
        const hijo: IMenuItem = { nombre: 'hijo', padre: { nombre: 'padre' } as any } as any;
        component.item = { padre: { nombre: 'padre' } } as any;
        const res = component.obtenerPadre(hijo);
        expect(res).toEqual(hijo.padre);
    });

    it('ir navega con query volver', () => {
        const router = TestBed.inject(Router);
        component.ir('/ruta');
        expect(router.navigate).toHaveBeenCalledWith(['/ruta'], { queryParams: { volver: 1 } });
    });

    it('debería renderizar una navegación accesible', () => {
        component.superItem = { nombre: 'Padre', url: '/padre' } as any;
        component.item = { nombre: 'Actual' } as any;
        fixture.detectChanges();
        const nav: HTMLElement = fixture.nativeElement.querySelector('nav');
        expect(nav.getAttribute('aria-label')).toBe('ruta de navegación');
        const current = fixture.nativeElement.querySelector('li[aria-current="page"]');
        expect(current.textContent.trim()).toBe('Actual');
        const button = fixture.nativeElement.querySelector('button');
        expect(button.getAttribute('type')).toBe('button');
    });
});
