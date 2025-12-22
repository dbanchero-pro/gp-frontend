import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { of, Subject } from 'rxjs';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregableDTO } from '../../../models/entregable.model';
import { IItemOrdenCompraDTO } from '../../../models/item-orden-compra.model';
import { IOrdenCompraDTO } from '../../../models/orden-ompra.model';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { RecepcionConformidadBaseComponent } from './recepcion-conformidad-base.component';

class BsModalServiceStub {
    show = jasmine.createSpy('show').and.returnValue({ content: {}, hide: jasmine.createSpy('hide') });
}

class ActualizarServiceStub {
    popups: any[] = [];
    capturarErrores = true;
    mensajeError = jasmine.createSpy('mensajeError');
    mensajeOcultar = jasmine.createSpy('mensajeOcultar');
}

class DocumentosUtilServiceStub {
    descargarDocumento = jasmine.createSpy('descargarDocumento');
    eliminarDocumento = jasmine.createSpy('eliminarDocumento').and.callFake((lista: ArchivoDTO[], documento: ArchivoDTO) => lista.filter(d => d !== documento));
    obtenerDocumentosAMostrar = jasmine.createSpy('obtenerDocumentosAMostrar').and.callFake((lista: ArchivoDTO[]) => lista.filter(d => d.eliminado !== true));
    getDocumentDate = jasmine.createSpy('getDocumentDate').and.returnValue(new Date('2024-01-01'));
}

class ItemOrdenCompraServiceStub {
    obtenerItemOrdenCompra = jasmine.createSpy('obtenerItemOrdenCompra').and.returnValue(of({ idItem: 2, idVariacion: 3 } as IItemOrdenCompraDTO));
}

class EntregableServiceStub {
    obtenerEntregable = jasmine.createSpy('obtenerEntregable').and.returnValue(of({ idEntregable: 9 } as IEntregableDTO));
}

@Component({
    standalone: false,
    template: `<div #modalRoot><button id="btn">ok</button></div>`
})
class RecepcionConformidadPruebaComponent extends RecepcionConformidadBaseComponent {
    cantidadTotalPrueba = 10;
    constructor(
        documentosUtilService: DocumentosUtilService,
        itemOrdenCompraService: ItemOrdenCompraService,
        entregableService: EntregableService
    ) {
        super(documentosUtilService, itemOrdenCompraService, entregableService);
    }
    protected obtenerCantidadTotal(): number {
        return this.cantidadTotalPrueba;
    }
    override agregarDocumento(): void {
        const subject = new Subject<ArchivoDTO>();
        const modalRef = { documentoAgregado: subject.asObservable() } as any;
        modalRef.documentoAgregado.subscribe((documento: ArchivoDTO) => this.documentos.push(documento));
        subject.next({ id: -1, nombre: 'nuevo.pdf' });
        subject.complete();
    }
}

