import { Component, Input } from '@angular/core';
import { IPuntoRecepcionDTO } from 'src/app/features/administracion/puntos-recepcion/models/punto-recepcion.model';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';

@Component({
    selector: 'app-punto-recepcion-popup',
    templateUrl: './punto-recepcion-popup.component.html',
    standalone: false
})
export class PuntoRecepcionPopupComponent extends PopupBaseComponent {
    @Input() puntoRecepcion!: IPuntoRecepcionDTO;
    @Input() titulo: string = 'Detalle del punto de recepción';

    constructor() {
        super();
    }

}
