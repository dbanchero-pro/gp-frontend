import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IncisoDTO } from '../../../../../shared/models/sice/inciso.model';
import { UnidadEjecutoraDTO } from '../../../../../shared/models/sice/unidad-ejecutora.model';
import { TipoCompraDTO } from '../../../../../shared/models/sice/tipo-compra.model';
import { SubtipoCompraDTO } from '../../../../../shared/models/sice/subtipo-compra.model';
import { FamiliaDTO } from '../../../../../shared/models/cbso/familia.model';
import { SubfamiliaDTO } from '../../../../../shared/models/cbso/subfamilia.model';
import { ClaseDTO } from '../../../../../shared/models/cbso/clase.model';
import { SubclaseDTO } from '../../../../../shared/models/cbso/subclase.model';
import { ArticuloServObraDTO } from '../../../../../shared/models/cbso/articulo-serv-obra.model';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';
import { IColumnaOrden } from '../../../../../shared/models/common/columna-orden.model';
import { NumeroNulo } from '../../../../../shared/types/numero-nulo.type';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { SnapshotGenericService } from '../../../../../shared/services/common/snapshot-generic.service';
import { ClausulaDTO } from 'src/app/shared/models/pliego/clausula/clausula.model';
import { RedaccionDTO } from '../../../../../shared/models/pliego/clausula/redaccion.model';
import { CapituloClausulaDTO } from 'src/app/shared/models/pliego/capitulo/capitulo-clausula.model';
import { FiltroClausula } from '../../../models/filtros/filtro-clausula.model';
import { ClausulaService } from '../../../services/clausula.service';

@Component({
  selector: 'app-consulta-clausulas',
  templateUrl: './consulta-clausulas.component.html',
  styleUrls: ['./consulta-clausulas.component.scss'],

    standalone: false
})
export class ConsultaClausulasComponent implements OnInit, AfterViewInit {
  private fb = inject(FormBuilder);
  private clausulaService = inject(ClausulaService);
  private location = inject(Location);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fechaPipe = inject(FechaPipe);
  private actualizarService = inject(ActualizarService);
  private snapshotGenericService = inject(SnapshotGenericService);