describe('RecepcionConformidadBaseComponent', () => {
    let component: RecepcionConformidadPruebaComponent;
    let fixture: ComponentFixture<RecepcionConformidadPruebaComponent>;
    let documentosUtil: DocumentosUtilServiceStub;
    let itemService: ItemOrdenCompraServiceStub;
    let entregableService: EntregableServiceStub;

    beforeEach(async () => {
        documentosUtil = new DocumentosUtilServiceStub();
        itemService = new ItemOrdenCompraServiceStub();
        entregableService = new EntregableServiceStub();

        await TestBed.configureTestingModule({
            declarations: [RecepcionConformidadPruebaComponent],
            imports: [ReactiveFormsModule],
            providers: [
                { provide: BsModalService, useClass: BsModalServiceStub },
                { provide: ActualizarService, useClass: ActualizarServiceStub },
                { provide: DocumentosUtilService, useValue: documentosUtil },
                { provide: ItemOrdenCompraService, useValue: itemService },
                { provide: EntregableService, useValue: entregableService },
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(RecepcionConformidadPruebaComponent);
        component = fixture.componentInstance;
        component.form = new FormGroup({
            cantidadAceptada: new FormControl(0),
            cantidadRechazada: new FormControl(0),
            cantidadPendiente: new FormControl(0),
            motivo: new FormControl('')
        });
    });

    it('calcula fecha mínima de recepción con fecha de entrega y con fecha de OC', () => {
        component.ordenCompra = { fechaOC: new Date('2024-01-10'), nroOC: '1' } as IOrdenCompraDTO;
        component.entrega = { fechaEntrega: '2024-02-01' } as any;
        expect(component.fechaMinimaRecepcion).toBe('2024-02-01');

        component.entrega = { fechaEntrega: undefined } as any;
        expect(component.fechaMinimaRecepcion).toBe('2024-01-10');

        component.ordenCompra = null;
        component.entrega = null;
        expect(component.fechaMinimaRecepcion).toBe('');
    });

    it('calcula fecha mínima y máxima de conformidad', () => {
        component.entrega = { fechaRecepcion: '2023-12-31' } as any;
        expect(component.fechaMinimaConformidad).toBe('2023-12-31');
        component.entrega = null;
        expect(component.fechaMinimaConformidad).toBe('');
        expect(component.fechaMaxima).not.toBe('');
    });

    it('elige el tipo de unidad según entrega, entregable o ítem', () => {
        component.entrega = { tipoUnidad: TipoUnidad.PORCENTAJE } as any;
        expect(component.tipoUnidadRecepcion).toBe(TipoUnidad.PORCENTAJE);
        component.entrega = null;
        component.entregable = { tipoUnidadEntregas: TipoUnidad.CANTIDAD } as any;
        expect(component.tipoUnidadRecepcion).toBe(TipoUnidad.CANTIDAD);
        component.entregable = null;
        component.itemOrdenCompra = { tipoUnidad: TipoUnidad.PORCENTAJE } as any;
        expect(component.tipoUnidadRecepcion).toBe(TipoUnidad.PORCENTAJE);
        component.itemOrdenCompra = null;
        expect(component.tipoUnidadRecepcion).toBeNull();
    });

    it('validarFormatoDecimal verifica formato, entero y rango', () => {
        const validator = (component as any).validarFormatoDecimal(true);
        expect(validator(new FormControl(''))).toBeNull();
        expect(validator(new FormControl('abc'))).toEqual({ formatoDecimalInvalido: true } as any);
        expect(validator(new FormControl('10.5'))).toEqual({ porcentajeEntero: true } as any);
        expect(validator(new FormControl(150))).toEqual({ porcentajeFueraDeRango: true } as any);
        expect(validator(new FormControl(80))).toBeNull();

        const validatorCantidad = (component as any).validarFormatoDecimal(false);
        expect(validatorCantidad(new FormControl('5,5'))).toBeNull();
    });

    it('motivoRequeridoSiRechazo solo exige texto cuando hay rechazo', () => {
        const validator = (component as any).motivoRequeridoSiRechazo();
        const motivo = component.form.get('motivo');
        motivo?.setValidators(validator);
        motivo?.updateValueAndValidity();
        expect(motivo?.errors).toBeNull();
        component.form.get('cantidadRechazada')?.setValue(2);
        motivo?.updateValueAndValidity();
        expect(motivo?.errors).toEqual({ required: true } as any);
        motivo?.setValue('Motivo');
        motivo?.updateValueAndValidity();
        expect(motivo?.errors).toBeNull();
    });

    it('parseDecimal maneja nulos, números y cadenas con comas', () => {
        expect(component.parseDecimal(null)).toBeNaN();
        expect(component.parseDecimal(5.5)).toBe(5.5);
        expect(component.parseDecimal('10,25')).toBeCloseTo(10.25);
    });

    it('configurarRecalculoAutomatico recalcula pendiente y limita negativos', () => {
        component.cantidadTotalPrueba = 5;
        (component as any).configurarRecalculoAutomatico();
        component.form.get('cantidadAceptada')?.setValue(2);
        expect(component.form.get('cantidadPendiente')?.value).toBe(3);
        component.form.get('cantidadAceptada')?.setValue(10);
        expect(component.form.get('cantidadPendiente')?.value).toBe(5);
    });

    it('fechaRangoValidatorRecepcion y Conformidad validan mínimos y máximos', () => {
        component.ordenCompra = { fechaOC: '2024-03-10' } as any;
        component.entrega = { fechaEntrega: '2024-03-15', fechaRecepcion: '2024-03-20' } as any;
        const valRecepcion = (component as any).fechaRangoValidatorRecepcion();
        expect(valRecepcion(new FormControl('2024-03-10'))).toEqual({ min: { value: '2024-03-10' } } as any);
        expect(valRecepcion(new FormControl('2099-01-01'))).toEqual({ max: { value: '2099-01-01' } } as any);
        const hoy = component.fechaMaxima;
        expect(valRecepcion(new FormControl(hoy))).toBeNull();

        const valConformidad = (component as any).fechaRangoValidatorConformidad();
        expect(valConformidad(new FormControl('2024-03-01'))).toEqual({ min: { value: '2024-03-01' } } as any);
        expect(valConformidad(new FormControl('2099-01-01'))).toEqual({ max: { value: '2099-01-01' } } as any);
        expect(valConformidad(new FormControl('2024-03-20'))).toBeNull();
    });

    it('validarCantidadAceptada cubre exceso, suma excedida y casos válidos', () => {
        const validator = (component as any).validarCantidadAceptada();
        component.cantidadTotalPrueba = 6;
        component.entregable = { cantidad: 1, tipoUnidadEntregas: TipoUnidad.CANTIDAD } as any;
        let control = component.form.get('cantidadAceptada')!;
        control.setValue(2);
        expect(validator(control)).toEqual({ cantidadInvalidaEntregable: { actual: 2 } } as any);

        component.entregable = null;
        control.setValue(7);
        expect(validator(control)).toEqual({ excedeCantidadTotal: { actual: 7, maximo: 6 } } as any);

        component.form.get('cantidadRechazada')?.setValue(3);
        control.setValue(4);
        const sumaError = validator(control);
        expect(sumaError?.['sumaTotalExcedida']).toBeTruthy();

        component.form.get('cantidadRechazada')?.setValue(0);
        control.setValue(0);
        expect(validator(control)).toEqual({ ambosCero: true } as any);

        component.form.get('cantidadRechazada')?.setValue(2);
        control.setValue(3);
        expect(validator(control)).toBeNull();
    });

    it('validarCantidadRechazada cubre exceso, suma excedida y casos válidos', () => {
        const validator = (component as any).validarCantidadRechazada();
        component.cantidadTotalPrueba = 5;
        component.entregable = { cantidad: 1, tipoUnidadEntregas: TipoUnidad.CANTIDAD } as any;
        const control = component.form.get('cantidadRechazada')!;
        control.setValue(2);
        expect(validator(control)).toEqual({ cantidadInvalidaEntregable: { actual: 2 } } as any);

        component.entregable = null;
        control.setValue(10);
        expect(validator(control)).toEqual({ excedeCantidadTotal: { actual: 10, maximo: 5 } } as any);

        component.form.get('cantidadAceptada')?.setValue(3);
        control.setValue(3);
        expect(validator(control)?.['sumaTotalExcedida']).toBeTruthy();

        component.form.get('cantidadAceptada')?.setValue(0);
        control.setValue(0);
        expect(validator(control)).toEqual({ ambosCero: true } as any);

        component.form.get('cantidadAceptada')?.setValue(1);
        control.setValue(2);
        expect(validator(control)).toBeNull();
    });

    it('descargarDocumento, eliminarDocumento y obtenerDocumentosAMostrar delegan al servicio', () => {
        const doc: ArchivoDTO = { id: 1, nombre: 'x.pdf' };
        component.documentos = [doc];
        component.descargarDocumento(doc);
        expect(documentosUtil.descargarDocumento).toHaveBeenCalledWith(doc, undefined);
        component.eliminarDocumento(doc);
        expect(documentosUtil.eliminarDocumento).toHaveBeenCalled();
        expect(component.documentos.length).toBe(0);
        component.documentos = [{ id: 2, nombre: 'vis.pdf' }];
        expect(component.obtenerDocumentosAMostrar().length).toBe(1);
    });

    it('agregarDocumento agrega nuevos documentos emitidos por el modal', () => {
        expect(component.documentos.length).toBe(0);
        component.agregarDocumento();
        expect(component.documentos.length).toBe(1);
    });

    it('obtenerItemOrdenCompra y obtenerEntregable actualizan datos solo con identificadores', () => {
        component.ordenCompra = { idOC: 5 } as any;
        component.itemOrdenCompra = { idItem: 7, idVariacion: 8 } as any;
        component.obtenerItemOrdenCompra();
        expect(itemService.obtenerItemOrdenCompra).toHaveBeenCalledWith(5, 7, 8);
        expect(component.itemOrdenCompra?.idItem).toBe(2);

        component.entregable = { idEntregable: 1 } as any;
        component.obtenerEntregable();
        expect(entregableService.obtenerEntregable).toHaveBeenCalledWith(1);
        expect(component.entregable?.idEntregable).toBe(9);

        component.ordenCompra = null;
        component.itemOrdenCompra = null;
        component.entregable = null;
        component.obtenerItemOrdenCompra();
        component.obtenerEntregable();
        expect(itemService.obtenerItemOrdenCompra).toHaveBeenCalledTimes(1);
        expect(entregableService.obtenerEntregable).toHaveBeenCalledTimes(1);
    });
});
