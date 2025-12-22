import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TipoUsuario } from '../../enum/tipo-usuario.enum';
import { SeguridadService } from '../../services/common/seguridad.service';

@Component({
    selector: 'app-cambiar-perfil',
    templateUrl: './cambiar-perfil.component.html',
    styleUrls: ['./cambiar-perfil.component.scss'],
    standalone: false
})
export class CambiarPerfilComponent implements OnInit {

    tipoUsuario: FormControl = new FormControl('', Validators.required);
    TipoUsuario = TipoUsuario;

    constructor(
        public dialogRef: MatDialogRef<CambiarPerfilComponent>,
        private readonly seguridad: SeguridadService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit(): void {
        this.tipoUsuario.setValue(this.seguridad.obtenerTipoUsuario().toString());
    }

    aceptar() {
        const tipo = this.tipoUsuario.value;
        this.seguridad.cambiarTipoUsuario(tipo);
        this.dialogRef.close({
            tipo
        });
    }


    onCancel(): void {
        this.dialogRef.close();
    }
}
