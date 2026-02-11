import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ProcesoPliego } from '../../models/proceso-pliego.model';
import { FiltroBandejaEntrada } from '../../models/filtro-bandeja-entrada.model';
import { EstadoProcesoPliego } from '../../enum/estado-proceso-pliego.enum';
import { BandejaEntradaService } from '../../services/bandeja-entrada.service';
import { IncisoDTO } from '../../../../shared/models/sice/inciso.model';
import { UnidadEjecutoraDTO } from '../../../../shared/models/sice/unidad-ejecutora.model';
import { UnidadCompraDTO } from '../../../../shared/models/sice/unidad-compra.model';
import { TipoCompraDTO } from '../../../../shared/models/sice/tipo-compra.model';
import { AccionBoton } from '../../../../shared/models/common/accion-boton.model';
import { IColumnaOrden } from '../../../../shared/models/common/columna-orden.model';
import { FechaHoraPipe } from '../../../../shared/pipes/fecha-hora.pipe';
import { PaginaBusquedaComponent } from '../../../../shared/components/pagina-busqueda/pagina-busqueda.component';
import { PageModel } from '../../../../shared/models/common/page/page.model';
import { CancelarPliegoPopupComponent } from './cancelar-pliego-popup/cancelar-pliego-popup';

@Component({
  selector: 'app-bandeja-entrada',
  templateUrl: './bandeja-entrada.component.html',
  styleUrls: ['./bandeja-entrada.component.scss'],
  standalone: false
})
export class BandejaEntradaComponent extends PaginaBusquedaComponent<FiltroBandejaEntrada> implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly bandejaEntradaService = inject(BandejaEntradaService);
  private readonly router = inject(Router);
  private readonly fechaHoraPipe = inject(FechaHoraPipe);

  procesos: ProcesoPliego[] = [];
  cargando = false;

  columnaOrdenInicial = 'estado';
  ordenInicial: 'asc' | 'desc' = 'asc';

  listaOrden: IColumnaOrden[] = [
    { id: 'estado', nombre: 'Estado' },
    { id: 'numeroCompra', nombre: 'N°/Año compra' },
    { id: 'tipoCompraDescripcion', nombre: 'Tipo de compra' }
  ];

  incisos: IncisoDTO[] = [
    new IncisoDTO(1, 'Poder Ejecutivo'),
    new IncisoDTO(2, 'Poder Legislativo'),
    new IncisoDTO(3, 'Poder Judicial')
  ];

  unidadesEjecutoras: UnidadEjecutoraDTO[] = [];
  unidadesEjecutorasMock: UnidadEjecutoraDTO[] = [
    new UnidadEjecutoraDTO(1, new IncisoDTO(1, 'Poder Ejecutivo'), 1, 'Ministerio de Economía'),
    new UnidadEjecutoraDTO(2, new IncisoDTO(1, 'Poder Ejecutivo'), 3, 'Ministerio de Salud'),
    new UnidadEjecutoraDTO(3, new IncisoDTO(2, 'Poder Legislativo'), 2, 'Cámara de Diputados'),
    new UnidadEjecutoraDTO(4, new IncisoDTO(3, 'Poder Judicial'), 4, 'Suprema Corte de Justicia')
  ];

  unidadesCompra: UnidadCompraDTO[] = [];
  unidadesCompraMock: UnidadCompraDTO[] = [
    new UnidadCompraDTO(1, this.unidadesEjecutorasMock[0], 'Dirección de Compras'),
    new UnidadCompraDTO(2, this.unidadesEjecutorasMock[1], 'Unidad de Compras Médicas'),
    new UnidadCompraDTO(3, this.unidadesEjecutorasMock[2], 'Departamento de Adquisiciones'),
    new UnidadCompraDTO(4, this.unidadesEjecutorasMock[3], 'Oficina de Compras')
  ];

  tiposCompra: TipoCompraDTO[] = [
    new TipoCompraDTO('1', 'Licitación Pública'),
    new TipoCompraDTO('2', 'Contratación Directa'),
    new TipoCompraDTO('3', 'Licitación Abreviada')
  ];

  estados = [
    { valor: EstadoProcesoPliego.PENDIENTE, nombre: 'Pendiente' },
    { valor: EstadoProcesoPliego.ASIGNADO, nombre: 'Asignado' },
    { valor: EstadoProcesoPliego.EN_PROCESO, nombre: 'En proceso' },
    { valor: EstadoProcesoPliego.PENDIENTE_VALIDACION, nombre: 'Pendiente validación' },
    { valor: EstadoProcesoPliego.PENDIENTE_APROBACION, nombre: 'Pendiente aprobación' },
    { valor: EstadoProcesoPliego.APROBADO, nombre: 'Aprobado' },
    { valor: EstadoProcesoPliego.CANCELADO, nombre: 'Cancelado' }
  ];

  constructor() {
    super();
    this.form = this.fb.nonNullable.group({
      incisoId: [null],
      unidadEjecutoraId: [null],
      unidadCompraId: [null],
      numeroCompra: [null],
      anioCompra: [null],
      tipoCompraId: [null],
      estado: [null],
      soloPublicadosVigentes: [false]
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.configurarCambiosFiltros();
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.buscar();
    }, 100);
  }

  configurarCambiosFiltros(): void {
    this.form.get('incisoId')?.valueChanges.subscribe(incisoId => {
      this.unidadesEjecutoras = incisoId
        ? this.unidadesEjecutorasMock.filter(ue => (ue.inciso as any)?.id === incisoId)
        : [];
      this.form.patchValue({
        unidadEjecutoraId: null,
        unidadCompraId: null
      });
      this.unidadesCompra = [];
    });

    this.form.get('unidadEjecutoraId')?.valueChanges.subscribe(unidadEjecutoraId => {
      this.unidadesCompra = unidadEjecutoraId
        ? this.unidadesCompraMock.filter(uc => uc.idUnidadEjecutora === unidadEjecutoraId)
        : [];
      this.form.patchValue({ unidadCompraId: null });
    });
  }

  buscar(): void {
    this.cargando = true;
    const v = this.form.value;
    const filtro = new FiltroBandejaEntrada(
      v.incisoId || undefined,
      v.unidadEjecutoraId || undefined,
      v.unidadCompraId || undefined,
      v.numeroCompra || undefined,
      v.anioCompra || undefined,
      v.tipoCompraId || undefined,
      v.estado || undefined,
      v.soloPublicadosVigentes || false
    );

    this.bandejaEntradaService.buscarProcesos(
      filtro,
      this.parametros.pagina,
      this.parametros.tamanoPagina,
      this.parametros.sort,
      this.parametros.order
    ).subscribe({
      next: (page: PageModel<ProcesoPliego>) => {
        this.procesos = page.content || [];
        this.total = page.totalElements || 0;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
        this.procesos = [];
        this.total = 0;
      }
    });
  }

  actualizarFiltrosYBuscar(): void {
    this.parametros.pagina = 0;
    this.buscar();
  }

  override nuevaConsulta(): void {
    this.form.reset({
      soloPublicadosVigentes: false
    });
    this.parametros = {
      filtro: new FiltroBandejaEntrada(),
      pagina: 0,
      tamanoPagina: 10,
      sort: this.columnaOrdenInicial,
      order: this.ordenInicial
    };
    this.procesos = [];
    this.total = -1;
  }

  obtenerAccionesProceso(proceso: ProcesoPliego): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    switch (proceso.estado) {
      case EstadoProcesoPliego.PENDIENTE:
        acciones.push({
          nombre: 'Asignar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-user-plus',
          ariaLabel: 'Asignar proceso ' + proceso.numeroCompra,
          accion: () => this.asignarProceso(proceso)
        });
        break;

      case EstadoProcesoPliego.ASIGNADO:
        acciones.push({
          nombre: 'Iniciar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-play',
          ariaLabel: 'Iniciar proceso ' + proceso.numeroCompra,
          accion: () => this.iniciarProceso(proceso)
        });
        acciones.push({
          nombre: 'Cancelar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-times',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoProcesoPliego.EN_PROCESO:
        acciones.push({
          nombre: 'Elaborar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-edit',
          ariaLabel: 'Elaborar proceso ' + proceso.numeroCompra,
          accion: () => this.elaborarProceso(proceso)
        });
        acciones.push({
          nombre: 'Cancelar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-times',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoProcesoPliego.PENDIENTE_VALIDACION:
        acciones.push({
          nombre: 'Validar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-check-circle',
          ariaLabel: 'Validar proceso ' + proceso.numeroCompra,
          accion: () => this.validarProceso(proceso)
        });
        acciones.push({
          nombre: 'Cancelar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-times',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoProcesoPliego.PENDIENTE_APROBACION:
        acciones.push({
          nombre: 'Aprobar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-thumbs-up',
          ariaLabel: 'Aprobar proceso ' + proceso.numeroCompra,
          accion: () => this.aprobarProceso(proceso)
        });
        acciones.push({
          nombre: 'Cancelar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-times',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoProcesoPliego.APROBADO:
        acciones.push({
          nombre: 'Cancelar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-times',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoProcesoPliego.PUBLICADO:
        if (proceso.vigente) {
          acciones.push({
            nombre: 'Modificar',
            clase: 'btn btn-success btn-ancho-fijo',
            icono: 'fa fa-edit',
            ariaLabel: 'Modificar pliego publicado ' + proceso.numeroCompra,
            accion: () => this.modificarPliegoPublicado(proceso)
          });
          acciones.push({
            nombre: 'Cancelar',
            clase: 'btn btn-success btn-ancho-fijo',
            icono: 'fa fa-times',
            ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
            accion: () => this.cancelarProceso(proceso)
          });
        }
        break;
    }

    acciones.push({
      nombre: 'Ver ítems',
      clase: 'btn btn-success btn-ancho-fijo',
      icono: 'fa fa-list',
      ariaLabel: 'Ver ítems del proceso ' + proceso.numeroCompra,
      accion: () => this.verItems(proceso)
    });

    return acciones;
  }

  asignarProceso(proceso: ProcesoPliego): void {
    console.log('Asignar proceso:', proceso);
  }

  iniciarProceso(proceso: ProcesoPliego): void {
    console.log('Iniciar proceso:', proceso);
  }

  elaborarProceso(proceso: ProcesoPliego): void {
    console.log('Elaborar proceso:', proceso);
  }

  validarProceso(proceso: ProcesoPliego): void {
    console.log('Validar proceso:', proceso);
  }

  aprobarProceso(proceso: ProcesoPliego): void {
    console.log('Aprobar proceso:', proceso);
  }

  cancelarProceso(proceso: ProcesoPliego): void {
    const initialState = {
      proceso: proceso
    };

    const modalRef = this.modalService.show(CancelarPliegoPopupComponent, {
      initialState,
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false
    });

    modalRef.onHide?.subscribe(() => {
      // Aquí se puede refrescar la lista si es necesario
      this.buscar();
    });
  }

  modificarPliegoPublicado(proceso: ProcesoPliego): void {
    console.log('Modificar pliego publicado:', proceso);
  }

  verItems(proceso: ProcesoPliego): void {
    console.log('Ver ítems del proceso:', proceso);
  }

  obtenerTextoOrganismo(proceso: ProcesoPliego): string {
    return `${proceso.incisoDescripcion} | ${proceso.unidadEjecutoraDescripcion} | ${proceso.unidadCompraDescripcion}`;
  }

  obtenerTextoTipoCompra(proceso: ProcesoPliego): string {
    return `${proceso.tipoCompraDescripcion} | ${proceso.subtipoCompraDescripcion}`;
  }

  obtenerTextoNumeroCompra(proceso: ProcesoPliego): string {
    return `${proceso.numeroCompra}/${proceso.anioCompra}`;
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

  formatearFechaHora(fecha: Date | undefined): string {
    if (!fecha) return '';
    return this.fechaHoraPipe.transform(fecha) || '';
  }
}
