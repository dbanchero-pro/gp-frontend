import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface EliminarClausulaData {
  denominacion: string;
  tieneVersionEditable: boolean;
}

@Component({
  selector: 'app-eliminar-clausula-popup',
  templateUrl: './eliminar-clausula-popup.component.html',
  standalone: false
})
export class EliminarClausulaPopupComponent {
  constructor(
    public dialogRef: MatDialogRef<EliminarClausulaPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EliminarClausulaData
  ) {}

  obtenerMensaje(): string {
    if (this.data.tieneVersionEditable) {
      return `¿Está seguro que desea volver a la versión anteriormente aprobada de la cláusula ${this.data.denominacion}?`;
    } else {
      return `¿Está seguro que desea eliminar la sección ${this.data.denominacion}?`;
    }
  }

  confirmar(): void {
    this.dialogRef.close(true);
  }

  cancelar(): void {
    this.dialogRef.close(false);
  }
}
