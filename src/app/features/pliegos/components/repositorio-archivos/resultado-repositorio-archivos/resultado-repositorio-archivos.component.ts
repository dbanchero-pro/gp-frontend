import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { DocumentoRepositorioDTO } from '../../../models/documento-repositorio.model';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';
import { SeguridadService } from '../../../../../shared/services/common/seguridad.service';

@Component({
  selector: 'app-resultado-repositorio-archivos',
  templateUrl: './resultado-repositorio-archivos.component.html',
  styleUrls: ['./resultado-repositorio-archivos.component.scss'],
  standalone: false
})
export class ResultadoRepositorioArchivosComponent {
  protected readonly seguridad = inject(SeguridadService);

  @Input() documentos: DocumentoRepositorioDTO[] = [];
  @Output() agregar = new EventEmitter<void>();
  @Output() modificar = new EventEmitter<DocumentoRepositorioDTO>();
  @Output() eliminar = new EventEmitter<DocumentoRepositorioDTO>();
  @Output() descargar = new EventEmitter<DocumentoRepositorioDTO>();

  onAgregar(): void {
    this.agregar.emit();
  }

  obtenerAcciones(documento: DocumentoRepositorioDTO): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    acciones.push({
      nombre: 'Descargar',
      clase: 'btn-link',
      icono: 'fa fa-download',
      accion: () => this.descargar.emit(documento)
    });

    acciones.push({
      nombre: 'Modificar',
      clase: 'btn-link disabled',
      icono: 'fa fa-edit',
      ariaLabel: 'Pendiente'
    });

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn-link',
      icono: 'fa fa-trash',
      accion: () => this.eliminar.emit(documento)
    });

    return acciones;
  }

  ejecutarAccion(accion: AccionBoton): void {
    if (accion.accion) {
      accion.accion();
    }
  }

  obtenerEtiquetaTipoArchivo(tipoArchivo: string | undefined): string {
    switch (tipoArchivo) {
      case 'LOGO':
        return 'Logo';
      case 'FORMULARIO':
        return 'Formulario';
      case 'OTRO':
        return 'Otro';
      default:
        return '-';
    }
  }
}
