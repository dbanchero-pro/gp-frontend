import { Directive, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { IDescargoDTO } from 'src/app/features/entregas/models/descargo.model';
import { ItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { ArchivoPopupBaseComponent } from 'src/app/shared/components/archivo-popup-base/archivo-popup-base.component';



@Directive()
export class AgregarDescargoPopupBaseComponent extends ArchivoPopupBaseComponent implements OnInit {

    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() itemOrdenCompra!: ItemOrdenCompraDTO;
    @Output() descargoAgregado = new EventEmitter<IDescargoDTO>();

    constructor(
        protected readonly fb: FormBuilder,
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.form = this.fb.group({
            archivo: ['', Validators.required],
            nombre: ['', Validators.required],
            comentario: ['', Validators.required]
        });
    }

    onArchivoSeleccionado(event: any): void {
        this.onArchivoSeleccionadoInterno(event, (nombreArchivo: string) => this.form.patchValue({
            archivo: event?.target?.value,
            nombre: !this.form.value.nombre || this.form.value.nombre === '' ?
                nombreArchivo : this.form.value.nombre
        }));
    }

    guardarInterno(accion: (dto: IDescargoDTO) => Observable<IDescargoDTO>,idAjuste?: number, idEntrega?: number): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;
        const descargo: IDescargoDTO = {
            id: -Date.now(),
            idAjuste: idAjuste,
            idEntrega: idEntrega,
            comentario: formValues.comentario,
            archivo: {
                id: - Date.now(),
                nombre: formValues.nombre,
                mimeType: this.mimeType,
                contenido: this.base64,
                modificado: true,
                eliminado: false,
                fecha: new Date()
            }

        };

        this.deshabilitarCapturaErrores();
        accion(descargo).subscribe({
            next: () => {
                this.descargoAgregado.emit(descargo);
                this.cerrarPopup();
                this.actualizarService.capturarErrores = true;
                this.actualizarService.mensajeCorrecto('Descargo agregado con éxito');
            },
            error: (error) => {
                this.procesarError(error, 'Error al realizar descargo');
                this.actualizarService.capturarErrores = true;
            }
        });
    }

}
