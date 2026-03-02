import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { PopupBaseComponent } from '../../../../../shared/components/popup-base/popup-base.component';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-agregar-valor-popup',
    templateUrl: './agregar-valor-popup.component.html',
    styleUrls: ['./agregar-valor-popup.component.scss'],
    standalone: true,
    imports: [SharedModule],
})
export class AgregarValorPopupComponent
    extends PopupBaseComponent
    implements OnInit
{
    private readonly fb = inject(FormBuilder);
    protected readonly actualizarServ = inject(ActualizarService);

    @Output() valorGuardado = new EventEmitter<string>();

    valoresExistentes: string[] = [];
    titulo = 'Agregar valor permitido';

    override form!: FormGroup<{
        valor: FormControl<string>;
    }>;

    override ngOnInit(): void {
        super.ngOnInit();

        this.form = this.fb.group({
            valor: this.fb.control('', {
                nonNullable: true,
                validators: [Validators.required, Validators.maxLength(200)],
            }),
        });
    }

    guardar(): void {
        this.form.markAllAsTouched();

        if (!this.form.valid) {
            return;
        }

        const valor = this.form.value.valor?.trim() || '';

        if (this.valoresExistentes.includes(valor)) {
            this.actualizarServ.mensajeError('Este valor ya existe en la lista');
            return;
        }

        this.valorGuardado.emit(valor);
        this.cerrarPopup();
    }

    cancelar(): void {
        this.cancelarConConfirmacion();
    }
}
