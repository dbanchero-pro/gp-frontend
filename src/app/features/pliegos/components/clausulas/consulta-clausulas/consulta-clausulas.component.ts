import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Clausula } from '../../../models/clausula.model';
import { FiltroClausula } from '../../../models/filtro-clausula.model';
import { ClausulaService } from '../../../services/clausula.service';
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
import { PaginaBusquedaComponent } from '../../../../../shared/components/pagina-busqueda/pagina-busqueda.component';
import { SnapshotGenericService } from '../../../../../shared/services/common/snapshot-generic.service';

@Component({
  selector: 'app-consulta-clausulas',
  templateUrl: './consulta-clausulas.component.html',
  styleUrls: ['./consulta-clausulas.component.scss'],
  standalone: false
})
export class ConsultaClausulasComponent extends PaginaBusquedaComponent<FiltroClausula> implements OnInit, AfterViewInit {
  private readonly fb = inject(FormBuilder);
  private readonly clausulaService = inject(ClausulaService);
  private readonly location = inject(Location);
  private readonly fechaPipe = inject(FechaPipe);
  private readonly route = inject(ActivatedRoute);
  private readonly snapshotGenericService = inject(SnapshotGenericService);

  public static readonly SNAPSHOT_KEY = 'CONSULTA_CLAUSULAS';

  columnaOrdenInicial = 'denominacion';
  ordenInicial: 'asc' | 'desc' = 'asc';

  listaOrden: IColumnaOrden[] = [
    { id: 'denominacion', nombre: 'Denominación' },
    { id: 'estado', nombre: 'Estado' },
    { id: 'fechaVigenciaDesde', nombre: 'Fecha vigencia desde' },
    { id: 'fechaVigenciaHasta', nombre: 'Fecha vigencia hasta' }
  ];

  formularioFiltro: FormGroup;
  clausulas: Clausula[] = [];
  cargando = false;
  mostrarSoloSeleccion = false;

  // Datos mock para filtros
  incisos: IncisoDTO[] = [
    new IncisoDTO(1, 'Poder Ejecutivo'),
    new IncisoDTO(2, 'Poder Legislativo'),
    new IncisoDTO(3, 'Poder Judicial')
  ];

  unidadesEjecutoras: UnidadEjecutoraDTO[] = [];
  unidadesEjecutorasMock: UnidadEjecutoraDTO[] = [
    new UnidadEjecutoraDTO(1, new IncisoDTO(1, 'Poder Ejecutivo'), 1, 'Ministerio de Economía'),
    new UnidadEjecutoraDTO(2, new IncisoDTO(2, 'Poder Legislativo'), 2, 'Cámara de Diputados'),
    new UnidadEjecutoraDTO(3, new IncisoDTO(1, 'Poder Ejecutivo'), 3, 'Ministerio de Salud')
  ];

  tiposCompra: TipoCompraDTO[] = [
    new TipoCompraDTO('1', 'Licitación Pública'),
    new TipoCompraDTO('2', 'Contratación Directa'),
    new TipoCompraDTO('3', 'Licitación Abreviada')
  ];

  subtiposCompra: SubtipoCompraDTO[] = [];
  subtiposCompraMock: SubtipoCompraDTO[] = [
    new SubtipoCompraDTO('1', '1', 'Nacional', 'Licitación Pública'),
    new SubtipoCompraDTO('1', '2', 'Internacional', 'Licitación Pública'),
    new SubtipoCompraDTO('2', '3', 'Por excepción', 'Contratación Directa')
  ];

  familias: FamiliaDTO[] = [
    new FamiliaDTO(1, 'FAM001', 'Equipos de computación'),
    new FamiliaDTO(2, 'FAM002', 'Mobiliario'),
    new FamiliaDTO(3, 'FAM003', 'Servicios')
  ];

  subfamilias: SubfamiliaDTO[] = [];
  subfamiliasMock: SubfamiliaDTO[] = [
    new SubfamiliaDTO(1, 'SUB001', 'Computadoras', '1'),
    new SubfamiliaDTO(2, 'SUB002', 'Muebles de oficina', '2'),
    new SubfamiliaDTO(3, 'SUB003', 'Servicios profesionales', '3')
  ];

  clases: ClaseDTO[] = [];
  clasesMock: ClaseDTO[] = [
    new ClaseDTO(1, 1, 'Notebooks', 1, 1),
    new ClaseDTO(2, 2, 'Escritorios', 2, 2),
    new ClaseDTO(3, 3, 'Consultoría', 3, 3)
  ];

  subclases: SubclaseDTO[] = [];
  subclasesMock: SubclaseDTO[] = [
    new SubclaseDTO(1, 'SCLA001', 'Portátiles', '1', '1', '1'),
    new SubclaseDTO(2, 'SCLA002', 'Ejecutivos', '2', '2', '2'),
    new SubclaseDTO(3, 'SCLA003', 'Asesoría técnica', '3', '3', '3')
  ];

