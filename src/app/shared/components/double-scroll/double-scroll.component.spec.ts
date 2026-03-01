import { Renderer2, ChangeDetectorRef } from '@angular/core';
import { DoubleScrollComponent } from './double-scroll.component';

class MockRenderer2 implements Partial<Renderer2> {
    setStyle = jasmine.createSpy('setStyle');
}

class MockCd implements Partial<ChangeDetectorRef> {
    detach() {}
}

describe('DoubleScrollComponent', () => {
    let component: DoubleScrollComponent;
    let renderer: MockRenderer2;

    beforeEach(() => {
        renderer = new MockRenderer2();
        component = new DoubleScrollComponent(
            renderer as any,
            new MockCd() as any,
        );
    });

    it('debe crear el componente', () => {
        expect(component).toBeTruthy();
    });

    it('debe ajustar el ancho sin scroll', () => {
        component.div1 = { nativeElement: {} } as any;
        component.div2 = {
            nativeElement: { clientWidth: 100, scrollWidth: 100 },
        } as any;
        component.onDivSizeChanged();
        expect(renderer.setStyle).toHaveBeenCalledWith(
            component.div1.nativeElement,
            'width',
            '100px',
        );
    });

    it('debe reducir el ancho cuando hay scroll', () => {
        component.div1 = { nativeElement: {} } as any;
        component.div2 = {
            nativeElement: { clientWidth: 100, scrollWidth: 150 },
        } as any;
        component.onDivSizeChanged();
        expect(renderer.setStyle).toHaveBeenCalledWith(
            component.div1.nativeElement,
            'width',
            '90px',
        );
    });
    it('configura eventos de scroll en ngAfterViewInit', () => {
        (window as any).ResizeObserver = class {
            constructor(private cb: any) {}
            observe() {
                this.cb([{}]);
            }
        };
        component.wrapper1 = {
            nativeElement: { scroll: jasmine.createSpy('s1') },
        } as any;
        component.wrapper2 = {
            nativeElement: { scroll: jasmine.createSpy('s2') },
        } as any;
        component.div1 = { nativeElement: {} } as any;
        component.div2 = {
            nativeElement: { clientWidth: 50, scrollWidth: 50 },
        } as any;
        component.ngAfterViewInit();
        expect(typeof component.wrapper1.nativeElement.onscroll).toBe(
            'function',
        );
        expect(typeof component.wrapper2.nativeElement.onscroll).toBe(
            'function',
        );
        component.wrapper1.nativeElement.onscroll({
            target: { scrollLeft: 5 },
        });
        expect(component.wrapper2.nativeElement.scroll).toHaveBeenCalledWith(
            5,
            0,
        );
        component.wrapper2.nativeElement.onscroll({
            target: { scrollLeft: 3 },
        });
        expect(component.wrapper1.nativeElement.scroll).toHaveBeenCalledWith(
            3,
            0,
        );
    });
});
