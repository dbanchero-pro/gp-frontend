import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { fechaEntregaParaProveedor } from 'src/app/shared/utils/functions';
import { IEntregableDTO } from '../../../models/entregable.model';
import { IItemOrdenCompraDTO } from '../../../models/item-orden-compra.model';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';

@Component({
    selector: 'app-item-orden-compra-cabezal',
    templateUrl: './item-orden-compra-cabezal.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})

export class ItemOrdenCompraCabezalComponent {
    @Input() itemOrdenCompra!: IItemOrdenCompraDTO;
    @Input() entregable!: IEntregableDTO;
    @Input() mostrarCantidadPendienteEntrega: boolean = false;
    @Input() mostrarCantidadPendienteRecepcion: boolean = false;
    @Input() mostrarCantidadPendienteConformidad: boolean = false;
    @Input() mostrarCantidadPendienteAsignar: boolean = false;
    @Input() mostrarCantidadPendienteEntregable: boolean = false;
    @Input() mostrarCantidadPendienteAsignarEntregable: boolean = false;
    @Input() mostrarFechaComprometida: boolean = false;
    @Input() esUsuarioProveedor: boolean = false;

    decimalPipe = new DecimalPipe('es');

    constructor(private readonly itemOrdenCompraService: ItemOrdenCompraService) {
    }

    get claseFechaEntrega(): string {
        return this.fechaEntregaParaProveedor()
            ? 'text-danger font-weight-bold'
            : 'font-weight-bold';
    }

    fechaEntregaParaProveedor(): boolean {
        return fechaEntregaParaProveedor(this.itemOrdenCompra, this.esUsuarioProveedor ? TipoUsuario.PROVEEDOR : TipoUsuario.ORGANISMO);
    }

    obtenerUnidadMedida(): string | null {
        return this.itemOrdenCompraService.obtenerUnidades(this.itemOrdenCompra);
    }

    cantidadesPendientes(): string {
        return this.itemOrdenCompraService.cantidadesPendienteEntregaYTotal(this.itemOrdenCompra);
    }

    cantidadesPendientesAsignar(): string {
        return this.itemOrdenCompraService.cantidadesPendienteAsignarEntregaYTotal(this.itemOrdenCompra);
    }

    cantidadesPendientesRecepcion(): string {
        return this.itemOrdenCompraService.cantidadesPendienteRecepcionYTotal(this.itemOrdenCompra);
    }

    cantidadesPendientesConformidad(): string {
        return this.itemOrdenCompraService.cantidadesPendienteConformidadYTotal(this.itemOrdenCompra);
    }


    cantidadesPendientesEntregable(): string {
        return this.itemOrdenCompraService.cantidadesPendienteEntregaYTotalEntregable(this.itemOrdenCompra);
    }
}
