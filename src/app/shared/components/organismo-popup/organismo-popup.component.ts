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


    constructor(
        private readonly fb: FormBuilder
    ) { super(); }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.fb.group({
            organismo: [null, [Validators.required]],
        });
    }
    
    guardar(): void {
        this.form.markAllAsTouched();
        if (!this.form.valid) {
            return;
        }

        this.guardarEvento.emit(this.form.get('organismo')?.value);
        this.cerrarPopup();
    }

}
