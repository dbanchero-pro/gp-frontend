import { Pipe, PipeTransform } from '@angular/core';
import { ItemCompraDto } from '../models/item-compra.model';

@Pipe({
    standalone: true,
    name: 'itemResumen',
})
export class ItemResumenPipe implements PipeTransform {
    transform(item: ItemCompraDto | null | undefined): string {
        if (!item) {
            return '';
        }

        const num = item.nroItem ?? '';
        const desc = item.descArticulo ?? '';
        const cod = item.codArticulo ?? '';

        return `Ítem Nº ${num} - ${desc} (Cód. Artículo ${cod})`;
    }
}
