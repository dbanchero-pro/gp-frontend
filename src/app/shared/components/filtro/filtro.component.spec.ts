import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { FiltroComponent } from './filtro.component';

describe('FilterComponent', () => {
    let component: FiltroComponent;
    let fixture: ComponentFixture<FiltroComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            // componentes
            declarations: [FiltroComponent],
            // modulos
            imports: [],
            // servicios
            providers: [
                provideHttpClientTesting(),
                provideRouter([]),],
            teardown: { destroyAfterEach: false },
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FiltroComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debe crearse', () => {
        expect(component).toBeTruthy();
    });

    it('filter() debe emitir el evento evFilter', () => {
        spyOn(component.evFilter, 'emit');

        component.filter();

        expect(component.evFilter.emit).toHaveBeenCalled();
    });

    it('toggleCollapse() debería emitir un evento evCollapse', () => {
        spyOn(component.evCollapse, 'emit');
        component.toggleCollapse();
        expect(component.evCollapse.emit).toHaveBeenCalled();
    });

    it('toggleCollapse() debería devolver true luego de inicializado el componente', () => {
        expect(component.toggleCollapse()).toBeTrue();
    });
});
