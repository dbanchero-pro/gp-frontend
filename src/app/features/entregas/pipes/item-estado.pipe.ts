import { Pipe, PipeTransform } from '@angular/core';
import { EstadoItemOrdenCompra } from '../enum/estado-item-orden-compra';

@Pipe({ name: 'itemEstado', standalone: false })
export class ItemEstadoPipe implements PipeTransform {
  transform(estado: EstadoItemOrdenCompra | null | undefined): string {
    if (!estado) { return ''; }
    if (estado === EstadoItemOrdenCompra.PENDIENTE) {
        return 'Pendiente';
    }
    return 'Conformidad emitida';
  }
}
