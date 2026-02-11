import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcesoPliego } from '../../../models/proceso-pliego.model';
import { EstadoProcesoPliego } from '../../../enum/estado-proceso-pliego.enum';
import { UsuarioDTO } from '../../../../../shared/models/usuario/usuario.model';
import { BandejaEntradaService } from '../../../services/bandeja-entrada.service';
import { UsuarioService } from '../../../../../shared/services/usuario/usuario.service';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { CanComponentDeactivate } from '../../../../../shared/utils/can-component-deactivate';
import { Observable } from 'rxjs';
import { formularioTocado } from '../../../../../shared/utils/functions';

interface UsuarioRol {
  usuario: UsuarioDTO;
  esEditorPrincipal: boolean;
  esEditor: boolean;
  esValidador: boolean;
  esAprobador: boolean;
}

@Component({
  selector: 'app-asignar-usuarios',
  templateUrl: './asignar-usuarios.component.html',
  styleUrls: ['./asignar-usuarios.component.scss'],
  standalone: false
})
export class AsignarUsuariosComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bandejaEntradaService = inject(BandejaEntradaService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly actualizarServ = inject(ActualizarService);

  proceso!: ProcesoPliego;
  formBusqueda!: FormGroup;
  formRoles!: FormGroup;

  usuarioEncontrado: UsuarioDTO | null = null;
  busquedaRealizada = false;
  buscandoUsuario = false;
  intentoAgregar = false;
  guardando = false;

  editorPrincipal: UsuarioDTO | null = null;
  editores: UsuarioDTO[] = [];
  validadores: UsuarioDTO[] = [];
  aprobadores: UsuarioDTO[] = [];

  usuariosConRoles: UsuarioRol[] = [];

  ngOnInit(): void {
    const procesoId = this.route.snapshot.params['id'];
    this.cargarProceso(procesoId);

    this.formBusqueda = this.fb.nonNullable.group({
      nroDocumento: [''],
      nombre: ['']
    });

    this.formRoles = this.fb.nonNullable.group({
      esEditorPrincipal: [false],
      esEditor: [false],
      esValidador: [false],
      esAprobador: [false]
    });

    this.formRoles.get('esEditorPrincipal')?.valueChanges.subscribe(value => {
      if (value) {
        this.formRoles.patchValue({
          esEditor: false,
          esValidador: false,
          esAprobador: false
        }, { emitEvent: false });
      }
    });
  }

  cargarProceso(id: number): void {
    this.bandejaEntradaService.obtenerProceso(id).subscribe({
      next: (proceso: ProcesoPliego) => {
        this.proceso = proceso;
      },
      error: () => {
        this.actualizarServ.mensajeError('Error al cargar el proceso');
        this.volver();
      }
    });
  }

  buscarUsuario(): void {
    const nroDocumento = this.formBusqueda.value.nroDocumento?.trim();
    const nombre = this.formBusqueda.value.nombre?.trim();

    if (!nroDocumento && !nombre) {
      this.actualizarServ.mensajeInformacion('Debe ingresar al menos un criterio de búsqueda');
      return;
    }

    this.buscandoUsuario = true;
    this.busquedaRealizada = false;
    this.usuarioEncontrado = null;

    this.usuarioService.buscarUsuario(nroDocumento, nombre).subscribe({
      next: (usuario: UsuarioDTO | null) => {
        this.usuarioEncontrado = usuario;
        this.busquedaRealizada = true;
        this.buscandoUsuario = false;

        if (!usuario) {
          this.actualizarServ.mensajeInformacion('No se encontró ningún usuario con los criterios ingresados');
        }
      },
      error: () => {
        this.busquedaRealizada = true;
        this.buscandoUsuario = false;
        this.actualizarServ.mensajeError('Error al buscar el usuario');
      }
    });
  }

  alMenosUnRolSeleccionado(): boolean {
    const roles = this.formRoles.value;
    return roles.esEditorPrincipal || roles.esEditor || roles.esValidador || roles.esAprobador;
  }

  get editorPrincipalAsignado(): boolean {
    return this.editorPrincipal !== null;
  }

  seleccionarUsuario(): void {
    this.intentoAgregar = true;

    if (!this.usuarioEncontrado) {
      return;
    }

    if (!this.alMenosUnRolSeleccionado()) {
      this.actualizarServ.mensajeInformacion('Debe seleccionar al menos un rol');
      return;
    }

    const roles = this.formRoles.value;

    if (this.usuarioYaAsignado(this.usuarioEncontrado)) {
      this.actualizarServ.mensajeInformacion('Este usuario ya está asignado');
      return;
    }

    if (roles.esEditorPrincipal) {
      if (this.editorPrincipal) {
        this.actualizarServ.mensajeInformacion('Ya existe un editor principal asignado');
        return;
      }
      this.editorPrincipal = this.usuarioEncontrado;
    }

    if (roles.esEditor) {
      this.editores.push(this.usuarioEncontrado);
    }

    if (roles.esValidador) {
      this.validadores.push(this.usuarioEncontrado);
    }

    if (roles.esAprobador) {
      this.aprobadores.push(this.usuarioEncontrado);
    }

    this.usuariosConRoles.push({
      usuario: this.usuarioEncontrado,
      esEditorPrincipal: roles.esEditorPrincipal,
      esEditor: roles.esEditor,
      esValidador: roles.esValidador,
      esAprobador: roles.esAprobador
    });

    this.formBusqueda.reset();
    this.formRoles.reset({
      esEditorPrincipal: false,
      esEditor: false,
      esValidador: false,
      esAprobador: false
    });
    this.usuarioEncontrado = null;
    this.busquedaRealizada = false;
    this.intentoAgregar = false;

    this.actualizarServ.mensajeCorrecto('Usuario agregado correctamente');
  }

  usuarioYaAsignado(usuario: UsuarioDTO): boolean {
    return this.usuariosConRoles.some(ur => ur.usuario.id === usuario.id);
  }

  quitarUsuario(usuario: UsuarioDTO, tipo: 'editorPrincipal' | 'editor' | 'validador' | 'aprobador'): void {
    switch (tipo) {
      case 'editorPrincipal':
        this.editorPrincipal = null;
        break;
      case 'editor':
        this.editores = this.editores.filter(u => u.id !== usuario.id);
        break;
      case 'validador':
        this.validadores = this.validadores.filter(u => u.id !== usuario.id);
        break;
      case 'aprobador':
        this.aprobadores = this.aprobadores.filter(u => u.id !== usuario.id);
        break;
    }

    const usuarioRol = this.usuariosConRoles.find(ur => ur.usuario.id === usuario.id);
    if (usuarioRol) {
      switch (tipo) {
        case 'editorPrincipal':
          usuarioRol.esEditorPrincipal = false;
          break;
        case 'editor':
          usuarioRol.esEditor = false;
          break;
        case 'validador':
          usuarioRol.esValidador = false;
          break;
        case 'aprobador':
          usuarioRol.esAprobador = false;
          break;
      }

      if (!usuarioRol.esEditorPrincipal && !usuarioRol.esEditor &&
          !usuarioRol.esValidador && !usuarioRol.esAprobador) {
        this.usuariosConRoles = this.usuariosConRoles.filter(ur => ur.usuario.id !== usuario.id);
      }
    }
  }

  guardar(): void {
    if (this.usuariosConRoles.length === 0) {
      this.actualizarServ.mensajeInformacion('Debe asignar al menos un usuario');
      return;
    }

    this.guardando = true;

    this.bandejaEntradaService.asignarUsuarios(this.proceso.id, this.usuariosConRoles).subscribe({
      next: () => {
        this.guardando = false;
        this.actualizarServ.mensajeCorrecto('Usuarios guardados correctamente');
      },
      error: () => {
        this.guardando = false;
        this.actualizarServ.mensajeError('Error al guardar los usuarios');
      }
    });
  }

  finalizar(): void {
    if (this.usuariosConRoles.length === 0) {
      this.actualizarServ.mensajeInformacion('Debe asignar al menos un usuario');
      return;
    }

    if (!this.editorPrincipal) {
      this.actualizarServ.mensajeInformacion('Debe asignar un editor principal');
      return;
    }

    this.guardando = true;

    this.bandejaEntradaService.asignarUsuariosYFinalizar(this.proceso.id, this.usuariosConRoles).subscribe({
      next: () => {
        this.guardando = false;
        this.actualizarServ.mensajeCorrecto('Asignación finalizada correctamente');
        this.volverSinConfirmar();
      },
      error: () => {
        this.guardando = false;
        this.actualizarServ.mensajeError('Error al finalizar la asignación');
      }
    });
  }

  volver(): void {
    if (this.usuariosConRoles.length > 0 && !this.guardando) {
      this.actualizarServ.confirmar(
        '¿Está seguro que desea cancelar? Se perderán los cambios realizados',
        () => this.volverSinConfirmar()
      );
    } else {
      this.volverSinConfirmar();
    }
  }

  volverSinConfirmar(): void {
    this.router.navigate(['/pliegos/bandeja-entrada'], {
      queryParams: { volver: 1 }
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

  obtenerClaseBadgeEstado(estado: EstadoProcesoPliego): string {
    const clases: { [key in EstadoProcesoPliego]: string } = {
      [EstadoProcesoPliego.PENDIENTE]: 'badge-info',
      [EstadoProcesoPliego.ASIGNADO]: 'badge-info',
      [EstadoProcesoPliego.EN_PROCESO]: 'badge-warning',
      [EstadoProcesoPliego.PENDIENTE_VALIDACION]: 'badge-warning',
      [EstadoProcesoPliego.PENDIENTE_APROBACION]: 'badge-warning',
      [EstadoProcesoPliego.APROBADO]: 'badge-warning',
      [EstadoProcesoPliego.PUBLICADO]: 'badge-success',
      [EstadoProcesoPliego.CANCELADO]: 'badge-cancel'
    };
    return clases[estado];
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    return this.usuariosConRoles.length === 0 || this.guardando;
  }
}
