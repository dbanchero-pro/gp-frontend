import { AbstractControl, ValidationErrors } from "@angular/forms";

export function tipoUnidadPorcentaje(valor: number | null, pendiente: number): ValidationErrors | null {
    if (valor == null || isNaN(valor)) return { porcentajeRequerido: true };
    if (valor < 1 || valor > 100) return { porcentajeRango: true };

    if (valor > pendiente) {
        return { excedePendientePorcentaje: true };
    }

    return null;
}

export function tipoUnidadCantidad(valor: number | null, pendiente: number): ValidationErrors | null {
    if (valor == null || isNaN(valor)) return { cantidadRequerida: true };
    if (valor !== 1) return { cantidadDebeSerUno: true };
    if (valor > pendiente) return { excedePendienteCantidad: true };
    return null;
}

export function fechaRangoValidator(formulario: { fechaMinima: string, fechaMaxima: string }) {
    return (control: AbstractControl): ValidationErrors | null => {
        if (!control.value) {
            return null;
        }

        const fechaSeleccionada = new Date(control.value);
        const fechaMin = formulario.fechaMinima ? new Date(formulario.fechaMinima) : null;
        const fechaMax = formulario.fechaMaxima ? new Date(formulario.fechaMaxima) : null;

        if (fechaMin && fechaSeleccionada < fechaMin) {
            return { fechaMinima: { value: control.value } };
        }

        if (fechaMax && fechaSeleccionada > fechaMax) {
            return { fechaMaxima: { value: control.value } };
        }

        return null;
    };
}

