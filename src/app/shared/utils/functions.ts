import { HttpParams } from '@angular/common/http';
import { FormControl, FormGroup } from '@angular/forms';
import { NumeroStringNulo } from '../types/numero-string-nulo.type';

import DateTimeFormatOptions = Intl.DateTimeFormatOptions;

export const getRFC339: (date: string) => string = (date: string) => {
    return new Date(date).toISOString().split('T')[0];
};

export const getRFC339FromSD: (date: string) => string = (date: string) => {
    const pattern: RegExp = /(\d{2})\/(\d{2})\/(\d{4})/;
    return getRFC339(date.replace(pattern, '$3-$2-$1'));
};

export const getISODate: (date: Date) => string = (date: Date) => {
    return date ? date.toISOString().split('T')[0] : '';
};

export const getISOLocalDate: (date: Date) => string = (date: Date) => {
    // Convertimos a tiempo local sacando el offset UTC en minutos
    const tzOffset = date.getTimezoneOffset() * 60000;
    const local = new Date(date.getTime() - tzOffset);
    // Tomamos solo la parte de fecha
    return local.toISOString().slice(0, 10);
};

export const getUTCDateES: (date: string) => string = (date: string) => {
    const options: any = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'utc',
    };
    return new Date(date).toLocaleDateString(
        'es',
        <DateTimeFormatOptions>options,
    );
};

export const bsConfig: any = {
    dateInputFormat: 'DD/MM/YYYY',
    containerClass: 'theme-dark-blue',
    adaptivePosition: true,
    useUtc: true,
    customTodayClass: 'clase-hoy',
    showClearButton: true,
    showTodayButton: true,
    showWeekNumbers: false,
    todayButtonLabel: 'Hoy',
    clearButtonLabel: 'Limpiar',
};

export const fieldError: (form: FormGroup, control: string) => boolean = (
    form: FormGroup,
    control: string,
) => {
    return form.controls[control].invalid && form.controls[control].dirty;
};

export const addParam: (
    params: HttpParams,
    paramName: string,
    paramValue: any,
    igcte?: boolean,
) => HttpParams = (
    params: HttpParams,
    paramName: string,
    paramValue: any,
    igcte: boolean = false,
) => {
    if (paramValue) {
        return params.append(
            paramName,
            igcte ? paramValue.toISOString().substring(0, 10) : paramValue + '',
        );
    }
    return params;
};

export const getValor: (
    form: FormGroup,
    controlName: string,
) => number | undefined = (
    form: FormGroup,
    controlName: string,
): number | undefined => {
    let valor: number | undefined = parseFloat(
        (form.get(controlName)?.value + '')
            .split('.')
            .map((aux) => aux.split(',').join('.'))
            .join(''),
    );
    if (isNaN(valor)) {
        valor = undefined;
    }
    return valor;
};

export const removeCommas: (form: FormGroup, controlName: string) => void = (
    form: FormGroup,
    controlName: string,
): void => {
    let valor: string = (form.get(controlName)?.value + '')
        .split('.')
        .map((aux) => aux.split(',').join(','))
        .join('.');
    if (!form.get(controlName)?.value) {
        valor = '';
    }
    form.controls[controlName].setValue(valor);
};

export const addCommas: (form: FormGroup, controlName: string) => void = (
    form: FormGroup,
    controlName: string,
): void => {
    form.controls[controlName].setValue(
        getValor(form, controlName)?.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
        }),
    );
};
export const addCommasString: (value: number) => string = (
    value: number,
): string => {
    return value.toLocaleString('de-DE', {
        minimumFractionDigits: 2,
    });
};
export const numberOnly: (event: any, maxLength: number) => boolean = (
    event: any,
    maxLength: number,
): boolean => {
    let charCode = event.which ?? event.keyCode;

    if (event.key !== undefined && event.key === 'Decimal') {
        // IE / Edge
        charCode = 44;
    }

    if (event.code !== undefined && event.code == 'NumpadDecimal') {
        charCode = 44;
    }
    if (charCode === 44) {
        event.target.value = event.target.value + ',';
        return false;
    }
    if (
        charCode > 31 &&
        !(charCode >= 48 && charCode <= 57) &&
        charCode !== 44 &&
        charCode !== 46
    ) {
        return false;
    }
    if (event.srcElement.value.length >= maxLength) {
        return false;
    }
    return true;
};

export const compararIguales: (
    valor1: string | number,
    valor2: number | string,
) => boolean = (valor1: string | number, valor2: number | string): boolean => {
    if (valor1 == valor2) {
        return true;
    }
    return false;
};

export const compararDistintos: (
    valor1: string | number,
    valor2: number | string,
) => boolean = (valor1: string | number, valor2: number | string): boolean => {
    if (valor1 != valor2) {
        return true;
    }
    return false;
};

