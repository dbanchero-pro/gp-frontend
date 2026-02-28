import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';import { SharedModule } from 'src/app/shared/shared.module';


@Component({
    selector: 'app-modificar-rol-popup',
    templateUrl: './modificar-rol-popup.component.html',
    styleUrls: ['./modificar-rol-popup.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
  ],
})
export class ModificarRolPopupComponent extends PopupBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<any>();

    override form!: FormGroup;
    permiso: any;
    intentoGuardar = false;
    guardando = false;

    constructor(private readonly fb: FormBuilder) {
        super();
    }

    override ngOnInit(): void {
        this.form = this.fb.group({
            esEditorPrincipal: [false],
            esEditor: [false],
            esValidador: [false],
            esAprobador: [false],
        });

        if (this.permiso) {
            this.form.patchValue({
                esEditorPrincipal: this.permiso.esEditorPrincipal ?? false,
                esEditor: this.permiso.esEditor ?? false,
                esValidador: this.permiso.esValidador ?? false,
                esAprobador: this.permiso.esAprobador ?? false,
            });
        }
    }

    alMenosUnRolSeleccionado(): boolean {
        const valores = this.form.value;
        return valores.esEditorPrincipal || valores.esEditor || valores.esValidador || valores.esAprobador;
    }

    guardar(): void {
        this.intentoGuardar = true;

        if (!this.alMenosUnRolSeleccionado()) {
            return;
        }

        this.guardando = true;

        const roles = {
            esEditorPrincipal: this.form.value.esEditorPrincipal,
            esEditor: this.form.value.esEditor,
            esValidador: this.form.value.esValidador,
            esAprobador: this.form.value.esAprobador,
        };

        this.guardarEvento.emit({
            id: this.permiso.id,
            roles: roles
        });
    }

    cancelar(): void {
        this.cerrarPopup();
    }
}


