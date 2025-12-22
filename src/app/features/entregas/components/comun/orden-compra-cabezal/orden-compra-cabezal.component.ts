import { Component, Input } from '@angular/core';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { cambiaUC } from 'src/app/shared/utils/functions';

@Component({
    selector: 'app-orden-compra-cabezal',
    templateUrl: './orden-compra-cabezal.component.html',
    standalone: false
})
export class OrdenCompraCabezalComponent {
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() mostrarFechaComprometida: boolean = false;
    @Input() mostrarPuntoRecepcion: boolean = false;

    get cambiaUC(): boolean {
        return cambiaUC(this.ordenCompra);
    }
}
