import { Injectable } from '@angular/core';
import { OperadorRegla } from '../enums/operador-regla.enum';
import { TipoDatoCampo } from '../enums/tipo-dato-campo.enum';

@Injectable({
    providedIn: 'root',
})
export class OperadorHelperService {
    obtenerOperadoresPorTipoDato(
        tipoDato: TipoDatoCampo,
    ): { id: string; nombre: string }[] {
        switch (tipoDato) {
            case TipoDatoCampo.NUMERO:
            case TipoDatoCampo.FECHA:
                return [
                    { id: OperadorRegla.IGUAL, nombre: 'Igual' },
                    { id: OperadorRegla.DISTINTO, nombre: 'Distinto' },
                    { id: OperadorRegla.MENOR, nombre: 'Menor' },
                    { id: OperadorRegla.MENOR_IGUAL, nombre: 'Menor o igual' },
                    { id: OperadorRegla.MAYOR, nombre: 'Mayor' },
                    { id: OperadorRegla.MAYOR_IGUAL, nombre: 'Mayor o igual' },
                    { id: OperadorRegla.RANGO, nombre: 'Rango' },
                    {
                        id: OperadorRegla.LISTA_VALORES,
                        nombre: 'Lista de valores',
                    },
                ];

            case TipoDatoCampo.TEXTO:
            case TipoDatoCampo.CORREO_ELECTRONICO:
            case TipoDatoCampo.LISTA_VALORES_UNICA:
            case TipoDatoCampo.HORA:
                return [
                    { id: OperadorRegla.IGUAL, nombre: 'Igual' },
                    { id: OperadorRegla.DISTINTO, nombre: 'Distinto' },
                    {
                        id: OperadorRegla.LISTA_VALORES,
                        nombre: 'Lista de valores',
                    },
                ];

            case TipoDatoCampo.BOOLEANO:
                return [{ id: OperadorRegla.IGUAL, nombre: 'Igual' }];

            default:
                return [];
        }
    }

    obtenerNombreOperador(operador: OperadorRegla): string {
        switch (operador) {
            case OperadorRegla.IGUAL:
                return 'Igual';
            case OperadorRegla.DISTINTO:
                return 'Distinto';
            case OperadorRegla.MENOR:
                return 'Menor';
            case OperadorRegla.MENOR_IGUAL:
                return 'Menor o igual';
            case OperadorRegla.MAYOR:
                return 'Mayor';
            case OperadorRegla.MAYOR_IGUAL:
                return 'Mayor o igual';
            case OperadorRegla.RANGO:
                return 'Rango';
            case OperadorRegla.LISTA_VALORES:
                return 'Lista de valores';
            default:
                return '';
        }
    }
}
