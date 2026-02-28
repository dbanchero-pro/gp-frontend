import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '../../../../../shared/utils/can-component-deactivate';
import { FormularioBaseComponent } from '../../../../../shared/components/base/formulario-base.component';
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
import { SiNoValor } from '../../../../../shared/enum/si-no-valor.enum';
import { SnapshotGenericService } from '../../../../../shared/services/common/snapshot-generic.service';
import { SiNoAmbasValor } from 'src/app/shared/enum/si-no-ambas-valor.enum';
import { ClausulaDTO } from 'src/app/shared/models/pliego/clausula/clausula.model';
import { ObjetoCompraDTO } from 'src/app/shared/models/pliego/clausula/objeto-compra.model';
import { TipoCompraClausulaModeloDTO } from 'src/app/shared/models/pliego/comun/tipo-compra-clausula-modelo.model';
import { RedaccionDTO } from '../../../../../shared/models/pliego/clausula/redaccion.model';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { ClausulaService } from '../../../services/clausula.service';import { SharedModule } from 'src/app/shared/shared.module';


@Component({
  selector: 'app-agregar-modificar-clausula',
  templateUrl: './agregar-modificar-clausula.component.html',
  styleUrls: ['./agregar-modificar-clausula.component.scss'],
  standalone: true,
  imports: [
    SharedModule,
  ],
})
export class AgregarModificarClausulaComponent extends FormularioBaseComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly clausulaService = inject(ClausulaService);
  private readonly snapshotService = inject(SnapshotGenericService);

  idClausula!: number;
  modoIngreso = false;
  titulo = 'Agregar cláusula';

  override form!: FormGroup<{
    denominacion: FormControl<string>;
    fechaVigenciaDesde: FormControl<string>;
    fechaVigenciaHasta: FormControl<string>;
    incisoId: FormControl<number | null>;
    unidadEjecutoraId: FormControl<number | null>;
    esObligatoria: FormControl<string>;
    aperturaElectronica: FormControl<string>;
  }>;

  formTipoCompra!: FormGroup<{
    tipoCompraId: FormControl<string | null>;
    subtipoCompraId: FormControl<string | null>;
  }>;

  formObjetoCompra!: FormGroup<{
    familiaId: FormControl<number | null>;
    subfamiliaId: FormControl<number | null>;
    claseId: FormControl<number | null>;
    subclaseId: FormControl<number | null>;
    articuloId: FormControl<number | null>;
  }>;

  opcionesSiNo: { id: string; nombre: string }[] = [
    { id: SiNoAmbasValor.SI, nombre: 'Sí' },
    { id: SiNoAmbasValor.NO, nombre: 'No' },
    { id: SiNoAmbasValor.A, nombre: 'Ambas' }
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

  tiposCompraAgregados: TipoCompraClausulaModeloDTO[] = [];
  objetosCompraAgregados: ObjetoCompraDTO[] = [];
  redacciones: RedaccionDTO[] = [];

  siguienteIdRedaccion = 1;

  constructor() {
    super();
    this.activatedRoute.params.subscribe(params => {
      this.idClausula = +params['idClausula'];
      this.modoIngreso = !this.idClausula;
    });
  }

  ngOnInit(): void {
    if (!this.modoIngreso) {
      this.titulo = 'Modificar cláusula';
    }

    this.inicializarFormularios();
    this.cargarCatalogosFiltros();
    this.configurarCambiosFiltros();
    this.cargarDatosClausula();
    this.restaurarDatosTemporales();
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
  private restaurarDatosTemporales(): void {
    const datos = this.snapshotService.load<any>('clausula_temporal');
    if (datos && datos.redacciones) {
      this.redacciones = datos.redacciones;
      const maxId = Math.max(0, ...this.redacciones.map(r => r.id || 0));
      this.siguienteIdRedaccion = maxId + 1;
    }
  }

  private inicializarFormularios(): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.form = this.fb.nonNullable.group({
      denominacion: this.fb.nonNullable.control<string>('', [Validators.required, Validators.maxLength(200)]),
      fechaVigenciaDesde: this.fb.nonNullable.control<string>(this.modoIngreso ? hoy : '', Validators.required),
      fechaVigenciaHasta: this.fb.nonNullable.control<string>(''),
      incisoId: this.fb.control<number | null>(null),
      unidadEjecutoraId: this.fb.control<number | null>(null),
      esObligatoria: this.fb.nonNullable.control<string>(SiNoValor.SI, Validators.required),
      aperturaElectronica: this.fb.nonNullable.control<string>(SiNoAmbasValor.NO, Validators.required)
    });

    this.formTipoCompra = this.fb.nonNullable.group({
      tipoCompraId: this.fb.control<string | null>(null,[Validators.required]),
      subtipoCompraId: this.fb.control<string | null>(null)
    });

    this.formObjetoCompra = this.fb.nonNullable.group({
      familiaId: this.fb.control<number | null>(null,[Validators.required]),
      subfamiliaId: this.fb.control<number | null>(null),
      claseId: this.fb.control<number | null>(null),
      subclaseId: this.fb.control<number | null>(null),
      articuloId: this.fb.control<number | null>(null)
    });
  }

  private configurarCambiosFiltros(): void {
    this.form.get('incisoId')?.valueChanges.subscribe(incisoId => {
      this.unidadesEjecutoras = incisoId
        ? this.unidadesEjecutorasBase.filter(ue => (ue.inciso as any)?.id === incisoId)
        : [];
      this.form.patchValue({ unidadEjecutoraId: null });
    });

    this.formTipoCompra.get('tipoCompraId')?.valueChanges.subscribe(tipoCompraId => {
      this.subtiposCompra = tipoCompraId
        ? this.subtiposCompraBase.filter(st => st.idTipoCompra === tipoCompraId)
        : [];
      this.formTipoCompra.patchValue({ subtipoCompraId: null });
    });

    this.formObjetoCompra.get('familiaId')?.valueChanges.subscribe(familiaId => {
      this.subfamilias = familiaId
        ? this.subfamiliasBase.filter(sf => sf.familiaId === String(familiaId))
        : [];
      this.formObjetoCompra.patchValue({
        subfamiliaId: null,
        claseId: null,
        subclaseId: null,
        articuloId: null
      });
      this.clases = [];
      this.subclases = [];
      this.articulos = [];
    });

    this.formObjetoCompra.get('subfamiliaId')?.valueChanges.subscribe(subfamiliaId => {
      this.clases = subfamiliaId
        ? this.clasesBase.filter(c => c.subfamiliaId === subfamiliaId)
        : [];
      this.formObjetoCompra.patchValue({
        claseId: null,
        subclaseId: null,
        articuloId: null
      });
      this.subclases = [];
      this.articulos = [];
    });

    this.formObjetoCompra.get('claseId')?.valueChanges.subscribe(claseId => {
      this.subclases = claseId
        ? this.subclasesBase.filter(sc => sc.claseId === String(claseId))
        : [];
      this.formObjetoCompra.patchValue({
        subclaseId: null,
        articuloId: null
      });
      this.articulos = [];
    });

    this.formObjetoCompra.get('subclaseId')?.valueChanges.subscribe(subclaseId => {
      this.articulos = subclaseId
        ? this.articulosBase.filter(art => art.subclase?.id === subclaseId)
        : [];
      this.formObjetoCompra.patchValue({ articuloId: null });
    });
  }

  private cargarDatosClausula(): void {
    if (this.modoIngreso) {
      return;
    }

    this.clausulaService.obtenerClausulaPorId(this.idClausula).subscribe({
      next: (clausula: ClausulaDTO | undefined) => {
        if (!clausula) {
          this.actualizarService.mensajeError('Cláusula no encontrada');
          this.volver();
          return;
        }

        const convertirFecha = (fecha: any): string => {
          if (!fecha) return '';
          if (fecha instanceof Date) return fecha.toISOString().split('T')[0];
          return String(fecha);
        };

        this.form.patchValue({
          denominacion: clausula.denominacion,
          fechaVigenciaDesde: convertirFecha(clausula.fechaVigenciaDesde),
          fechaVigenciaHasta: convertirFecha(clausula.fechaVigenciaHasta),
          incisoId: null,
          unidadEjecutoraId: null,
          esObligatoria: clausula.obligatoria ? SiNoValor.SI : SiNoValor.NO,
          aperturaElectronica: clausula.aperturaElectronica ? SiNoValor.SI : SiNoValor.NO
        });

        this.tiposCompraAgregados = clausula.tiposCompra || [];
        this.objetosCompraAgregados = clausula.objetosCompra || [];
        this.redacciones = clausula.redacciones || [];

        if (this.redacciones.length > 0) {
          const maxId = Math.max(0, ...this.redacciones.map(r => r.id || 0));
          this.siguienteIdRedaccion = maxId + 1;
        }

        setTimeout(() => {
          this.form.markAsPristine();
          this.formTipoCompra.markAsPristine();
          this.formObjetoCompra.markAsPristine();
        }, 500);
      },
      error: (err) => {
        this.actualizarService.mensajeError('Error al cargar la cláusula');
        console.error('Error al cargar cláusula:', err);
      }
    });
  }

  agregarTipoCompra(): void {
    const tipoCompraId = this.formTipoCompra.value.tipoCompraId;
    const subtipoCompraId = this.formTipoCompra.value.subtipoCompraId;

    if (!tipoCompraId) {
      this.formTipoCompra.markAllAsTouched();
      return;
    }

    const tipoCompra = this.tiposCompra.find(tc => tc.id === tipoCompraId);
    if (!tipoCompra) {
      return;
    }

    const subtipoCompra = subtipoCompraId
      ? this.subtiposCompra.find(st => st.idSubtipoCompra === subtipoCompraId)
      : undefined;

    const yaExiste = this.tiposCompraAgregados.some(tc =>
      tc.tipoCompra?.id === tipoCompraId &&
      (subtipoCompraId
        ? tc.subtipoCompra?.idSubtipoCompra === subtipoCompraId
        : !tc.subtipoCompra)
    );

    if (yaExiste) {
      this.actualizarService.mensajeError('Este tipo y subtipo de compra ya fue agregado');
      return;
    }

    this.tiposCompraAgregados.push({
      tipoCompra: tipoCompra,
      subtipoCompra: subtipoCompra
    });

    this.formTipoCompra.reset();
    this.marcarFormularioTocado();
  }

  eliminarTipoCompra(tipoCompra: TipoCompraClausulaModeloDTO): void {
    const index = this.tiposCompraAgregados.findIndex(tc =>
      tc.tipoCompra?.id === tipoCompra.tipoCompra?.id &&
      tc.subtipoCompra?.idSubtipoCompra === tipoCompra.subtipoCompra?.idSubtipoCompra
    );
    if (index > -1) {
      this.tiposCompraAgregados.splice(index, 1);
    }
    this.marcarFormularioTocado();
  }

  agregarObjetoCompra(): void {
    const valores = this.formObjetoCompra.value;

    if (!valores.familiaId) {
      this.formObjetoCompra.markAllAsTouched();
      return;
    }

    const familia = this.familias.find(f => f.id === valores.familiaId);
    const subfamilia = valores.subfamiliaId ? this.subfamilias.find(sf => sf.id === valores.subfamiliaId) : undefined;
    const clase = valores.claseId ? this.clases.find(c => c.id === valores.claseId) : undefined;
    const subclase = valores.subclaseId ? this.subclases.find(sc => sc.id === valores.subclaseId) : undefined;
    const articulo = valores.articuloId ? this.articulos.find(a => a.id === valores.articuloId) : undefined;

    if (!familia) {
      this.actualizarService.mensajeError('Debe seleccionar una familia válida');
      return;
    }

    const yaExiste = this.objetosCompraAgregados.some(oc =>
      oc.familia?.id === valores.familiaId &&
      oc.subfamilia?.id === valores.subfamiliaId &&
      oc.clase?.id === valores.claseId &&
      oc.subclase?.id === valores.subclaseId &&
      oc.articulo?.id === valores.articuloId
    );

    if (yaExiste) {
      this.actualizarService.mensajeError('Este objeto de compra ya fue agregado');
      return;
    }

    this.objetosCompraAgregados.push({
      familia: familia,
      subfamilia: subfamilia,
      clase: clase,
      subclase: subclase,
      articulo: articulo
    });

    this.formObjetoCompra.reset();
    this.marcarFormularioTocado();
  }

  eliminarObjetoCompra(objeto: ObjetoCompraDTO): void {
    const index = this.objetosCompraAgregados.findIndex(oc =>
      oc.familia?.id === objeto.familia?.id &&
      oc.subfamilia?.id === objeto.subfamilia?.id &&
      oc.clase?.id === objeto.clase?.id &&
      oc.subclase?.id === objeto.subclase?.id &&
      oc.articulo?.id === objeto.articulo?.id
    );

    if (index > -1) {
      this.objetosCompraAgregados.splice(index, 1);
      this.marcarFormularioTocado();
    }
  }

  abrirAgregarRedaccion(): void {
    this.guardarDatosTemporales();

    const ruta = this.modoIngreso
      ? ['/administracion/clausulas/agregar/redaccion/agregar']
      : ['/administracion/clausulas/modificar', this.idClausula, 'redaccion', 'agregar'];

    this.router.navigate(ruta);
  }

  abrirModificarRedaccion(redaccion: RedaccionDTO): void {
    this.guardarDatosTemporales();

    const ruta = this.modoIngreso
      ? ['/administracion/clausulas/agregar/redaccion/modificar', redaccion.id]
      : ['/administracion/clausulas/modificar', this.idClausula, 'redaccion', 'modificar', redaccion.id];

    this.router.navigate(ruta);
  }

  private guardarDatosTemporales(): void {
    const datos = {
      clausulaInfo: this.obtenerInfoClausulaParaRedaccion(),
      redacciones: this.redacciones
    };

    this.snapshotService.save('clausula_temporal', datos);
  }

  eliminarRedaccion(redaccion: RedaccionDTO): void {
      const index = this.redacciones.findIndex(r => r.id === redaccion.id);
      if (index > -1) {
        this.redacciones.splice(index, 1);
        this.marcarFormularioTocado();
      }
  }

  obtenerAccionesRedaccion(redaccion: RedaccionDTO): AccionBoton[] {
    return [
      {
        nombre: 'Modificar',
        clase: 'btn btn-success',
        icono: 'fa fa-edit',
        ariaLabel: `Modificar redacción con prioridad ${redaccion.prioridad}`,
        accion: () => this.abrirModificarRedaccion(redaccion)
      },
      {
        nombre: 'Eliminar',
        clase: 'btn btn-danger',
        icono: 'fa fa-trash',
        ariaLabel: `Eliminar redacción con prioridad ${redaccion.prioridad}`,
        accion: () => this.eliminarRedaccion(redaccion)
      }
    ];
  }

  private obtenerInfoClausulaParaRedaccion(): any {
    const valores = this.form.value;
    return {
      denominacion: valores.denominacion,
      aperturaElectronica: valores.aperturaElectronica === SiNoValor.SI,
      tiposCompra: this.tiposCompraAgregados,
      objetosCompra: this.objetosCompraAgregados,
      fechaVigenciaDesde: valores.fechaVigenciaDesde,
      fechaVigenciaHasta: valores.fechaVigenciaHasta
    };
  }

  truncarRedaccion(html: string): string {
    if (!html) return '';
    const textoPlano = this.extraerTextoDeHTML(html);
    const longitudMaxima = 500;

    if (textoPlano.length <= longitudMaxima) {
      return html;
    }

    return this.truncarHTMLPorTexto(html, longitudMaxima);
  }

  esRedaccionTruncada(html: string): boolean {
    if (!html) return false;
    const textoPlano = this.extraerTextoDeHTML(html);
    return textoPlano.length > 500;
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

  private marcarFormularioTocado(): void {
    this.form.markAsDirty();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.value;

    const inciso = this.incisos.find(i => i.id === valores.incisoId) || null;
    const unidadEjecutora = valores.unidadEjecutoraId
      ? this.unidadesEjecutorasBase.find(ue => ue.id === valores.unidadEjecutoraId) || null
      : null;

    const organismo = inciso
      ? {
          inciso: inciso,
          unidadEjecutora: unidadEjecutora || undefined
        }
      : undefined;

    const clausula: Partial<ClausulaDTO> = {
      id: this.modoIngreso ? undefined : this.idClausula,
      denominacion: valores.denominacion!,
      fechaVigenciaDesde: valores.fechaVigenciaDesde!,
      fechaVigenciaHasta: valores.fechaVigenciaHasta || null,
      obligatoria: valores.esObligatoria === SiNoValor.SI,
      aperturaElectronica: valores.aperturaElectronica === SiNoValor.SI,
      tiposCompra: this.tiposCompraAgregados,
      objetosCompra: this.objetosCompraAgregados,
      organismo: organismo,
      redacciones: this.redacciones,
      estado: EstadoElemento.BORRADOR,
      version: this.modoIngreso ? 1 : undefined
    };

    const operacion = this.modoIngreso
      ? this.clausulaService.crearClausula(clausula as ClausulaDTO)
      : this.clausulaService.actualizarClausula(this.idClausula, clausula as ClausulaDTO);

    operacion.subscribe({
      next: () => {
        this.actualizarService.mensajeCorrecto(
          this.modoIngreso ? 'Cláusula creada exitosamente' : 'Cláusula actualizada exitosamente'
        );
        this.form.markAsPristine();
        this.volver();
      },
      error: (err) => {
        this.actualizarService.mensajeError('Error al guardar la cláusula');
        console.error('Error al guardar:', err);
      }
    });
  }

  aprobar(): void {
    this.actualizarService.confirmar(
      '¿Está seguro que desea aprobar esta versión de la cláusula?',
      () => {
        this.clausulaService.aprobarClausula(this.idClausula).subscribe({
          next: () => {
            this.actualizarService.mensajeCorrecto('Cláusula aprobada exitosamente');
            this.form.markAsPristine();
            this.volver();
          },
          error: (err) => {
            this.actualizarService.mensajeError('Error al aprobar la cláusula');
            console.error('Error al aprobar:', err);
          }
        });
      }
    );
  }

  volver(): void {
    this.router.navigate(['/administracion/clausulas'], { queryParams: { volver: 1 } });
  }

  canDeactivate(): boolean {
    return !this.form.dirty && !this.formTipoCompra.dirty && !this.formObjetoCompra.dirty;
  }
}





