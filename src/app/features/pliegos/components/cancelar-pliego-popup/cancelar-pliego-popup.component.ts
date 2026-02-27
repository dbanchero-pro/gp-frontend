import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { EstadoPliego } from '../../enum/estado-pliego.enum';
import { PliegoDTO } from '../../models/pliego.model';

@Component({
  selector: 'app-cancelar-pliego-popup',
  templateUrl: './cancelar-pliego-popup.component.html',
  styleUrl: './cancelar-pliego-popup.component.scss',
})
export class CancelarPliegoPopupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  public readonly bsModalRef = inject(BsModalRef);

  proceso!: PliegoDTO;
  form!: FormGroup;
  guardando = false;

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      motivo: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  obtenerNombreEstado(estado: EstadoPliego): string {
    const estados: { [key in EstadoPliego]: string } = {
      [EstadoPliego.PENDIENTE]: 'Pendiente',
      [EstadoPliego.ASIGNADO]: 'Asignado',
      [EstadoPliego.EN_PROCESO]: 'En proceso',
      [EstadoPliego.PENDIENTE_VALIDACION]: 'Pendiente validación',
      [EstadoPliego.PENDIENTE_APROBACION]: 'Pendiente aprobación',
      [EstadoPliego.APROBADO]: 'Aprobado',
      [EstadoPliego.PUBLICADO]: 'Publicado',
      [EstadoPliego.CANCELADO]: 'Cancelado'
    };
    return estados[estado] || '';
  }

  obtenerClaseBadgeEstado(estado: EstadoPliego): string {
    const clases: { [key in EstadoPliego]: string } = {
      [EstadoPliego.PENDIENTE]: 'badge-info',
      [EstadoPliego.ASIGNADO]: 'badge-info',
      [EstadoPliego.EN_PROCESO]: 'badge-warning',
      [EstadoPliego.PENDIENTE_VALIDACION]: 'badge-warning',
      [EstadoPliego.PENDIENTE_APROBACION]: 'badge-warning',
      [EstadoPliego.APROBADO]: 'badge-warning',
      [EstadoPliego.PUBLICADO]: 'badge-success',
      [EstadoPliego.CANCELADO]: 'badge-cancel'
    };
    return clases[estado];
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

  obtenerTextoOrganismo(): string {
    return `${this.proceso?.unidadEjecutora?.inciso?.descInciso ?? ''} | ${this.proceso?.unidadEjecutora?.descUnidadEjecutora ?? ''}`;
  }

  obtenerTextoTipoCompra(): string {
    const tipo = this.proceso?.subtipoCompra?.descTipoCompra ?? '';
    const subtipo = this.proceso?.subtipoCompra?.descSubtipoCompra ?? '';
    return `${tipo} | ${subtipo} N° ${this.proceso?.numeroCompra ?? ''}/${this.proceso?.anioCompra ?? ''}`;
  }
}


