import { Pipe, PipeTransform } from '@angular/core';
import { CompraDTO } from 'src/app/shared/models/compra.model';

@Pipe({ name: 'nroCompra', standalone: true })
export class NumeroCompraPipe implements PipeTransform {
    transform(compra: Partial<CompraDTO> | null | undefined): string {
        if (!compra) return '';
        const num = compra.numCompra ?? '';
        const anio = compra.anioCompra ?? '';
        return anio ? `${num}/${anio}` : `${num}`;
    }
}
