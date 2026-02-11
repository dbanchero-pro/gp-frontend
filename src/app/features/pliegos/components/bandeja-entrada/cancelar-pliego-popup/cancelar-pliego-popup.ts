import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProcesoPliego } from '../../../models/proceso-pliego.model';
import { EstadoProcesoPliego } from '../../../enum/estado-proceso-pliego.enum';

@Component({
  selector: 'app-cancelar-pliego-popup',
  templateUrl: './cancelar-pliego-popup.html',
  styleUrl: './cancelar-pliego-popup.scss',
  standalone: false
})
export class CancelarPliegoPopupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  public readonly bsModalRef = inject(BsModalRef);

  proceso!: ProcesoPliego;
  form!: FormGroup;
  guardando = false;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      motivo: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  obtenerNombreEstado(estado: EstadoProcesoPliego): string {
    const estados: { [key in EstadoProcesoPliego]: string } = {
      [EstadoProcesoPliego.PENDIENTE]: 'Pendiente',
      [EstadoProcesoPliego.ASIGNADO]: 'Asignado',
      [EstadoProcesoPliego.EN_PROCESO]: 'En proceso',
      [EstadoProcesoPliego.PENDIENTE_VALIDACION]: 'Pendiente validación',
      [EstadoProcesoPliego.PENDIENTE_APROBACION]: 'Pendiente aprobación',
      [EstadoProcesoPliego.APROBADO]: 'Aprobado',
      [EstadoProcesoPliego.PUBLICADO]: 'Publicado',
      [EstadoProcesoPliego.CANCELADO]: 'Cancelado'
    };
    return estados[estado] || '';
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.guardando = true;
    const motivo = this.form.value.motivo;

    // Aquí se implementará la lógica para cancelar el pliego
    console.log('Cancelando pliego:', this.proceso.id, 'Motivo:', motivo);

    // Simular guardado
    setTimeout(() => {
      this.guardando = false;
      this.bsModalRef.hide();
    }, 500);
  }

  cancelar(): void {
    this.bsModalRef.hide();
  }

  get motivoInvalido(): boolean {
    const control = this.form.get('motivo');
    return !!(control && control.invalid && control.touched);
  }
}
