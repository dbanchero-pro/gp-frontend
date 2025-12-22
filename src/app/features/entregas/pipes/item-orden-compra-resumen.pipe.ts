import { Pipe, PipeTransform } from '@angular/core';
import { ItemOrdenCompraDTO } from '../models/item-orden-compra.model';

@Pipe({ name: 'itemOrdenResumen', standalone: false })
export class ItemOrdenCompraResumenPipe implements PipeTransform {
  transform(item: ItemOrdenCompraDTO | null | undefined): string {
    if (!item) { return ''; }

    const num = item.nroItem ?? '';
    const desc = item.descArticulo ?? '';
    const cod = item.codArticulo ?? '';
    const textoAnulado = item.fechaBaja ? ' <span class="text-danger">(Anulado)</span>' : '';
    
    return `Ítem Nº ${num} - ${desc} (Cód. Artículo ${cod})${textoAnulado}`;
    
  }
}