  formularioFiltro: FormGroup;
  clausulas: ClausulaDTO[] = [];
  cargando = false;
  mostrarSoloSeleccion = false;
  origenNavegacion: string | null = null;
  idCapituloOrigen: string | null = null;

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
    { id: 'estado', nombre: 'Estado' }
  ];
  incisos: IncisoDTO[] = [];

  unidadesEjecutoras: UnidadEjecutoraDTO[] = [];
  unidadesEjecutorasBase: UnidadEjecutoraDTO[] = [];

  tiposCompra: TipoCompraDTO[] = [];

  subtiposCompra: SubtipoCompraDTO[] = [];
  subtiposCompraBase: SubtipoCompraDTO[] = [];

  familias: FamiliaDTO[] = [];

  subfamilias: SubfamiliaDTO[] = [];
  subfamiliasBase: SubfamiliaDTO[] = [];

  clases: ClaseDTO[] = [];
  clasesBase: ClaseDTO[] = [];

  subclases: SubclaseDTO[] = [];
  subclasesBase: SubclaseDTO[] = [];

  articulos: ArticuloServObraDTO[] = [];
  articulosBase: ArticuloServObraDTO[] = [];

  clausulaSeleccionadaMap: Map<number, boolean> = new Map();

  public static readonly SNAPSHOT_KEY = 'CONSULTA_CLAUSULAS';

  constructor() {
    this.formularioFiltro = this.fb.nonNullable.group({
      incisoId: [null],
      unidadEjecutoraId: [null],
      tipoCompraId: [null],
      subtipoCompraId: [null],
      familiaId: [null],
      subfamiliaId: [null],
      claseId: [null],
      subclaseId: [null],
      articuloId: [null],
      denominacion: [''],
      rangoFechasVigencia: [null]
    });
  }

  ngOnInit(): void {
    this.origenNavegacion = this.route.snapshot.queryParamMap.get('origen');
    this.idCapituloOrigen = this.route.snapshot.queryParamMap.get('idCapitulo');

    if (this.origenNavegacion === 'capitulo') {
      this.mostrarSoloSeleccion = true;
    }

    this.cargarCatalogosFiltros();
    this.configurarCambiosFiltros();
  }

  
  private cargarCatalogosFiltros(): void {
    this.clausulaService.obtenerFiltrosClausula().subscribe({
      next: (filtros) => {
        this.incisos = filtros.incisos;
        this.unidadesEjecutorasBase = filtros.unidadesEjecutoras;
        this.tiposCompra = filtros.tiposCompra;
        this.subtiposCompraBase = filtros.subtiposCompra;
        this.familias = filtros.familias;
        this.subfamiliasBase = filtros.subfamilias;
        this.clasesBase = filtros.clases;
        this.subclasesBase = filtros.subclases;
        this.articulosBase = filtros.articulos;
      },
      error: () => {
        this.incisos = [];
        this.unidadesEjecutorasBase = [];
        this.tiposCompra = [];
        this.subtiposCompraBase = [];
        this.familias = [];
        this.subfamiliasBase = [];
        this.clasesBase = [];
        this.subclasesBase = [];
        this.articulosBase = [];
      }
    });
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
      }, 100);
    }
  }

  private buscarVolver(): void {
    const snap = this.snapshotGenericService.load<any>(ConsultaClausulasComponent.SNAPSHOT_KEY);

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

  configurarCambiosFiltros(): void {
    this.formularioFiltro.get('incisoId')?.valueChanges.subscribe(incisoId => {
      this.unidadesEjecutoras = incisoId
        ? this.unidadesEjecutorasBase.filter(ue => (ue.inciso as any)?.id === incisoId)
        : [];
      this.formularioFiltro.patchValue({ unidadEjecutoraId: null });
    });

    this.formularioFiltro.get('tipoCompraId')?.valueChanges.subscribe(tipoCompraId => {
      this.subtiposCompra = tipoCompraId
        ? this.subtiposCompraBase.filter(st => st.idTipoCompra === tipoCompraId)
        : [];
      this.formularioFiltro.patchValue({ subtipoCompraId: null });
    });

    this.formularioFiltro.get('familiaId')?.valueChanges.subscribe(familiaId => {
      this.subfamilias = familiaId
        ? this.subfamiliasBase.filter(sf => sf.familiaId === String(familiaId))
        : [];
      this.formularioFiltro.patchValue({
        subfamiliaId: null,
        claseId: null,
        subclaseId: null,
        articuloId: null
      });
      this.clases = [];
      this.subclases = [];
      this.articulos = [];
    });

    this.formularioFiltro.get('subfamiliaId')?.valueChanges.subscribe(subfamiliaId => {
      this.clases = subfamiliaId
        ? this.clasesBase.filter(c => c.subfamiliaId === subfamiliaId)
        : [];
      this.formularioFiltro.patchValue({
        claseId: null,
        subclaseId: null,
        articuloId: null
      });
      this.subclases = [];
      this.articulos = [];
    });

    this.formularioFiltro.get('claseId')?.valueChanges.subscribe(claseId => {
      this.subclases = claseId
        ? this.subclasesBase.filter(sc => sc.claseId === String(claseId))
        : [];
      this.formularioFiltro.patchValue({
        subclaseId: null,
        articuloId: null
      });
      this.articulos = [];
    });

    this.formularioFiltro.get('subclaseId')?.valueChanges.subscribe(subclaseId => {
      this.articulos = subclaseId
        ? this.articulosBase.filter(art => art.subclase?.id === subclaseId)
        : [];
      this.formularioFiltro.patchValue({ articuloId: null });
    });
  }

  buscar(): void {
    this.cargando = true;
    const valores = this.formularioFiltro.value;
    const rangoFechas = valores.rangoFechasVigencia;

    const filtro: FiltroClausula = {
      ...valores,
      fechaVigenciaDesde: rangoFechas?.fechaDesde || null,
      fechaVigenciaHasta: rangoFechas?.fechaHasta || null,
      rangoFechasVigencia: undefined
    };

    this.snapshotGenericService.save(
      ConsultaClausulasComponent.SNAPSHOT_KEY,
      {
        filtro: valores,
        pagina: this.parametros.pagina,
        tamanoPagina: this.parametros.tamanoPagina,
        sort: this.parametros.sort,
        order: this.parametros.order
      }
    );

    this.clausulaService.buscarClausulas(filtro).subscribe({
      next: (clausulas) => {
        this.clausulas = clausulas;
        this.total = clausulas.length;
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
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
    this.clausulas = [];
    this.total = -1;

    this.snapshotGenericService.clear(
      ConsultaClausulasComponent.SNAPSHOT_KEY
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


  obtenerAccionesClausula(clausula: ClausulaDTO): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    if (this.mostrarSoloSeleccion) {
      return acciones;
    }

    acciones.push({
      nombre: 'Modificar',
      clase: 'btn btn-success btn-ancho-fijo',
      icono: 'fa fa-edit',
      ariaLabel: 'Modificar cláusula ' + clausula.denominacion,
      accion: () => this.modificarClausula(clausula)
    });

    acciones.push({
      nombre: 'Ver diferencias',
      clase: 'btn btn-success',
      icono: 'fa fa-exchange',
      ariaLabel: 'Ver diferencias con versión anterior ' + clausula.denominacion,
      accion: () => this.verDiferencias(clausula)
    });

    if (this.esBorrador(clausula)) {
      acciones.push({
        nombre: 'Eliminar borrador',
        clase: 'btn btn-success',
        icono: 'fa fa-trash',
        ariaLabel: 'Eliminar cláusula ' + clausula.denominacion,
        accion: () => this.eliminarClausula(clausula)
      });
     }

    acciones.push({
      nombre: 'Ver historial',
      clase: 'btn btn-success',
      icono: 'fa fa-history',
      ariaLabel: 'Ver historial de cláusula ' + clausula.denominacion,
      accion: () => this.verHistorial(clausula)
    });

    acciones.push({
      nombre: 'Ver modelos',
      clase: 'btn btn-success',
      icono: 'fa fa-list',
      ariaLabel: 'Ver modelos que usan la cláusula ' + clausula.denominacion,
      accion: () => this.verModelos(clausula)
    });

    return acciones;
  }


   obtenerAccionesRedaccion(redaccion: RedaccionDTO): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    acciones.push({
      nombre: 'Ver',
      clase: 'btn btn-sm',
      icono: 'fa fa-eye',
      ariaLabel: `Ver redacción prioridad ${redaccion.prioridad}`,
      //accion: () => this.eliminarClausula(clausula)
    });

    return acciones;
  }

  volver(): void {
    if (this.origenNavegacion === 'capitulo') {
      if (this.idCapituloOrigen && this.idCapituloOrigen !== 'nuevo') {
        this.router.navigate(['/administracion/capitulos/modificar', this.idCapituloOrigen]);
      } else {
        this.router.navigate(['/administracion/capitulos/agregar']);
      }
    } else {
      this.location.back();
    }
  }

  agregarClausula(): void {
    this.router.navigate(['/administracion/clausulas/agregar']);
  }

  modificarClausula(clausula: ClausulaDTO): void {
    if (!clausula.id) {
      return;
    }
    this.router.navigate(['/administracion/clausulas/modificar', clausula.id]);
  }

  eliminarClausula(clausula: ClausulaDTO): void {
    if (!clausula.id) {
      return;
    }

    const clausulaId = clausula.id;
    const mensaje =  `¿Está seguro que desea eliminar el borrador de la cláusula "${clausula.denominacion}"?`

    this.actualizarService.confirmar(
      mensaje,
      () => {
        this.clausulaService.eliminarClausula(clausulaId).subscribe({
          next: (response) => {
            if (response.exitoso) {
              this.actualizarService.mensajeCorrecto(response.mensaje);
              this.buscar();
            } else {
              this.actualizarService.mensajeError(response.mensaje);
            }
          },
          error: () => {
            this.actualizarService.mensajeError('Ocurrió un error al eliminar la cláusula.');
          }
        });
      });
    }

  verHistorial(clausula: ClausulaDTO): void {
    if (!clausula.id) {
      return;
    }
    this.router.navigate(['/administracion/clausulas/historial', clausula.id]);
  }

  verDiferencias(clausula: ClausulaDTO): void {
    if (!clausula.id) {
      return;
    }
    this.router.navigate(['/administracion/clausulas/diferencias', clausula.id]);
  }

  verModelos(clausula: ClausulaDTO): void {
    if (!clausula.id) {
      return;
    }
    this.router.navigate(['/administracion/clausulas/modelos', clausula.id]);
  }

  seleccionarClausula(clausula: ClausulaDTO): void {
    if (this.origenNavegacion === 'capitulo') {
      const clausulaParaCapitulo: CapituloClausulaDTO = {
        Id: 0,
        orden: 0,
        clausula: clausula
      };

      if (this.idCapituloOrigen && this.idCapituloOrigen !== 'nuevo') {
        this.router.navigate(['/administracion/capitulos/modificar', this.idCapituloOrigen], {
          state: { clausulaSeleccionada: clausulaParaCapitulo }
        });
      } else {
        this.router.navigate(['/administracion/capitulos/agregar'], {
          state: { clausulaSeleccionada: clausulaParaCapitulo }
        });
      }
    } else {
      console.log('Cláusula seleccionada:', clausula);
    }
  }

  obtenerResumenTiposCompra(clausula: ClausulaDTO): string {
    return clausula.tiposCompra
      .map(tc => {
        const tipo = tc.tipoCompra?.descTipoCompra || '';
        const subtipo = tc.subtipoCompra?.descSubtipoCompra || 'Todos los subtipos';
        if (!tipo) {
          return '';
        }
        return `${tipo} | ${subtipo}`;
      })
      .filter(Boolean)
      .join(' • ');
  }

  obtenerResumenObjetosCompra(clausula: ClausulaDTO): string {
    return clausula.objetosCompra
      .map(oc => {
        const partes: string[] = [];
        if (oc.familia?.descFamilia) partes.push(oc.familia.descFamilia);
        if (oc.subfamilia?.descSubfamilia) partes.push(oc.subfamilia.descSubfamilia);
        if (oc.clase?.descClase) partes.push(oc.clase.descClase);
        if (oc.subclase?.descSubclase) partes.push(oc.subclase.descSubclase);

        let resultado = partes.join(' | ');

        if (oc.articulo?.descArticuloServObra) {
          resultado += ` | ${oc.articulo.descArticuloServObra}`;
        }

        return resultado;
      })
      .filter(texto => texto.length > 0)
      .join(' • ');
  }

  obtenerResumenIncisos(clausula: ClausulaDTO): string {
    if (!clausula.organismo?.inciso?.descInciso) {
      return '';
    }

    const inciso = clausula.organismo.inciso.descInciso;
    const unidad = clausula.organismo.unidadEjecutora?.descUnidadEjecutora;

    return unidad ? `${inciso} | ${unidad}` : inciso;
  }

  obtenerTextoVigencia(clausula: ClausulaDTO): string {
    const desde = clausula.fechaVigenciaDesde
      ? this.fechaPipe.transform(clausula.fechaVigenciaDesde)
      : '';
    const hasta = clausula.fechaVigenciaHasta
      ? this.fechaPipe.transform(clausula.fechaVigenciaHasta)
      : '';
    return `${desde} - ${hasta}`;
  }

  truncarRedaccion(html: string): string {
    if (!html) return '';

    const textoPlano = this.extraerTextoDeHTML(html);
    const longitudMaxima = 300;

    if (textoPlano.length <= longitudMaxima) {
      return html;
    }

    return this.truncarHTMLPorTexto(html, longitudMaxima);
  }

  esRedaccionTruncada(html: string): boolean {
    if (!html) return false;
    const textoPlano = this.extraerTextoDeHTML(html);
    return textoPlano.length > 300;
  }

  private extraerTextoDeHTML(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  private truncarHTMLPorTexto(html: string, longitudMaxima: number): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    let textoAcumulado = 0;
    let resultadoHTML = '';

    const procesarNodo = (nodo: Node): boolean => {
      if (textoAcumulado >= longitudMaxima) {
        return false;
      }

      if (nodo.nodeType === Node.TEXT_NODE) {
        const textoNodo = nodo.textContent || '';
        const espacioRestante = longitudMaxima - textoAcumulado;

        if (textoNodo.length <= espacioRestante) {
          resultadoHTML += textoNodo;
          textoAcumulado += textoNodo.length;
          return true;
        } else {
          resultadoHTML += textoNodo.substring(0, espacioRestante) + '...';
          textoAcumulado = longitudMaxima;
          return false;
        }
      } else if (nodo.nodeType === Node.ELEMENT_NODE) {
        const elemento = nodo as Element;
        const etiqueta = elemento.tagName.toLowerCase();

        const atributos = Array.from(elemento.attributes)
          .map(attr => `${attr.name}="${attr.value}"`)
          .join(' ');

        resultadoHTML += `<${etiqueta}${atributos ? ' ' + atributos : ''}>`;

        for (let i = 0; i < nodo.childNodes.length; i++) {
          if (!procesarNodo(nodo.childNodes[i])) {
            break;
          }
        }

        resultadoHTML += `</${etiqueta}>`;
        return textoAcumulado < longitudMaxima;
      }

      return true;
    };

    for (let i = 0; i < doc.body.childNodes.length; i++) {
      if (!procesarNodo(doc.body.childNodes[i])) {
        break;
      }
    }

    return resultadoHTML;
  }

  obtenerEstadoVigencia(clausula: ClausulaDTO): string {
      if (clausula.estado === 'BORRADOR') {
        const hoy = new Date();
        const desde = clausula.fechaVigenciaDesde ? new Date(clausula.fechaVigenciaDesde) : null;
        const hasta = clausula.fechaVigenciaHasta ? new Date(clausula.fechaVigenciaHasta) : null;
  
        if (desde && hoy < desde) {
          return 'NO_VIGENTE';
        }
        if (hasta && hoy > hasta) {
          return 'NO_VIGENTE';
        }
        return 'VIGENTE';
      }
      return clausula.estado;
    }

  esBorrador(clausula: ClausulaDTO): boolean {
     return clausula.estado === 'BORRADOR';
   }

  obtenerTextoEstadoVigencia(clausula: ClausulaDTO): string {
      const estado = this.obtenerEstadoVigencia(clausula);
      if (estado === 'VIGENTE') {
        return 'Vigente';
      }
      return 'No vigente';
    }

}










