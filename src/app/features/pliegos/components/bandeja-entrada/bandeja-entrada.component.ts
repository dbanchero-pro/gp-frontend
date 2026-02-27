import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { EstadoPliego } from '../../enum/estado-pliego.enum';
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
import { CancelarPliegoPopupComponent } from '../cancelar-pliego-popup/cancelar-pliego-popup.component';
import { FiltroBandejaEntradaDTO } from '../../models/filtros/filtro-bandeja-entrada.model';
import { PliegoDTO } from '../../models/pliego.model';

@Component({
  selector: 'app-bandeja-entrada',
  templateUrl: './bandeja-entrada.component.html',
  styleUrls: ['./bandeja-entrada.component.scss'],
})
export class BandejaEntradaComponent extends PaginaBusquedaComponent<FiltroBandejaEntradaDTO> implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly bandejaEntradaService = inject(BandejaEntradaService);
  private readonly router = inject(Router);
  private readonly fechaHoraPipe = inject(FechaHoraPipe);

  procesos: PliegoDTO[] = [];
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
    { valor: EstadoPliego.PENDIENTE, nombre: 'Pendiente' },
    { valor: EstadoPliego.ASIGNADO, nombre: 'Asignado' },
    { valor: EstadoPliego.EN_PROCESO, nombre: 'En proceso' },
    { valor: EstadoPliego.PENDIENTE_VALIDACION, nombre: 'Pendiente validación' },
    { valor: EstadoPliego.PENDIENTE_APROBACION, nombre: 'Pendiente aprobación' },
    { valor: EstadoPliego.APROBADO, nombre: 'Aprobado' },
    { valor: EstadoPliego.CANCELADO, nombre: 'Publicado (vigente)' }
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
    const filtro = new FiltroBandejaEntradaDTO(
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
      next: (page: PageModel<PliegoDTO>) => {
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
      filtro: new FiltroBandejaEntradaDTO(),
      pagina: 0,
      tamanoPagina: 10,
      sort: this.columnaOrdenInicial,
      order: this.ordenInicial
    };
    this.procesos = [];
    this.total = -1;
  }

  obtenerAccionesProceso(proceso: PliegoDTO): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    switch (proceso.estado) {
      case EstadoPliego.PENDIENTE:
        acciones.push({
          nombre: 'Asignar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-user-plus',
          ariaLabel: 'Asignar proceso ' + proceso.numeroCompra,
          accion: () => this.asignarProceso(proceso)
        });
        break;

      case EstadoPliego.ASIGNADO:
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
          icono: 'fa fa-ban',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoPliego.EN_PROCESO:
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
          icono: 'fa fa-ban',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoPliego.PENDIENTE_VALIDACION:
        acciones.push({
          nombre: 'Validar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-check',
          ariaLabel: 'Validar proceso ' + proceso.numeroCompra,
          accion: () => this.validarProceso(proceso)
        });
        acciones.push({
          nombre: 'Cancelar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-ban',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoPliego.PENDIENTE_APROBACION:
        acciones.push({
          nombre: 'Aprobar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-check-circle',
          ariaLabel: 'Aprobar proceso ' + proceso.numeroCompra,
          accion: () => this.aprobarProceso(proceso)
        });
        acciones.push({
          nombre: 'Cancelar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-ban',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoPliego.APROBADO:
        acciones.push({
          nombre: 'Cancelar',
          clase: 'btn btn-success btn-ancho-fijo',
          icono: 'fa fa-ban',
          ariaLabel: 'Cancelar proceso ' + proceso.numeroCompra,
          accion: () => this.cancelarProceso(proceso)
        });
        break;

      case EstadoPliego.PUBLICADO:
        if (this.esPublicadoVigente(proceso)) {
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
            icono: 'fa fa-ban',
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

  asignarProceso(proceso: PliegoDTO): void {
    this.router.navigate(['/pliegos/bandeja-entrada/asignar', proceso.id]);
  }

  iniciarProceso(proceso: PliegoDTO): void {
    if (!proceso.id) {
      return;
    }
    this.router.navigate(['/pliegos/bandeja-entrada/iniciar', proceso.id]);
  }

  elaborarProceso(proceso: PliegoDTO): void {
    this.router.navigate(['/pliegos/bandeja-entrada/elaborar', proceso.id]);
  }

  validarProceso(proceso: PliegoDTO): void {
    console.log('Validar proceso:', proceso);
  }

  aprobarProceso(proceso: PliegoDTO): void {
    console.log('Aprobar proceso:', proceso);
  }

  cancelarProceso(proceso: PliegoDTO): void {
     const modalRef = this.abrirPopupGrande(CancelarPliegoPopupComponent, 'Guardar', {
          backdrop: 'static',
          keyboard: false,
          initialState: { proceso: proceso}
        });


    modalRef.onHide?.subscribe(() => {
      // Aquí se puede refrescar la lista si es necesario
      this.buscar();
    });
  }

  modificarPliegoPublicado(proceso: PliegoDTO): void {
    console.log('Modificar pliego publicado:', proceso);
  }

  verItems(proceso: PliegoDTO): void {
    console.log('Ver ítems del proceso:', proceso);
  }

  obtenerTextoOrganismo(proceso: PliegoDTO): string {
    const inciso = proceso.unidadEjecutora?.inciso?.descInciso ?? '';
    const unidadEjecutora = proceso.unidadEjecutora?.descUnidadEjecutora ?? '';
    return `${inciso} | ${unidadEjecutora}`;
  }

  obtenerTextoTipoCompra(proceso: PliegoDTO): string {
    return `${proceso.subtipoCompra?.descTipoCompra ?? ''} | ${proceso.subtipoCompra?.descSubtipoCompra ?? ''}`;
  }

  obtenerTextoNumeroCompra(proceso: PliegoDTO): string {
    return `${proceso.numeroCompra}/${proceso.anioCompra}`;
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

  formatearFechaHora(fecha: Date | null | undefined): string {
    if (!fecha) return '';
    return this.fechaHoraPipe.transform(fecha) || '';
  }

  private esPublicadoVigente(proceso: PliegoDTO): boolean {
    if (proceso.estado !== EstadoPliego.PUBLICADO || !proceso.fechaTopeRecepcionOfertas) {
      return false;
    }
    return new Date(proceso.fechaTopeRecepcionOfertas) >= new Date();
  }
}


