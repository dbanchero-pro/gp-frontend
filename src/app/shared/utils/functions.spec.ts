import { HttpParams } from "@angular/common/http";
import { FormBuilder, FormControl } from "@angular/forms";
import {
    addCommas,
    addCommasControl,
    addCommasString,
    addParam,
    campoVacio,
    compararDistintos,
    compararIguales,
    compararMayor,
    compararMayorIgual,
    compararMenor,
    compararMenorIgual,
    dividirNroAnioCompra,
    fieldError,
    formatearCI,
    formularioTocado,
    getISODate,
    getRFC339,
    getRFC339FromSD,
    getUTCDateES,
    getValor,
    getValorControl,
    localDateToDate,
    numberOnly,
    removeCommas,
    removeCommasControl,
    transformarNroDocumento,
    volverConConfirmacion,
    volverConConfirmacionCustom
} from './functions';
describe('Test Suite for Functions', () => {

    let formBuilder: FormBuilder;

    beforeEach(() => {
        formBuilder = new FormBuilder();
    });

    it('getRFC339 debe retornar una fecha válida en formato RFC339', () => {
        const result = getRFC339('01/15/2023');
        expect(result).toBe('2023-01-15');
    });

    it('getRFC339FromSD debe retornar una fecha válida en formato RFC339 desde una cadena', () => {
        const result = getRFC339FromSD('15/01/2023');
        expect(result).toBe('2023-01-15');
    });

    it('getUTCDateES debe retornar una cadena UTC en formato español', () => {
        const result = getUTCDateES('01/15/2023');
        expect(result).toBe('15/01/2023');
    });

    it('addParam debe agregar parámetros a HttpParams', () => {
        const params = new HttpParams();
        const result = addParam(params, 'paramName', 'paramValue');
        expect(result.get('paramName')).toBe('paramValue');
    });

    it('getValor debe devolver un número válido del formulario', () => {
        const form = formBuilder.group({
            testControl: '123,45'
        });
        const result = getValor(form, 'testControl');
        expect(result).toBe(123.45);
    });

    it('removeCommas debe quitar las comas del valor del control', () => {
        const form = formBuilder.group({
            testControl: '1234'
        });
        removeCommas(form, 'testControl');
        expect(form.get('testControl')?.value).toBe('1234');
    });

    it('addCommas debe agregar comas al valor del control', () => {
        const form = formBuilder.group({
            testControl: '1234,56'
        });
        addCommas(form, 'testControl');
        expect(form.get('testControl')?.value).toBe('1.234,56');
    });

    it('numberOnly debe permitir solo números y comas válidas', () => {
        const event = { key: '5', which: 53, keyCode: 53, srcElement: { value: '123.45' } };
        const result = numberOnly(event, 5);
        expect(result).toBe(false);
    });

    it('numberOnly debe permitir solo números y comas válidas', () => {
        let event = { key: '5', which: 53, keyCode: 53, srcElement: { value: '123.45' } };
        numberOnly(event, 5);
        let event2 = { key: 'Decimal', code: 'NumpadDecimal', which: 44, keyCode: 44, srcElement: { value: '123.45' }, target: { value: 5 } };
        let result = numberOnly(event2, 5);
        expect(result).toBe(false);
    });

    it('numberOnly debe permitir solo números y comas válidas', () => {
        let event = { key: '5', which: 32, keyCode: 32, srcElement: { value: '123.45' } };
        let result = numberOnly(event, 5);

        expect(result).toBe(false);
    });

    it('getISODate debe manejar fecha undefined sin fallar', () => {
        const date = new Date('2023-01-15');
        expect(getISODate(date)).toBe('2023-01-15');
        expect(getISODate(undefined as any)).toBe('');
    });

    it('fieldError debe detectar control inválido y sucio', () => {
        const form = formBuilder.group({
            test: [''],
        });
        form.controls['test'].markAsDirty();
        form.controls['test'].setErrors({ required: true });
        expect(fieldError(form, 'test')).toBeTrue();
    });

    it('addCommasString debe formatear números correctamente', () => {
        expect(addCommasString(1234.5)).toBe('1.234,50');
    });

    it('los comparadores deben evaluar correctamente', () => {
        expect(compararIguales(5, '5')).toBeTrue();
        expect(compararDistintos(5, 6)).toBeTrue();
        expect(compararMayor(6, 5)).toBeTrue();
        expect(compararMenor(4, 5)).toBeTrue();
        expect(compararMayorIgual(5, 5)).toBeTrue();
        expect(compararMenorIgual(5, 5)).toBeTrue();
    });

    it('los helpers de controles deben funcionar correctamente', () => {
        const control = formBuilder.control('1.234,56');
        expect(getValorControl(control)).toBe(1234.56);
        removeCommasControl(control);
        expect(control.value).toBe('1.234,56');
        addCommasControl(control);
        expect(control.value).toBe('1.234,56');
    });

    it('localDateToDate debe convertir correctamente', () => {
        const d = localDateToDate('2023-01-15');
        expect(d.getFullYear()).toBe(2023);
        expect(d.getMonth()).toBe(0);
        expect(d.getDate()).toBe(15);
    });

    it('formatearCI debe formatear con puntos y guión', () => {
        expect(formatearCI('12345678')).toBe('1.234.567-8');
        expect(formatearCI(1234567)).toBe('123.456-7');
    });

    it('dividirNroAnioCompra debe devolver vacío para entrada inválida', () => {
        const res = dividirNroAnioCompra('abc');
        expect(res).toEqual({});
    });


    it('dividirNroAnioCompra debe parsear el valor', () => {
        const res = dividirNroAnioCompra('10/2025');
        expect(res).toEqual({ numCompra: 10, anioCompra: 2025 });
    });

    it('transformarNroDocumento agrega prefijo cuando es numérico', () => {
        expect(transformarNroDocumento('123')).toBe('uy-ci-123');
        expect(transformarNroDocumento('1.2.3')).toBe('uy-ci-123');
    });

    it('campoVacio detecta control inválido y tocado', () => {
        const form = formBuilder.group({ test: [''] });
        form.controls['test'].markAsTouched();
        form.controls['test'].setErrors({ required: true });
        expect(campoVacio('test', form)).toBeTrue();
    });

    it('formularioTocado y volverConConfirmacion funcionan', () => {
        const actualizar = { confirmar: jasmine.createSpy('confirmar') };
        const bs = { hide: jasmine.createSpy('hide') };
        const form = { dirty: true };
        volverConConfirmacion(actualizar, () => bs.hide(), form);
        const confirmCb = actualizar.confirmar.calls.mostRecent().args[1];
        confirmCb();
        expect(bs.hide).toHaveBeenCalled();
        expect(formularioTocado(form)).toBeTrue();
    });

    it('volverConConfirmacionCustom ejecuta callback según estado', () => {
        const actualizar = { confirmar: jasmine.createSpy('confirmar') };
        const form = { dirty: false };
        const cb = jasmine.createSpy('cb');
        volverConConfirmacionCustom(actualizar, form, cb);
        expect(cb).toHaveBeenCalled();
        form.dirty = true;
        volverConConfirmacionCustom(actualizar, form, cb);
        expect(actualizar.confirmar).toHaveBeenCalled();
    });

    it('fieldError detecta control inválido y marcado', () => {
        const fg = formBuilder.group({ test: new FormControl('') });
        fg.controls['test'].markAsDirty();
        fg.controls['test'].setErrors({ required: true });
        expect(fieldError(fg, 'test')).toBeTrue();
    });

    it('addParam formatea fechas cuando igcte es true', () => {
        const params = addParam(new HttpParams(), 'd', new Date('2020-01-01'), true);
        expect(params.get('d')).toBe('2020-01-01');
    });

    it('los comparadores funcionan', () => {
        expect(compararIguales(1, 1)).toBeTrue();
        expect(compararDistintos(1, 2)).toBeTrue();
        expect(compararMayor(2, 1)).toBeTrue();
        expect(compararMenor(1, 2)).toBeTrue();
        expect(compararMayorIgual(2, 2)).toBeTrue();
        expect(compararMenorIgual(2, 2)).toBeTrue();
    });

    it('los helpers de comas controlan valores', () => {
        const control = new FormControl('1.234,56');
        removeCommasControl(control);
        expect(control.value).toBe('1.234,56');
        addCommasControl(control);
        expect(control.value).toBe('1.234,56');
        expect(getValorControl(control)).toBe(1234.56);
    });

    it('localDateToDate y formatearCI', () => {
        expect(localDateToDate('2024-01-02').getFullYear()).toBe(2024);
        expect(formatearCI('1234567-8')).toBe('1.234.567-8');
        expect(formatearCI(1234567)).toBe('123.456-7');
    });
});
