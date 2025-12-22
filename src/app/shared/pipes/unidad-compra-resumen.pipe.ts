import { Pipe, PipeTransform } from '@angular/core';
import { UnidadCompraDTO } from '../models/sice/unidad-compra.model';

@Pipe({
    name: 'unidadCompraResumen',
    standalone: false
})
export class UnidadCompraResumenPipe implements PipeTransform {

    transform(unidad: UnidadCompraDTO | null | undefined): string {
        if (!unidad) {
            return '';
        }

        const partes = [
            unidad.descInciso,
            unidad.descUnidadEjecutora,
            unidad.descUnidadCompra
        ].filter(Boolean);

        return partes.join(' | ');
    }
}
