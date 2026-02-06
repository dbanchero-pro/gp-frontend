import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { IAjusteDTO } from '../../models/ajuste.model';

@Component({
    selector: 'app-ajuste-errores-popup',
    templateUrl: './ajuste-errores-popup.component.html',
    styleUrls: ['./ajuste-errores-popup.component.scss'],
    standalone: false,
})
export class AjusteErroresPopupComponent extends PopupBaseComponent {
    @Input() mensajeConfirmacion = '';
    @Input() errores: IAjusteDTO[] = [];
    @Input() deshabilitarGuardar = false;

    @Output() confirmar = new EventEmitter<void>();
    @Output() cancelar = new EventEmitter<void>();

    titulo ='Confirmación de ajustes';

    aceptar(): void {
        if (this.deshabilitarGuardar) {
            return;
        }

        this.confirmar.emit();
        this.cerrarPopup();
    }

    cancelarPopup(): void {
        this.cancelar.emit();
        this.actualizarService.capturarErrores = true;
        this.cerrarPopup();
    }

    obtenerItemAjuste(ajuste: IAjusteDTO): IItemOrdenCompraDTO | undefined | null {
        return ajuste.itemOrdenCompra ?? null;
    }

    obtenerMensajeError(ajuste: IAjusteDTO): string {
        return ajuste.mensajeError?.trim() ?? 'Sin detalle disponible';
    }
}