export const compararMayor: (
    valor1: string | number,
    valor2: number | string,
) => boolean = (valor1: string | number, valor2: number | string): boolean => {
    if (valor1 > valor2) {
        return true;
    }
    return false;
};

export const compararMenor: (
    valor1: string | number,
    valor2: number | string,
) => boolean = (valor1: string | number, valor2: number | string): boolean => {
    if (valor1 < valor2) {
        return true;
    }
    return false;
};

export const compararMayorIgual: (
    valor1: string | number,
    valor2: number | string,
) => boolean = (valor1: string | number, valor2: number | string): boolean => {
    if (valor1 >= valor2) {
        return true;
    }
    return false;
};

export const compararMenorIgual: (
    valor1: string | number,
    valor2: number | string,
) => boolean = (valor1: string | number, valor2: number | string): boolean => {
    if (valor1 <= valor2) {
        return true;
    }
    return false;
};

export const getValorControl: (form: FormControl) => number | undefined = (
    form: FormControl,
): number | undefined => {
    let valor: number | undefined = parseFloat(
        (form?.value + '')
            .split('.')
            .map((aux) => aux.split(',').join('.'))
            .join(''),
    );
    if (isNaN(valor)) {
        valor = undefined;
    }
    return valor;
};

export const removeCommasControl: (form: FormControl) => void = (
    form: FormControl,
): void => {
    let valor: string = (form?.value + '')
        .split('.')
        .map((aux) => aux.split(',').join(','))
        .join('.');
    if (!form?.value) {
        valor = '';
    }
    form.setValue(valor);
};

export const addCommasControl: (form: FormControl) => void = (
    form: FormControl,
): void => {
    form.setValue(
        getValorControl(form)?.toLocaleString('de-DE', {
            minimumFractionDigits: 2,
        }),
    );
};

export const localDateToDate: (valor: string) => Date = (
    valor: string,
): Date => {
    // Cadena de fecha original en formato 'YYYY-MM-DD'
    const localDateString = valor;

    // Convertir 'YYYY-MM-DD' a 'YYYY/MM/DD'
    const formattedDateString = localDateString.replace(/-/g, '/');

    // Crear el objeto Date
    const localDate = new Date(formattedDateString);
    return localDate;
};

export function formatearCI(raw: NumeroStringNulo | undefined): string {
    const digits = String(raw ?? '').replace(/\D/g, '');
    if (digits.length <= 1) {
        return String(raw ?? '');
    }

    const verificador = digits.slice(-1);
    const cuerpo = digits.slice(0, -1);
    if (cuerpo.length > 10) {
        throw new Error('Cadena demasiado larga para formatear');
    }
    const cuerpoFormateado = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); //NOSONAR
    return `${cuerpoFormateado}-${verificador}`;
}

export function transformarNroDocumento(nroDocumento: string): string {
    if (!nroDocumento || nroDocumento.trim() === '') {
        return '';
    }
    const soloDigitos = nroDocumento.replace(/[.-]/g, '');
    if (/^\d+$/.test(soloDigitos)) {
        return 'uy-ci-' + soloDigitos;
    }
    return nroDocumento;
}

export function campoVacio(control: string, form: FormGroup): boolean {
    const ctrl = form.get(control);
    return ctrl ? ctrl.invalid && (ctrl.dirty || ctrl.touched) : false;
}

export function dividirNroAnioCompra(nroAnioCompraStr: string): {
    numCompra?: number;
    anioCompra?: number;
} {
    if (nroAnioCompraStr?.includes('/')) {
        const [numCompraStr, anioCompraStr] = nroAnioCompraStr
            .split('/')
            .map((s: string) => s.trim());
        const numCompra = Number(numCompraStr);
        const anioCompra = Number(anioCompraStr);
        if (!isNaN(numCompra) && !isNaN(anioCompra)) {
            return { numCompra, anioCompra };
        }
    }
    return {};
}

//Volver con confirmacion de salir sin guardar cambios
export function volverConConfirmacion(
    actualizarService: any,
    accion: () => void,
    form: any,
    mensaje: string = '¿Desea salir sin guardar los cambios?',
): void {
    const formularioTocado = form?.dirty ?? false;

    if (formularioTocado) {
        actualizarService.confirmar(mensaje, () => {
            accion();
        });
    } else {
        accion();
    }
}

export function formularioTocado(form: any): boolean {
    return form?.dirty ?? false;
}

//Volver con confirmacion pero con un callback como "volver"
export function volverConConfirmacionCustom(
    actualizarService: any,
    form: any,
    callbackFn: () => void,
    mensaje: string = '¿Desea salir sin guardar los cambios?',
): void {
    if (formularioTocado(form)) {
        actualizarService.confirmar(mensaje, callbackFn);
    } else {
        callbackFn();
    }
}

export function formatearBytes(bytes: number, decimals: number = 2): string {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function uuidv4() {
    return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c) =>
        (
            +c ^
            (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
        ).toString(16),
    );
}
