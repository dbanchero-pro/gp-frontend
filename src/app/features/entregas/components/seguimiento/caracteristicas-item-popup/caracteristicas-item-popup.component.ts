import { Component, Input, OnInit } from '@angular/core';
import { ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoMedida } from '../../../enum/tipo-medida';
import { ItemOrdenCompraAtributoDTO } from '../../../models/item-orden-compra-atributo.model';
import { IOrdenCompraDTO } from '../../../models/orden-ompra.model';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';

@Component({
    selector: 'app-caracteristicas-item-popup',
    templateUrl: './caracteristicas-item-popup.component.html',
    styleUrls: ['./caracteristicas-item-popup.component.scss'],
    standalone: false
})
export class CaracteristicasItemPopupComponent extends PopupBaseComponent implements OnInit {
    @Input() item!: ItemOrdenCompraDTO;
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() titulo: string = 'Características del ítem';
    TipoMedida = TipoMedida;
    // Mock data
    propiedades: ItemOrdenCompraAtributoDTO[] = [];

    constructor(
        private readonly itemOrdenCompraService: ItemOrdenCompraService
    ) {
        super();
    }
    override ngOnInit(): void {
        super.ngOnInit();
        this.itemOrdenCompraService.obtenerAtributos(this.item.idOC!, this.item.idItem!, this.item.idVariacion!).subscribe(atributos => {
            this.propiedades = (atributos ?? []).filter(p => !this.debeOcultarse(p));
        });
    }

    private debeOcultarse(propiedad: ItemOrdenCompraAtributoDTO): boolean {
        return this.empiezaConGuiones(propiedad.descPropiedad) 
            || this.empiezaConGuiones(propiedad.valorTexto);
    }

    private empiezaConGuiones(valor?: string | null): boolean {
        return (valor ?? '').trim().startsWith('----');
    }

    mostrarMedida(propiedad: ItemOrdenCompraAtributoDTO): boolean {
        return !this.empiezaConGuiones(propiedad.descMedidaPropiedad);
    }
}
