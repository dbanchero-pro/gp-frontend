import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { ActualizarService } from '../../../../../../shared/services/common/actualizar.service';
import { IPuntoRecepcionDTO } from '../../../models/punto-recepcion.model';
import { PuntosRecepcionService } from '../../../services/puntosRecepcion.service';

@Component({
  selector: 'app-elementos-puntos-recepcion',
  templateUrl: './elementos-puntos-recepcion.component.html',
  styleUrl: './elementos-puntos-recepcion.component.scss',
  standalone: false
})
export class ElementosPuntosRecepcionComponent {
  @Input() puntoRecepcion!: IPuntoRecepcionDTO;
  @Input() navegarEditar!: (id: number) => void;
  @Input() navegarResponsables!: (id: number) => void;
  @Input() esPopup: boolean = false;

  @Output() puntoModificado = new EventEmitter<number>();
  acciones: AccionBoton[] = [];
  correos: string[] = [];

  constructor(
    public readonly bsModalRef: BsModalRef,
    private readonly actualizarServ: ActualizarService,
    private readonly puntosRecepcionService: PuntosRecepcionService) { }

  get inhabilitado(): boolean {
    const fecha = this.puntoRecepcion?.fechaBaja;
    return fecha ? new Date(fecha) < new Date() : false;
  }

  get claseInhabilitado(): string {

    return this.inhabilitado ? "inhabilitado" : "";
  }

  ngOnChanges(): void {
    this.acciones = this.obtenerAcciones(this.puntoRecepcion);
    this.correos = this.puntoRecepcion.correosElectronicos.split(';').map(correo => correo.trim());
  }

  protected obtenerAcciones(puntoRecepcion: IPuntoRecepcionDTO): AccionBoton[] {
    if (!this.inhabilitado) {
      return [
        {
          nombre: 'Modificar',
          ariaLabel: "Modificar punto de recepción id " + puntoRecepcion.id,
          clase: 'btn-ancho-fijo btn-success',
          icono: 'fa-edit',
          permisos: ['GC_GESTION_PUNTOS.MODIFICACION'],
          accion: () => this.navegarEditar(this.puntoRecepcion.id!)
        },
        {
          nombre: 'Inhabilitar',
          ariaLabel: "Inhabilitar punto de recepción id " + puntoRecepcion.id,
          clase: 'btn-success',
          icono: 'fa-ban',
          permisos: ['GC_GESTION_PUNTOS.MODIFICACION', 'GC_GESTION_PUNTOS.BAJA'],
          accion: () => {
            this.inhabilitarElemento(this.puntoRecepcion.id!);
          }
        },
        {
          nombre: 'Responsables',
          ariaLabel: "Responsables punto de recepción id " + puntoRecepcion.id,
          clase: 'btn-success',
          icono: 'fa-users',
          permisos: ['GC_GESTION_PUNTOS.ALTA', 'GC_GESTION_PUNTOS.MODIFICACION', 'GC_GESTION_PUNTOS.CONSULTA'],
          accion: () => this.navegarResponsables(this.puntoRecepcion.id!)
        }
      ];
    } else {
      return [
        {
          nombre: 'Habilitar',
          ariaLabel: "Habilitar punto de recepción id " + puntoRecepcion.id,
          clase: 'btn-ancho-fijo-one btn-primary',
          icono: 'fa-check',
          permisos: ['GC_GESTION_PUNTOS.MODIFICACION', 'GC_GESTION_PUNTOS.BAJA'],
          accion: () => this.habilitarElemento(this.puntoRecepcion.id!)
        }
      ];
    }
  }

  habilitarElemento(id: number): void {
    this.actualizarServ.confirmar('¿Está seguro que desea habilitar el punto de recepción?',
      () => { this.habilitarPuntoRecepcion(id); });
  }

  inhabilitarElemento(id: number): void {
    this.actualizarServ.confirmar('¿Está seguro que desea inhabilitar el punto de recepción?',
      () => { this.inhabilitarPuntoRecepcion(id); });
  }

  inhabilitarPuntoRecepcion(id: number): void {
    this.puntosRecepcionService.inhabilitarPuntoRecepcion(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.puntoModificado.emit(id);
        }, 1000);
        this.actualizarServ.mensajeCorrecto(['Se ha inhabilitado el punto de recepción de forma exitosa.']);
      },
      error: () => {
        this.actualizarServ.mensajeError(['Error al inhabilitar punto de recepción']);
      }
    });
  }

  habilitarPuntoRecepcion(id: number) {
    this.puntosRecepcionService.habilitarPuntoRecepcion(id).subscribe({
      next: () => {
        setTimeout(() => {
          this.puntoModificado.emit(id);
        }, 1000);
        this.actualizarServ.mensajeCorrecto(['Se ha habilitado el punto de recepción de forma exitosa.']);
      },
      error: () => {
        this.actualizarServ.mensajeError(['Error al habilitar punto de recepción']);
      }
    });
  }

  abrirMail(correo: string): void {
      window.open('mailto:' + correo, '_self');
  }
}
