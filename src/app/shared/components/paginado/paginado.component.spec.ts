import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { PageFilterBase } from '../../models/common/page/page.model';
import { PaginadoComponent } from './paginado.component';

describe('PaginationComponent', () => {
    let component: PaginadoComponent;
    let fixture: ComponentFixture<PaginadoComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
              PaginationModule.forRoot(),
              ReactiveFormsModule,
              FormsModule,
              PaginadoComponent,
            ],
        });
        fixture = TestBed.createComponent(PaginadoComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    it('debería emitir el evento pageChange con el ítem correcto al llamar al método paginaCambiada', () => {
        // Configuración del item de prueba
        const item: PageFilterBase = {
            page: 1,
            itemsPorPagina: 5,
        };
        component.cambioItemPorPagina = false;
        // Espiar el evento pageChange
        spyOn(component.cambioPagina, 'emit');

        // Llamada al método pageChanged
        component.paginaCambiada(item);

        // Verificación de que el evento pageChange fue emitido con el ítem correcto
        expect(component.cambioPagina.emit).toHaveBeenCalledWith(0);
    });

    it('debería no emitir el evento pageChange y cambiar a falso el cambioItemPorPagina al llamar al método paginaCambiada', () => {
        // Configuración del item de prueba
        const item: PageFilterBase = {
            page: 1,
            itemsPorPagina: 5,
        };
        component.cambioItemPorPagina = true;
        // Espiar el evento pageChange
        spyOn(component.cambioPagina, 'emit');

        // Llamada al método pageChanged
        component.paginaCambiada(item);

        // Verificación de que el evento pageChange fue emitido con el ítem correcto
        expect(component.cambioItemPorPagina).toBeFalsy();
        expect(component.cambioPagina.emit).not.toHaveBeenCalled();
    });

    it('debería emitir el evento cambioItemsPorPagina con el ítem correcto al llamar al método cambioPorPagina', () => {
        component.itemsPorPagina = 5;
        component.cambioItemPorPagina = true;
        component.currentPage.setValue(3);
        // Espiar el evento cambioItemsPorPagina
        spyOn(component.cambioItemsPorPagina, 'emit');

        // Llamada al método pageChanged
        component.cambioPorPagina();

        // Verificación de que el evento cambioItemsPorPagina fue emitido con el ítem correcto
        expect(component.cambioItemPorPagina).toBeFalsy();
        expect(component.cambioItemsPorPagina.emit).toHaveBeenCalledWith(5);
        expect(component.currentPage.value).toEqual(1);
    });

    it('debería actualizar paginaActual cuando cambia paginaActual', () => {
        component.paginaActual = 5;
        component.ngOnChanges({
            paginaActual: new SimpleChange(1, 5, false),
        });

        expect(component.currentPage.value).toEqual(5);
    });
});
