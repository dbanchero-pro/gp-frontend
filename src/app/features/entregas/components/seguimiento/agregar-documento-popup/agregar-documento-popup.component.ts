import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ArchivoPopupBaseComponent } from 'src/app/shared/components/archivo-popup-base/archivo-popup-base.component';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';

@Component({
    selector: 'app-agregar-documento-popup',
    templateUrl: './agregar-documento-popup.component.html',
    standalone: false
})
export class AgregarDocumentoPopupComponent extends ArchivoPopupBaseComponent implements OnInit {
    @Output() documentoAgregado = new EventEmitter<ArchivoDTO>();
    @Input() override extensionesPermitidas: string = '';


    constructor(
        private readonly fb: FormBuilder,
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();

        this.form = this.fb.group({
            archivo: ['', Validators.required],
            nombre: ['', Validators.required]
        });
    }

    onArchivoSeleccionado(event: any): void {
        this.onArchivoSeleccionadoInterno(event, (nombreArchivo: string) => {
            this.form.patchValue({
                archivo: event?.target?.value,
                nombre: !this.form.value.nombre || this.form.value.nombre === '' ?
                    nombreArchivo : this.form.value.nombre
            });
            if (this.extensionesPermitidas && this.extensionesPermitidas !== ''
                && !this.extensionesPermitidas.toLowerCase().split(',').some(ext => nombreArchivo.toLowerCase().endsWith(ext.trim()))) {
                this.form.get('archivo')?.setErrors({ 'extensionNoValida': true });
            }
        });
    }

    aceptar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;
        const documento: ArchivoDTO = {
            id: -Date.now(),
            nombre: formValues.nombre,
            mimeType: this.mimeType,
            contenido: this.base64,
            modificado: true,
            eliminado: false,
            fecha: formValues.fecha

        };

        this.documentoAgregado.emit(documento);
        this.cerrarPopup();
    }

}
