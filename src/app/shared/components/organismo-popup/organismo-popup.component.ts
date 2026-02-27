import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { UsuarioDTO } from '../../models/usuario/usuario.model';
import { PopupBaseComponent } from '../popup-base/popup-base.component';

@Component({
    selector: 'app-organismo-popup',
    templateUrl: './organismo-popup.component.html',
    styleUrls: ['./organismo-popup.component.scss'],

    standalone: false
})
export class OrganismoPopupComponent extends PopupBaseComponent implements OnInit {
    @Input() idUsuarioSeleccionado: string | undefined;
    @Input() usuario?: UsuarioDTO;
    @Output() guardarEvento = new EventEmitter<any>();

    intentoGuardar = false;

    constructor(
        private readonly fb: FormBuilder
    ) { super(); }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.fb.group({
            organismo: [null, [Validators.required]],
            esEditorPrincipal: [false],
            esEditor: [false],
            esValidador: [false],
            esAprobador: [false],
        });
    }

    guardar(): void {
        this.intentoGuardar = true;
        this.form.markAllAsTouched();

        if (!this.form.valid || !this.alMenosUnRolSeleccionado()) {
            return;
        }

        const dataAGuardar = {
            ...this.form.get('organismo')?.value,
            esEditorPrincipal: this.form.get('esEditorPrincipal')!.value,
            esEditor: this.form.get('esEditor')!.value,
            esValidador: this.form.get('esValidador')!.value,
            esAprobador: this.form.get('esAprobador')!.value,
        };

        this.guardarEvento.emit(dataAGuardar);
        this.cerrarPopup();
    }

    alMenosUnRolSeleccionado(): boolean {
        return (
            this.form.get('esEditorPrincipal')!.value ||
            this.form.get('esEditor')!.value ||
            this.form.get('esValidador')!.value ||
            this.form.get('esAprobador')!.value
        );
    }

}


