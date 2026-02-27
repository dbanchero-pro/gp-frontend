import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { PaginaBusquedaComponent } from 'src/app/shared/components/pagina-busqueda/pagina-busqueda.component';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { CanComponentDeactivate } from 'src/app/shared/utils/can-component-deactivate';
import { EstadoProcesoPliego } from '../../enum/estado-proceso-pliego.enum';
import { PliegoDTO } from '../../models/pliego.model';
import { BandejaEntradaService } from '../../services/bandeja-entrada.service';
import { UsuarioAsignadoDTO } from '../../models/usuario-asignado.model';

@Component({
  selector: 'app-asignar-usuarios',
  templateUrl: './asignar-usuarios.component.html',
  styleUrls: ['./asignar-usuarios.component.scss'],
  standalone: false
})
export class AsignarUsuariosComponent extends PaginaBusquedaComponent<any> implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly actualizarServ = inject(ActualizarService);
  private readonly bandejaEntradaService = inject(BandejaEntradaService);

  @ViewChild('agregarUsuarioTemplate', { static: false }) agregarUsuarioTemplate: any;
  @ViewChild('modificarUsuarioTemplate', { static: false }) modificarUsuarioTemplate: any;

  proceso: PliegoDTO | null = null;
  usuariosAsignados: UsuarioAsignadoDTO[] = [];
  guardando = false;
  usuarioAModificar: UsuarioAsignadoDTO | null = null;

  get columnaOrdenInicial(): string {
    return 'nombre';
  }

  get ordenInicial(): 'asc' | 'desc' {
    return 'asc';
  }

  get listaOrden(): IColumnaOrden[] {
    return [
      { id: 'numeroDocumento', nombre: 'CI' },
      { id: 'nombre', nombre: 'Nombre' },
    ];
  }

  // Datos mock para pruebas
  private usuariosMock: UsuarioAsignadoDTO[] = [
    {
      id: 1,
      numeroDocumento: '1.234.567-8',
      nombre: 'Juan',
      apellido: 'Pérez',
      roles: ['Editor Principal']
    },
    {
      id: 2,
      numeroDocumento: '8.765.432-1',
      nombre: 'María',
      apellido: 'González',
      roles: ['Editor', 'Validador']
    },
    {
      id: 3,
      numeroDocumento: '1.122.334-4',
      nombre: 'Pedro',
      apellido: 'Rodríguez',
      roles: ['Aprobador']
    },
    {
      id: 4,
      numeroDocumento: '5.566.778-8',
      nombre: 'Ana',
      apellido: 'Martínez',
      roles: ['Editor']
    },
    {
      id: 5,
      numeroDocumento: '9.988.776-6',
      nombre: 'Luis',
      apellido: 'Fernández',
      roles: ['Validador', 'Aprobador']
    },
    {
      id: 6,
      numeroDocumento: '2.345.678-9',
      nombre: 'Carmen',
      apellido: 'López',
      roles: ['Editor']
    },
    {
      id: 7,
      numeroDocumento: '3.456.789-0',
      nombre: 'Roberto',
      apellido: 'Sánchez',
      roles: ['Validador']
    },
    {
      id: 8,
      numeroDocumento: '4.567.890-1',
      nombre: 'Laura',
      apellido: 'Ramírez',
      roles: ['Editor', 'Validador']
    }
  ];

  constructor() {
    super();
    this.parametros = {
      filtro: {},
      pagina: 0,
      tamanoPagina: 10,
      sort: 'nombre',
      order: 'asc'
    };
  }

  override ngOnInit(): void {
    super.ngOnInit();

    const procesoIdParam = this.route.snapshot.params['id'];
    const procesoId = procesoIdParam ? Number(procesoIdParam) : null;

    if (procesoId && !isNaN(procesoId)) {
      this.cargarProceso(procesoId);
      this.cargarUsuariosAsignados();
    } else {
      this.actualizarServ.mensajeError('Error: ID de proceso inválido');
      this.volverSinConfirmar();
    }
  }

  cargarProceso(id: number): void {
    this.bandejaEntradaService.obtenerProceso(id).subscribe({
      next: (proceso: PliegoDTO) => {
        this.proceso = proceso;
        this.usuariosAsignados = [...this.usuariosMock];
      },
      error: () => {
        this.actualizarServ.mensajeError('Error al cargar el proceso');
        this.volver();
      }
    });
  }

  cargarUsuariosAsignados(): void {
    // Los usuarios se cargan en el proceso
  }

  override nuevaConsulta(): void {
    this.parametros = {
      filtro: {},
      pagina: 0,
      tamanoPagina: 10,
      sort: 'nombre',
      order: 'asc'
    };
    this.total = -1;
  }

  override cambioPagina(pagina: number): void {
    this.parametros.pagina = pagina - 1;
  }

  override cambioPorPagina(items: number): void {
    this.parametros.tamanoPagina = items;
    this.parametros.pagina = 0;
  }

  override cambioOrden(orden: 'asc' | 'desc'): void {
    this.parametros.order = orden;
  }

  override cambioColumnaOrden(columna: string): void {
    this.parametros.sort = columna;
  }

  buscar(): void {
    // No se realiza búsqueda ya que se muestran todos los usuarios del proceso
  }

  obtenerAcciones(usuario: UsuarioAsignadoDTO): AccionBoton[] {
    return [
      {
        nombre: 'Modificar',
        clase: 'btn btn-success',
        icono: 'fa fa-edit',
        ariaLabel: 'Modificar roles ' + usuario.nombre,
        accion: () => this.modificarUsuario(usuario)
      },
      {
        nombre: 'Eliminar',
        clase: 'btn btn-success',
        icono: 'fa fa-trash',
        ariaLabel: 'Eliminar usuario ' + usuario.nombre,
        accion: () => this.eliminarUsuario(usuario)
      }
    ];
  }

  ejecutarAccion(accion: AccionBoton): void {
    if (accion.accion) {
      accion.accion();
    }
  }

  agregarUsuario(): void {
    this.abrirPopup(this.agregarUsuarioTemplate, 'Guardar');
  }

  guardarNuevoUsuario(usuario: UsuarioAsignadoDTO): void {
    if (!this.proceso) {
      return;
    }

    // Verificar si el usuario ya está asignado
    const yaAsignado = this.usuariosAsignados.some((u: UsuarioAsignadoDTO) => u.id === usuario.id);
    if (yaAsignado) {
      this.actualizarServ.mensajeInformacion('El usuario ya está asignado al proceso');
      return;
    }

    // Agregar el usuario a la lista
    this.usuariosAsignados.push(usuario);

    this.actualizarServ.mensajeCorrecto('Usuario agregado correctamente');
    this.cerrarPopup();
  }

  modificarUsuario(usuario: UsuarioAsignadoDTO): void {
    this.usuarioAModificar = usuario;
    this.abrirPopup(this.modificarUsuarioTemplate, 'Guardar');
  }

  guardarUsuarioModificado(usuarioModificado: UsuarioAsignadoDTO): void {
    // Encontrar y actualizar el usuario en la lista
    const index = this.usuariosAsignados.findIndex((u: UsuarioAsignadoDTO) => u.id === usuarioModificado.id);
    if (index !== -1) {
      this.usuariosAsignados[index] = usuarioModificado;
      this.actualizarServ.mensajeCorrecto('Roles del usuario modificados correctamente');
    }

    this.usuarioAModificar = null;
    this.cerrarPopup();
  }

  eliminarUsuario(usuario: UsuarioAsignadoDTO): void {
    console.log('Eliminar usuario:', usuario);
    // TODO: Implementar lógica de eliminar usuario
    const index = this.usuariosAsignados.findIndex((u: UsuarioAsignadoDTO) => u.id === usuario.id);
    if (index !== -1) {
      this.usuariosAsignados.splice(index, 1);
    }
  }

  obtenerNombreCompleto(usuario: UsuarioAsignadoDTO): string {
    return `${usuario.nombre} ${usuario.apellido}`;
  }

  obtenerRoles(usuario: UsuarioAsignadoDTO): string {
    return usuario.roles.join(', ');
  }

  finalizar(): void {
    if (!this.proceso) {
      this.actualizarServ.mensajeError('Error: no se ha cargado el proceso');
      return;
    }

    const usuariosAsignados = this.usuariosAsignados || [];

    if (usuariosAsignados.length === 0) {
      this.actualizarServ.mensajeInformacion('Debe asignar al menos un usuario');
      return;
    }

    const tieneEditorPrincipal = usuariosAsignados.some((u: UsuarioAsignadoDTO) =>
      u.roles.includes('Editor Principal')
    );

    if (!tieneEditorPrincipal) {
      this.actualizarServ.mensajeInformacion('Debe asignar un editor principal');
      return;
    }

    this.guardando = true;

    // TODO: Reemplazar con la llamada real al servicio
    this.bandejaEntradaService.asignarUsuariosYFinalizar(this.proceso.id, usuariosAsignados).subscribe({
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
    this.volverSinConfirmar();
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
    return true; // Por ahora siempre permite salir
  }

  obtenerTextoOrganismo(): string {
    if (!this.proceso) {
      return '';
    }
    return `${this.proceso.unidadEjecutora?.inciso?.descInciso ?? ''} | ${this.proceso.unidadEjecutora?.descUnidadEjecutora ?? ''}`;
  }

  obtenerTextoTipoCompra(): string {
    if (!this.proceso) {
      return '';
    }
    const tipoCompra = this.proceso.subtipoCompra?.descTipoCompra ?? '';
    const subtipoCompra = this.proceso.subtipoCompra?.descSubtipoCompra ?? '';
    return `${tipoCompra} | ${subtipoCompra} N° ${this.proceso.numeroCompra}/${this.proceso.anioCompra}`;
  }
}