  articulos: ArticuloServObraDTO[] = [];
  articulosMock: ArticuloServObraDTO[] = [
    new ArticuloServObraDTO(1, 'Notebook HP'),
    new ArticuloServObraDTO(2, 'Notebook Dell'),
    new ArticuloServObraDTO(3, 'Escritorio ejecutivo')
  ];

  clausulaSeleccionadaMap: Map<number, boolean> = new Map();

  constructor() {
    super();
    this.form = this.fb.nonNullable.group({
      incisoId: this.fb.nonNullable.control<NumeroNulo>(null),
      unidadEjecutoraId: this.fb.nonNullable.control<NumeroNulo>(null),
      tipoCompraId: this.fb.nonNullable.control<string | null>(null),
      subtipoCompraId: this.fb.nonNullable.control<string | null>(null),
      familiaId: this.fb.nonNullable.control<NumeroNulo>(null),
      subfamiliaId: this.fb.nonNullable.control<NumeroNulo>(null),
      claseId: this.fb.nonNullable.control<NumeroNulo>(null),
      subclaseId: this.fb.nonNullable.control<NumeroNulo>(null),
      articuloId: this.fb.nonNullable.control<NumeroNulo>(null),
      denominacion: this.fb.nonNullable.control<string>(''),
      rangoFechasVigencia: this.fb.nonNullable.control<any>(null)
    });
    this.formularioFiltro = this.form;
  }

  override ngOnInit(): void {
    super.ngOnInit();
    this.configurarCambiosFiltros();
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
      this.parametros = snap;
      this.form.patchValue(snap.filtro);
      this.parametros.pagina = snap.pagina;
      this.parametros.tamanoPagina = snap.tamanoPagina;
      this.actualizarFiltro();
      this.buscar();
    }

