import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PaginaBusquedaComponent } from './pagina-busqueda.component';

class ModalServiceStub {
    show = jasmine.createSpy('show').and.callFake(() => {
        const ref = new BsModalRef();
        ref.content = {};
        return ref;
    });
}

@Component({ selector: 'app-dummy', template: '' })
class DummyBusquedaComponent extends PaginaBusquedaComponent<any> {
    override form = new FormGroup({
        campo: new FormControl('valor', Validators.required),
    });
    override get columnaOrdenInicial() {
        return 'campo';
    }
    override get ordenInicial(): 'asc' | 'desc' {
        return 'desc';
    }
    override get listaOrden() {
        return [];
    }
    override buscar = jasmine.createSpy('buscar');
    override nuevaConsulta() {
        // Implementación de nuevaConsulta
    }
    override descargarExcel() {
        // Implementación de descargarExcel
    }
}

describe('PaginaBusquedaComponent', () => {
    let component: DummyBusquedaComponent;
    let fixture: ComponentFixture<DummyBusquedaComponent>;
    let modalService: ModalServiceStub;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [ReactiveFormsModule, DummyBusquedaComponent],
            providers: [
                { provide: BsModalService, useClass: ModalServiceStub },
            ],
        });
        fixture = TestBed.createComponent(DummyBusquedaComponent);
        component = fixture.componentInstance;
        modalService = TestBed.inject(BsModalService) as any;
        fixture.detectChanges();
    });

    it('debería inicializar orden y sort en ngOnInit', () => {
        component.ngOnInit();
        expect(component.parametros.sort).toBe('campo');
        expect(component.parametros.order).toBe('desc');
    });

    it('cambioPagina debería actualizar pagina y llamar buscar', () => {
        component.cambioPagina(2);
        expect(component.parametros.pagina).toBe(2);
        expect(component.buscar).toHaveBeenCalled();
    });

    it('cambioPorPagina actualiza tamaño y reinicia página', () => {
        component.cambioPorPagina(20);
        expect(component.parametros.tamanoPagina).toBe(20);
        expect(component.parametros.pagina).toBe(0);
        expect(component.buscar).toHaveBeenCalled();
    });

    it('cambioOrden debe asignar el valor y buscar', () => {
        component.cambioOrden('asc');
        expect(component.parametros.order).toBe('asc');
        expect(component.buscar).toHaveBeenCalled();
    });

    it('cambioColumnaOrden asigna la columna y busca', () => {
        component.cambioColumnaOrden('otra');
        expect(component.parametros.sort).toBe('otra');
        expect(component.buscar).toHaveBeenCalled();
    });

    it('filtrando marca el formulario y busca si es válido', () => {
        spyOn(component.form, 'markAllAsTouched');
        component.filtrando();
        expect(component.form.markAllAsTouched).toHaveBeenCalled();
        expect(component.buscar).toHaveBeenCalled();
    });

    it('aplicarColapso alterna tamaños', () => {
        expect(component.colFiltro).toBe('col-lg-3');
        component.aplicarColapso();
        expect(component.colFiltro).toBe('col-lg-1');
        expect(component.colTabla).toBe('col-lg-11');
        component.aplicarColapso();
        expect(component.colFiltro).toBe('col-lg-3');
        expect(component.colTabla).toBe('col-lg-9');
    });

    it('campoVacio devuelve true solo si control es inválido y tocado', () => {
        const control = component.form.get('campo') as FormControl;
        control.markAsTouched();
        control.setValue('');
        expect(component.campoVacio('campo')).toBeTrue();
        expect(component.campoVacio('otro')).toBeFalse();
    });

    it('campoError chequea estado del control', () => {
        const control = component.form.get('campo') as FormControl;
        control.markAsTouched();
        control.setValue('');
        expect(component.campoError('campo')).toBeTrue();
    });

    it('abrirPopup utiliza modalService y retorna el contenido', () => {
        const contenido = {};
        const result = component.abrirPopup(contenido, 'Enviar');
        expect(modalService.show).toHaveBeenCalled();
        expect(result).toEqual({});
        expect(component.cerrarPopup).toBeDefined();
    });
});
