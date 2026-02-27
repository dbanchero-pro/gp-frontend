import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { ModeloDTO } from 'src/app/shared/models/pliego/modelo/modelo.model';
import { ClausulaDTO } from 'src/app/shared/models/pliego/clausula/clausula.model';
import { FechaPipe } from 'src/app/shared/pipes/fecha.pipe';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SnapshotGenericService } from 'src/app/shared/services/common/snapshot-generic.service';
import { EstadoPliego } from '../../enum/estado-pliego.enum';
import { PliegoDTO } from '../../models/pliego.model';
import { BandejaEntradaService } from '../../services/bandeja-entrada.service';
import { FiltroModelo } from 'src/app/features/administracion/models/filtros/filtro-modelo.model';
import { ModeloService } from 'src/app/features/administracion/services/modelo.service';

interface Inciso {
  id: number;
  codigo: string;
  descripcion: string;
}

interface UnidadEjecutora {
  id: number;
  codigo: string;
  descripcion: string;
  incisoId: number;
}

interface TipoCompra {
  id: number;
  descripcion: string;
  subtipos: SubtipoCompra[];
}

interface SubtipoCompra {
  id: number;
  descripcion: string;
}

@Component({
  selector: 'app-iniciar-pliego',
  templateUrl: './iniciar-pliego.component.html',
  styleUrls: ['./iniciar-pliego.component.scss'],
})
export class IniciarPliegoComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private modeloService = inject(ModeloService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fechaPipe = inject(FechaPipe);
  private actualizarService = inject(ActualizarService);
  private snapshotGenericService = inject(SnapshotGenericService);
  private bandejaEntradaService = inject(BandejaEntradaService);

  formularioFiltro: FormGroup;
  modelos: ModeloDTO[] = [];
  pliegos: PliegoDTO[] = [];
  mostrandoPliegos = false;
  cargando = false;
  pliegoId: number | null = null;
  proceso: PliegoDTO | null = null;

  colFiltro = 'col-lg-3';
  colTabla = 'col-lg-9';

  total = -1;
  parametros = {
    pagina: 0,
    tamanoPagina: 10,
    sort: 'denominacion',
    order: 'asc' as 'asc' | 'desc'
  };

  listaOrden: IColumnaOrden[] = [
    { id: 'denominacion', nombre: 'Denominación' },
    { id: 'Inciso', nombre: 'Inciso' },
  ];

  incisos: Inciso[] = [
    { id: 1, codigo: '02', descripcion: 'Presidencia de la República' },
    { id: 2, codigo: '04', descripcion: 'Ministerio de Economía y Finanzas' },
    { id: 3, codigo: '10', descripcion: 'Ministerio de Obras Públicas' }
  ];

  unidadesEjecutoras: UnidadEjecutora[] = [];
  unidadesEjecutorasCompletas: UnidadEjecutora[] = [
    { id: 1, codigo: '001', descripcion: 'Unidad Central', incisoId: 1 },
    { id: 2, codigo: '005', descripcion: 'Unidad de Proyectos', incisoId: 1 },
    { id: 5, codigo: '002', descripcion: 'Dirección General', incisoId: 2 },
    { id: 10, codigo: '001', descripcion: 'Dirección de Obras', incisoId: 3 }
  ];

  tiposCompra: TipoCompra[] = [];
  subtiposCompra: SubtipoCompra[] = [];

  public static readonly SNAPSHOT_KEY = 'INICIAR_PLIEGO';

  constructor() {
    this.formularioFiltro = this.fb.nonNullable.group({
      tipoBusqueda: ['M'],
      incisoId: [{ value: null, disabled: true }],
      unidadEjecutoraId: [{ value: null, disabled: true }],
      tipoCompraId: [null],
      subtipoCompraId: [null],
      denominacion: [''],
      rangoFechasVigencia: [null]
    });
  }

  ngOnInit(): void {
    this.pliegoId = this.route.snapshot.params['id'] ? Number(this.route.snapshot.params['id']) : null;

    if (this.pliegoId) {
      this.cargarProceso(this.pliegoId);
    }

    this.cargarTiposCompraMock();
    this.configurarCambioTipoBusqueda();
    this.configurarCambioInciso();
    this.configurarCambioTipoCompra();
  }

  ngAfterViewInit(): void {
    const paramVolver = this.route.snapshot.queryParamMap.get('volver');
    if (paramVolver === '1') {
      setTimeout(() => {
        this.buscarVolver();
      }, 100);
    } else {
      setTimeout(() => {
        this.nuevaConsulta();
        this.buscar();
      }, 100);
    }
  }

  private cargarTiposCompraMock(): void {
    this.tiposCompra = [
      { id: 1, descripcion: 'Licitación Pública', subtipos: [
        { id: 1, descripcion: 'Nacional' },
        { id: 2, descripcion: 'Internacional' }
      ]},
      { id: 2, descripcion: 'Contratación Directa', subtipos: [
        { id: 3, descripcion: 'Por monto' }
      ]},
      { id: 3, descripcion: 'Licitación Abreviada', subtipos: [] }
    ];
  }

  private configurarCambioTipoBusqueda(): void {
    this.formularioFiltro.get('tipoBusqueda')?.valueChanges.subscribe(tipoBusqueda => {
      const incisoControl = this.formularioFiltro.get('incisoId');
      const unidadEjecutoraControl = this.formularioFiltro.get('unidadEjecutoraId');

      if (tipoBusqueda === 'PO') {
        incisoControl?.enable({ emitEvent: false });
        unidadEjecutoraControl?.enable({ emitEvent: false });
      } else {
        incisoControl?.disable({ emitEvent: false });
        unidadEjecutoraControl?.disable({ emitEvent: false });
        incisoControl?.setValue(null, { emitEvent: false });
        unidadEjecutoraControl?.setValue(null, { emitEvent: false });
        this.unidadesEjecutoras = [];
      }
    });
  }

  private configurarCambioInciso(): void {
    this.formularioFiltro.get('incisoId')?.valueChanges.subscribe(incisoId => {
      this.formularioFiltro.patchValue({
        unidadEjecutoraId: null
      }, { emitEvent: false });

      if (incisoId) {
        this.unidadesEjecutoras = this.unidadesEjecutorasCompletas.filter(
          ue => ue.incisoId === incisoId
        );
      } else {
        this.unidadesEjecutoras = [];
      }
    });
  }

  private configurarCambioTipoCompra(): void {
    this.formularioFiltro.get('tipoCompraId')?.valueChanges.subscribe(tipoCompraId => {
      this.formularioFiltro.patchValue({
        subtipoCompraId: null
      }, { emitEvent: false });

      if (tipoCompraId) {
        const tipoSeleccionado = this.tiposCompra.find(tc => tc.id === tipoCompraId);
        this.subtiposCompra = tipoSeleccionado?.subtipos || [];
      } else {
        this.subtiposCompra = [];
      }
    });
  }

  private buscarVolver(): void {
    const snap = this.snapshotGenericService.load<any>(IniciarPliegoComponent.SNAPSHOT_KEY);

    if (snap) {
      this.formularioFiltro.patchValue(snap.filtro);
      this.parametros.pagina = snap.pagina;
      this.parametros.tamanoPagina = snap.tamanoPagina;
      this.parametros.sort = snap.sort;
      this.parametros.order = snap.order;
      this.buscar();
    }

    const currentUrl = this.location.path().split('?')[0];
    this.location.replaceState(currentUrl);
  }

  buscar(): void {
    this.cargando = true;
    const valores = this.formularioFiltro.value;
    const tipoBusqueda = valores.tipoBusqueda;

    this.snapshotGenericService.save(
      IniciarPliegoComponent.SNAPSHOT_KEY,
      {
        filtro: valores,
        pagina: this.parametros.pagina,
        tamanoPagina: this.parametros.tamanoPagina,
        sort: this.parametros.sort,
        order: this.parametros.order
      }
    );

    // Determinar si buscar modelos o pliegos
    if (tipoBusqueda === 'P' || tipoBusqueda === 'PO') {
      // Buscar pliegos
      this.mostrandoPliegos = true;
      this.bandejaEntradaService.buscarPliegos(
        tipoBusqueda,
        valores.incisoId || null,
        valores.unidadEjecutoraId || null,
        valores.tipoCompraId || null,
        valores.subtipoCompraId || null,
        valores.denominacion || null
      ).subscribe({
        next: (pliegos) => {
          this.pliegos = this.ordenarYPaginarPliegos(pliegos);
          this.total = pliegos.length;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        }
      });
    } else {
      // Buscar modelos (comportamiento original)
      this.mostrandoPliegos = false;
      const rangoFechas = valores.rangoFechasVigencia;

      const filtro: FiltroModelo = {
        incisoId: valores.incisoId || null,
        unidadEjecutoraId: valores.unidadEjecutoraId || null,
        tipoCompraId: valores.tipoCompraId || null,
        subtipoCompraId: valores.subtipoCompraId || null,
        denominacion: valores.denominacion || undefined,
        fechaVigenciaDesde: rangoFechas?.fechaDesde || null,
        fechaVigenciaHasta: rangoFechas?.fechaHasta || null
      };

      this.modeloService.buscarModelos(filtro).subscribe({
        next: (modelos) => {
          this.modelos = modelos;
          this.total = modelos.length;
          this.cargando = false;
        },
        error: () => {
          this.cargando = false;
        }
      });
    }
  }

  actualizarFiltrosYBuscar(): void {
    this.parametros.pagina = 0;
    this.buscar();
  }

  nuevaConsulta(): void {
    this.formularioFiltro.reset();
    this.parametros.pagina = 0;
    this.parametros.tamanoPagina = 10;
    this.parametros.sort = 'denominacion';
    this.parametros.order = 'asc';
    this.modelos = [];
    this.total = -1;
    this.unidadesEjecutoras = [];
    this.subtiposCompra = [];

    this.snapshotGenericService.clear(
      IniciarPliegoComponent.SNAPSHOT_KEY
    );
  }

  cambioPagina(pagina: number): void {
    this.parametros.pagina = pagina - 1;
    this.buscar();
  }

  cambioPorPagina(tamanoPagina: number): void {
    this.parametros.tamanoPagina = tamanoPagina;
    this.parametros.pagina = 0;
    this.buscar();
  }

  cambioOrden(orden: 'asc' | 'desc'): void {
    this.parametros.order = orden;
    this.buscar();
  }

  cambioColumnaOrden(columna: string): void {
    this.parametros.sort = columna;
    this.buscar();
  }

  obtenerAccionesClausula(clausula: ClausulaDTO | null | undefined): AccionBoton[] {
      const acciones: AccionBoton[] = [];
      if (!clausula) {
        return acciones;
      }

      acciones.push({
        nombre: 'Ver',
        clase: 'btn btn-sm',
        icono: 'fa fa-eye',
        ariaLabel: `Ver redacciones de cláusula ${clausula.denominacion}`,
      });

      return acciones;
  }

  volver(): void {
    this.router.navigate(['/pliegos/bandeja-entrada']);
  }

  seleccionarModelo(modelo: ModeloDTO): void {
    if (!this.pliegoId) {
      this.actualizarService.mensajeError('No se pudo identificar el pliego');
      return;
    }

    const mensaje = `¿Está seguro que desea iniciar el pliego con el modelo "${modelo.denominacion}"?`;

    this.actualizarService.confirmar(
      mensaje,
      () => {
        // Aquí se debe llamar al servicio para asignar el modelo al pliego
        console.log('Asignar modelo', modelo.id, 'al pliego', this.pliegoId);
        this.actualizarService.mensajeCorrecto(`El pliego ha sido iniciado con el modelo "${modelo.denominacion}"`);
        this.volver();
      }
    );
  }

  obtenerTextoVigencia(modelo: ModeloDTO): string {
    const desde = modelo.fechaVigenciaDesde
      ? this.fechaPipe.transform(modelo.fechaVigenciaDesde)
      : ' ';
    const hasta = modelo.fechaVigenciaHasta
      ? this.fechaPipe.transform(modelo.fechaVigenciaHasta)
      : ' ';
    return desde + ' - ' + hasta;
  }

  esBorrador(modelo: ModeloDTO): boolean {
    return modelo.estado === 'BORRADOR';
  }

  esVigente(modelo: ModeloDTO): boolean {
    const hoy = new Date();
    const desde = modelo.fechaVigenciaDesde ? new Date(modelo.fechaVigenciaDesde) : null;
    const hasta = modelo.fechaVigenciaHasta ? new Date(modelo.fechaVigenciaHasta) : null;

    if (modelo.estado === 'BORRADOR') {
      return false;
    }

    if (desde && hoy < desde) {
      return false;
    }
    if (hasta && hoy > hasta) {
      return false;
    }
    return true;
  }

  obtenerEstadoVigencia(modelo: ModeloDTO): string {
    return this.esVigente(modelo) ? 'VIGENTE' : 'NO_VIGENTE';
  }

  obtenerTextoEstadoVigencia(modelo: ModeloDTO): string {
    return this.esVigente(modelo) ? 'Vigente' : 'No vigente';
  }

  truncarTexto(texto: string, limite: number = 500): string {
    if (!texto) return '';
    if (texto.length <= limite) return texto;
    return texto.substring(0, limite) + '...';
  }

  cargarProceso(id: number): void {
    this.bandejaEntradaService.obtenerProceso(id).subscribe({
      next: (proceso: PliegoDTO) => {
        this.proceso = proceso;
      },
      error: () => {
        this.actualizarService.mensajeError('Error al cargar el proceso');
      }
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

  ordenarYPaginarPliegos(pliegos: PliegoDTO[]): PliegoDTO[] {
    // Ordenar
    const pliegosOrdenados = [...pliegos].sort((a, b) => {
      let valorA: any;
      let valorB: any;

      if (this.parametros.sort === 'denominacion') {
        valorA = a.modelo?.denominacion || '';
        valorB = b.modelo?.denominacion || '';
      } else if (this.parametros.sort === 'Inciso') {
        valorA = a.unidadEjecutora?.inciso?.descInciso || '';
        valorB = b.unidadEjecutora?.inciso?.descInciso || '';
      } else {
        return 0;
      }

      const comparacion = valorA.toString().localeCompare(valorB.toString());
      return this.parametros.order === 'asc' ? comparacion : -comparacion;
    });

    // Paginar
    const inicio = this.parametros.pagina * this.parametros.tamanoPagina;
    const fin = inicio + this.parametros.tamanoPagina;
    return pliegosOrdenados.slice(inicio, fin);
  }

  obtenerAccionesPliego(pliego: PliegoDTO): AccionBoton[] {
    return [
      {
        nombre: 'Seleccionar',
        clase: 'btn btn-success',
        icono: 'fa fa-check',
        ariaLabel: `Seleccionar pliego ${pliego.numeroCompra}/${pliego.anioCompra}`,
        accion: () => this.seleccionarPliego(pliego)
      },
      {
        nombre: 'Ver pliego',
        clase: 'btn btn-success',
        icono: 'fa fa-eye',
        ariaLabel: `Ver pliego ${pliego.numeroCompra}/${pliego.anioCompra}`,
        accion: () => this.verPliego(pliego)
      }
    ];
  }

  seleccionarPliego(pliego: PliegoDTO): void {
    if (!this.pliegoId) {
      this.actualizarService.mensajeError('No se pudo identificar el pliego');
      return;
    }

    const mensaje = `¿Está seguro que desea iniciar el pliego con el pliego de la compra N° ${pliego.numeroCompra}/${pliego.anioCompra}?`;

    this.actualizarService.confirmar(
      mensaje,
      () => {
        // Aquí se debe llamar al servicio para asignar el pliego base
        console.log('Asignar pliego base', pliego.id, 'al pliego', this.pliegoId);
        this.actualizarService.mensajeCorrecto(`El pliego ha sido iniciado con el pliego de la compra N° ${pliego.numeroCompra}/${pliego.anioCompra}`);
        this.volver();
      }
    );
  }

  verPliego(pliego: PliegoDTO): void {
    console.log('Ver pliego:', pliego);
    this.actualizarService.mensajeInformacion('Funcionalidad de ver pliego en desarrollo');
    // TODO: Implementar navegación a vista de pliego
  }

  obtenerTextoAperturaElectronica(apertura: string): string {
    const textos: { [key: string]: string } = {
      'SI': 'Sí',
      'NO': 'No',
      'AMBAS': 'Ambas'
    };
    return textos[apertura] || apertura;
  }

  esBorradorPliego(pliego: PliegoDTO): boolean {
    return pliego.modelo?.estado === 'BORRADOR';
  }

  esVigentePliego(pliego: PliegoDTO): boolean {
    const hoy = new Date();
    const desde = pliego.modelo?.fechaVigenciaDesde ? new Date(pliego.modelo.fechaVigenciaDesde) : null;
    const hasta = pliego.modelo?.fechaVigenciaHasta ? new Date(pliego.modelo.fechaVigenciaHasta) : null;

    if (pliego.modelo?.estado === 'BORRADOR') {
      return false;
    }

    if (desde && hoy < desde) {
      return false;
    }
    if (hasta && hoy > hasta) {
      return false;
    }
    return true;
  }

  obtenerEstadoVigenciaPliego(pliego: PliegoDTO): string {
    return this.esVigentePliego(pliego) ? 'VIGENTE' : 'NO_VIGENTE';
  }

  obtenerTextoEstadoVigenciaPliego(pliego: PliegoDTO): string {
    return this.esVigentePliego(pliego) ? 'Vigente' : 'No vigente';
  }

  obtenerTextoOrganismoProceso(): string {
    if (!this.proceso) {
      return '';
    }
    return `${this.proceso.unidadEjecutora?.inciso?.descInciso ?? ''} | ${this.proceso.unidadEjecutora?.descUnidadEjecutora ?? ''}`;
  }

  obtenerTextoTipoCompraProceso(): string {
    if (!this.proceso) {
      return '';
    }
    const tipo = this.proceso.subtipoCompra?.descTipoCompra ?? '';
    const subtipo = this.proceso.subtipoCompra?.descSubtipoCompra ?? '';
    return `${tipo} | ${subtipo} N° ${this.proceso.numeroCompra}/${this.proceso.anioCompra}`;
  }
}