    const currentUrl = this.location.path().split('?')[0];
    this.location.replaceState(currentUrl);
  }

  configurarCambiosFiltros(): void {
    this.formularioFiltro.get('incisoId')?.valueChanges.subscribe(incisoId => {
      this.unidadesEjecutoras = incisoId
        ? this.unidadesEjecutorasMock.filter(ue => (ue.inciso as any)?.id === incisoId)
        : [];
      this.formularioFiltro.patchValue({ unidadEjecutoraId: null });
    });

    this.formularioFiltro.get('tipoCompraId')?.valueChanges.subscribe(tipoCompraId => {
      this.subtiposCompra = tipoCompraId
        ? this.subtiposCompraMock.filter(st => st.idTipoCompra === tipoCompraId)
        : [];
      this.formularioFiltro.patchValue({ subtipoCompraId: null });
    });

    this.formularioFiltro.get('familiaId')?.valueChanges.subscribe(familiaId => {
      this.subfamilias = familiaId
        ? this.subfamiliasMock.filter(sf => sf.familiaId === String(familiaId))
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
        ? this.clasesMock.filter(c => c.subfamiliaId === subfamiliaId)
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
        ? this.subclasesMock.filter(sc => sc.claseId === String(claseId))
        : [];
      this.formularioFiltro.patchValue({
        subclaseId: null,
        articuloId: null
      });
      this.articulos = [];
    });

    this.formularioFiltro.get('subclaseId')?.valueChanges.subscribe(subclaseId => {
      this.articulos = subclaseId
        ? this.articulosMock.filter(art => art.subclase?.id === subclaseId)
        : [];
      this.formularioFiltro.patchValue({ articuloId: null });
    });
  }

  buscar(resetearPagina: boolean = false): void {
    if (resetearPagina) {
      this.parametros.pagina = 0;
    }

    this.actualizarFiltro();

    this.cargando = true;
    this.clausulaService.buscarClausulas(this.parametros.filtro).subscribe({
      next: (clausulas) => {
        this.clausulas = clausulas;
        this.total = clausulas.length;
        this.cargando = false;

        this.snapshotGenericService.save(
          ConsultaClausulasComponent.SNAPSHOT_KEY,
          {
            filtro: this.parametros.filtro,
            pagina: this.parametros.pagina,
            tamanoPagina: this.parametros.tamanoPagina,
            sort: this.parametros.sort,
            order: this.parametros.order
          }
        );
      },
      error: () => {
        this.actualizarService.mensajeError('Error al consultar cláusulas');
        this.clausulas = [];
        this.total = 0;
        this.cargando = false;
      }
    });
  }

  private actualizarFiltro(): void {
    const valores = this.form.value;
    const rangoFechas = valores.rangoFechasVigencia;

    this.parametros.filtro = {
      ...valores,
      fechaVigenciaDesde: rangoFechas?.fechaDesde || null,
      fechaVigenciaHasta: rangoFechas?.fechaHasta || null,
      rangoFechasVigencia: undefined
    };
  }

  actualizarFiltrosYBuscar(): void {
    this.actualizarFiltro();
    this.buscar();
  }

  override nuevaConsulta(): void {
    this.form.reset({
      incisoId: null,
      unidadEjecutoraId: null,
      tipoCompraId: null,
      subtipoCompraId: null,
      familiaId: null,
      subfamiliaId: null,
      claseId: null,
      subclaseId: null,
      articuloId: null,
      denominacion: '',
      rangoFechasVigencia: null
    });

    this.parametros = {
      filtro: {},
      pagina: 0,
      tamanoPagina: 10,
      sort: this.columnaOrdenInicial,
      order: this.ordenInicial
    };

    this.clausulas = [];
    this.total = -1;
    this.unidadesEjecutoras = [];
    this.subtiposCompra = [];
    this.subfamilias = [];
    this.clases = [];
    this.subclases = [];
    this.articulos = [];

    this.snapshotGenericService.clear(
      ConsultaClausulasComponent.SNAPSHOT_KEY
    );
  }

  obtenerAccionesClausula(clausula: Clausula): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    acciones.push({
      nombre: 'Modificar',
      clase: 'btn btn-success',
      icono: 'fa fa-edit',
      ariaLabel: 'Modificar cláusula ' + clausula.denominacion,
      accion: () => this.modificarClausula(clausula)
    });

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn btn-success',
      icono: 'fa fa-trash',
      ariaLabel: 'Eliminar cláusula ' + clausula.denominacion,
      accion: () => this.eliminarClausula(clausula)
    });

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
      icono: 'fa fa-copy',
      ariaLabel: 'Ver modelos que usan la cláusula ' + clausula.denominacion,
      accion: () => this.verHistorial(clausula)
    });

    return acciones;
  }

  volver(): void {
    this.location.back();
  }

  agregarClausula(): void {
    console.log('Agregar nueva cláusula');
  }

  modificarClausula(clausula: Clausula): void {
    console.log('Modificar cláusula:', clausula);
  }

  eliminarClausula(clausula: Clausula): void {
    if (!clausula.id) {
      return;
    }

    const clausulaId = clausula.id;

    // Verificar si tiene versión editable
    this.clausulaService.verificarTieneVersionEditable(clausulaId).subscribe({
      next: (tieneVersionEditable) => {
        const mensaje = tieneVersionEditable
          ? `¿Está seguro que desea volver a la versión anteriormente aprobada de la cláusula "${clausula.denominacion}"?`
          : `¿Está seguro que desea eliminar la cláusula "${clausula.denominacion}"?`;

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
          }
        );
      }
    });
  }

  verHistorial(clausula: Clausula): void {
    console.log('Ver historial de cláusula:', clausula);
  }

  seleccionarClausula(clausula: Clausula): void {
    console.log('Cláusula seleccionada:', clausula);
  }

  obtenerResumenTiposCompra(clausula: Clausula): string {
    return clausula.tiposCompra
      .map(tc => {
        const subtipos = tc.subtipos.map(st => st.subtipoCompraDescripcion).join(', ');
        return `${tc.tipoCompraDescripcion} | ${subtipos}`;
      })
      .join(' • ');
  }

  obtenerResumenObjetosCompra(clausula: Clausula): string {
    return clausula.objetosCompra
      .map(oc => {
        const partes = [oc.familiaDescripcion];
        if (oc.subfamiliaDescripcion) partes.push(oc.subfamiliaDescripcion);
        if (oc.claseDescripcion) partes.push(oc.claseDescripcion);
        if (oc.subclaseDescripcion) partes.push(oc.subclaseDescripcion);

        let resultado = partes.join(' | ');

        if (oc.articulo) {
          resultado += ` | ${oc.articulo.articuloDescripcion} (${oc.articulo.articuloCodigo})`;
        }

        return resultado;
      })
      .join(' • ');
  }

  obtenerResumenIncisos(clausula: Clausula): string {
    return clausula.incisos
      .map(i => {
        const inciso = `${i.incisoCodigo} - ${i.incisoDescripcion}`;
        if (i.unidadEjecutora) {
          return `${inciso} | ${i.unidadEjecutora.unidadEjecutoraCodigo} - ${i.unidadEjecutora.unidadEjecutoraDescripcion}`;
        }
        return inciso;
      })
      .join(' • ');
  }

  obtenerTextoVigencia(clausula: Clausula): string {
    const desde = clausula.fechaVigenciaDesde
      ? this.fechaPipe.transform(clausula.fechaVigenciaDesde)
      : 'N/A';
    const hasta = clausula.fechaVigenciaHasta
      ? this.fechaPipe.transform(clausula.fechaVigenciaHasta)
      : 'Indefinido';
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

}
