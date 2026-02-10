import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '../../../../../shared/utils/can-component-deactivate';
import { FormularioBaseComponent } from '../../../../../shared/components/base/formulario-base.component';
import { ModeloService } from '../../../services/modelo.service';
import { Modelo, SeccionModelo, ClausulaModelo } from '../../../models/modelo.model';
import { EstadoClausula } from '../../../enum/estado-clausula.enum';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';
import { IncisoDTO } from 'src/app/shared/models/sice/inciso.model';
import { UnidadEjecutoraDTO } from 'src/app/shared/models/sice/unidad-ejecutora.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { SubtipoCompraDTO } from 'src/app/shared/models/sice/subtipo-compra.model';
import { SiNoValor } from 'src/app/shared/enum/si-no-valor.enum';
import { TipoCompraClausula } from '../../../models/clausula.model';

@Component({
  selector: 'app-agregar-modificar-modelo',
  templateUrl: './agregar-modificar-modelo.component.html',
  styleUrls: ['./agregar-modificar-modelo.component.scss'],
  standalone: false
})
export class AgregarModificarModeloComponent extends FormularioBaseComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly modeloService = inject(ModeloService);

  idModelo!: number;
  modoIngreso = false;
  titulo = 'Agregar modelo';

  override form!: FormGroup<{
    denominacion: FormControl<string>;
    fechaVigenciaDesde: FormControl<string>;
    fechaVigenciaHasta: FormControl<string>;
    incisoId: FormControl<number | null>;
    unidadEjecutoraId: FormControl<number | null>;
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
    { id: SiNoValor.SI, nombre: 'Sí' },
    { id: SiNoValor.NO, nombre: 'No' }
  ];
  
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

  seccionesAgregadas: SeccionModelo[] = [];
  tiposCompraAgregados: TipoCompraClausula[] = [];

  constructor() {
    super();
    this.activatedRoute.params.subscribe(params => {
      this.idModelo = +params['idModelo'];
      this.modoIngreso = !this.idModelo;
    });
  }

  ngOnInit(): void {
    if (!this.modoIngreso) {
      this.titulo = 'Modificar modelo';
    }

    this.inicializarFormularios();

    if (this.modoIngreso) {
      this.verificarSeccionSeleccionada();
    } else {
      this.cargarDatosModelo();
    }
  }

  private verificarSeccionSeleccionada(): void {
    setTimeout(() => {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state;

      if (state && state['seccionSeleccionada']) {
        this.agregarSeccionDesdeSeleccion(state['seccionSeleccionada']);
      } else {
        const historyState = window.history.state;
        if (historyState?.seccionSeleccionada) {
          this.agregarSeccionDesdeSeleccion(historyState.seccionSeleccionada);
          const newState = { ...historyState };
          delete newState.seccionSeleccionada;
          window.history.replaceState(newState, '');
        }
      }
    }, 100);
  }

  private agregarSeccionDesdeSeleccion(seccion: SeccionModelo): void {
    const yaExiste = this.seccionesAgregadas.some(s => s.seccionId === seccion.seccionId);

    if (yaExiste) {
      this.actualizarService.mensajeError('La sección ya está agregada al modelo');
      return;
    }

    seccion.orden = this.seccionesAgregadas.length + 1;
    this.seccionesAgregadas.push(seccion);
    this.marcarFormularioTocado();
    this.actualizarService.mensajeCorrecto('Sección agregada exitosamente');
  }

  private inicializarFormularios(): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.form = this.fb.nonNullable.group({
      denominacion: this.fb.nonNullable.control<string>('', [Validators.required, Validators.maxLength(200)]),
      fechaVigenciaDesde: this.fb.nonNullable.control<string>(this.modoIngreso ? hoy : '', Validators.required),
      fechaVigenciaHasta: this.fb.nonNullable.control<string>(''),
      incisoId: this.fb.control<number | null>(null),
      unidadEjecutoraId: this.fb.control<number | null>(null),
    });

    this.formTipoCompra = this.fb.nonNullable.group({
      tipoCompraId: this.fb.control<string | null>(null),
      subtipoCompraId: this.fb.control<string | null>(null)
    });

    this.formObjetoCompra = this.fb.nonNullable.group({
      familiaId: this.fb.control<number | null>(null),
      subfamiliaId: this.fb.control<number | null>(null),
      claseId: this.fb.control<number | null>(null),
      subclaseId: this.fb.control<number | null>(null),
      articuloId: this.fb.control<number | null>(null)
    });
  }

  private cargarDatosModelo(): void {
    if (this.modoIngreso) {
      return;
    }

    this.modeloService.obtenerModeloPorId(this.idModelo).subscribe({
      next: (modelo: Modelo | undefined) => {
        if (!modelo) {
          this.actualizarService.mensajeError('Modelo no encontrado');
          this.volver();
          return;
        }

        const convertirFecha = (fecha: any): string => {
          if (!fecha) return '';
          if (fecha instanceof Date) return fecha.toISOString().split('T')[0];
          return String(fecha);
        };

        this.form.patchValue({
          denominacion: modelo.denominacion,
          fechaVigenciaDesde: convertirFecha(modelo.fechaVigenciaDesde),
          fechaVigenciaHasta: convertirFecha(modelo.fechaVigenciaHasta)
        });

        this.seccionesAgregadas = [...(modelo.secciones || [])];

        setTimeout(() => {
          this.form.markAsPristine();
        }, 500);

        this.verificarSeccionSeleccionada();
      },
      error: (err) => {
        this.actualizarService.mensajeError('Error al cargar el modelo');
        console.error('Error al cargar modelo:', err);
      }
    });
  }

  agregarSeccion(): void {
    this.router.navigate(['/pliegos/secciones'], {
      queryParams: {
        origen: 'modelo',
        idModelo: this.idModelo || 'nuevo'
      }
    });
  }

  eliminarSeccion(seccion: SeccionModelo): void {
    const index = this.seccionesAgregadas.findIndex(s => s.seccionId === seccion.seccionId);
    if (index > -1) {
      this.seccionesAgregadas.splice(index, 1);
      this.reordenarSecciones();
      this.marcarFormularioTocado();
    }
  }

  moverSeccionArriba(seccion: SeccionModelo): void {
    const index = this.seccionesAgregadas.findIndex(s => s.seccionId === seccion.seccionId);
    if (index > 0) {
      [this.seccionesAgregadas[index - 1], this.seccionesAgregadas[index]] =
        [this.seccionesAgregadas[index], this.seccionesAgregadas[index - 1]];
      this.reordenarSecciones();
      this.marcarFormularioTocado();
    }
  }

  moverSeccionAbajo(seccion: SeccionModelo): void {
    const index = this.seccionesAgregadas.findIndex(s => s.seccionId === seccion.seccionId);
    if (index < this.seccionesAgregadas.length - 1) {
      [this.seccionesAgregadas[index], this.seccionesAgregadas[index + 1]] =
        [this.seccionesAgregadas[index + 1], this.seccionesAgregadas[index]];
      this.reordenarSecciones();
      this.marcarFormularioTocado();
    }
  }

  private reordenarSecciones(): void {
    this.seccionesAgregadas.forEach((seccion, index) => {
      seccion.orden = index + 1;
    });
  }

  obtenerAccionesSeccion(seccion: SeccionModelo): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    const index = this.seccionesAgregadas.findIndex(s => s.seccionId === seccion.seccionId);

    if (index > 0) {
      acciones.push({
        nombre: 'Subir',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-up',
        ariaLabel: 'Subir sección ' + seccion.denominacion,
        accion: () => this.moverSeccionArriba(seccion)
      });
    }

    if (index < this.seccionesAgregadas.length - 1) {
      acciones.push({
        nombre: 'Bajar',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-down',
        ariaLabel: 'Bajar sección ' + seccion.denominacion,
        accion: () => this.moverSeccionAbajo(seccion)
      });
    }

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn btn-sm',
      icono: 'fa fa-trash',
      ariaLabel: 'Eliminar sección ' + seccion.denominacion,
      accion: () => this.eliminarSeccion(seccion)
    });

    return acciones;
  }

  agregarTipoCompra(): void {
    const tipoCompraId = this.formTipoCompra.value.tipoCompraId;
    const subtipoCompraId = this.formTipoCompra.value.subtipoCompraId;

    if (!tipoCompraId) {
      this.actualizarService.mensajeError('Debe seleccionar un tipo de compra');
      return;
    }

    const tipoCompra = this.tiposCompra.find(tc => tc.id === tipoCompraId);
    if (!tipoCompra) {
      return;
    }

    const yaExiste = this.tiposCompraAgregados.some(tc =>
      tc.tipoCompraId === tipoCompraId &&
      (subtipoCompraId ? tc.subtipos.some(st => st.subtipoCompraId === subtipoCompraId) : !subtipoCompraId)
    );

    if (yaExiste) {
      this.actualizarService.mensajeError('Este tipo y subtipo de compra ya fue agregado');
      return;
    }

    if (!tipoCompra.descTipoCompra) {
      this.actualizarService.mensajeError('Error al obtener la descripción del tipo de compra');
      return;
    }

    let tipoCompraExistente = this.tiposCompraAgregados.find(tc => tc.tipoCompraId === tipoCompraId);

    if (!tipoCompraExistente) {
      tipoCompraExistente = {
        tipoCompraId: tipoCompraId,
        tipoCompraDescripcion: tipoCompra.descTipoCompra,
        subtipos: []
      };
      this.tiposCompraAgregados.push(tipoCompraExistente);
    }

    if (subtipoCompraId && tipoCompraExistente) {
      const subtipo = this.subtiposCompra.find(st => st.idSubtipoCompra === subtipoCompraId);
      if (subtipo && subtipo.descSubtipoCompra) {
        tipoCompraExistente.subtipos.push({
          subtipoCompraId: subtipoCompraId,
          subtipoCompraDescripcion: subtipo.descSubtipoCompra
        });
      }
    }

    this.formTipoCompra.reset();
    this.marcarFormularioTocado();
  }

  eliminarTipoCompra(tipoCompra: TipoCompraClausula, subtipo?: any): void {
    if (subtipo) {
      const index = tipoCompra.subtipos.findIndex(st => st.subtipoCompraId === subtipo.subtipoCompraId);
      if (index > -1) {
        tipoCompra.subtipos.splice(index, 1);
      }

      if (tipoCompra.subtipos.length === 0) {
        const indexTipo = this.tiposCompraAgregados.findIndex(tc => tc.tipoCompraId === tipoCompra.tipoCompraId);
        if (indexTipo > -1) {
          this.tiposCompraAgregados.splice(indexTipo, 1);
        }
      }
    } else {
      const index = this.tiposCompraAgregados.findIndex(tc => tc.tipoCompraId === tipoCompra.tipoCompraId);
      if (index > -1) {
        this.tiposCompraAgregados.splice(index, 1);
      }
    }
    this.marcarFormularioTocado();
  }
  
  private marcarFormularioTocado(): void {
    this.form.markAsDirty();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.form.errors?.['fechasInvalidas']) {
      this.actualizarService.mensajeError('La fecha vigencia desde debe ser anterior a la fecha vigencia hasta');
      return;
    }

    const valores = this.form.value;

    const modelo: Partial<Modelo> = {
      id: this.modoIngreso ? null : this.idModelo,
      denominacion: valores.denominacion!,
      fechaVigenciaDesde: valores.fechaVigenciaDesde || null,
      fechaVigenciaHasta: valores.fechaVigenciaHasta || null,
      secciones: this.seccionesAgregadas,
      tiposCompra: [],
      organismos: [],
      estado: EstadoClausula.BORRADOR,
      versionada: false,
      version: this.modoIngreso ? 1 : undefined,
      fechaCreacion: null,
      usuarioCreacion: null,
      fechaModificacion: null,
      usuarioModificacion: null
    };

    const operacion = this.modoIngreso
      ? this.modeloService.crearModelo(modelo as Modelo)
      : this.modeloService.actualizarModelo(this.idModelo, modelo as Modelo);

    operacion.subscribe({
      next: () => {
        this.actualizarService.mensajeCorrecto(
          this.modoIngreso ? 'Modelo creado exitosamente' : 'Modelo actualizado exitosamente'
        );
        this.form.markAsPristine();
        this.volver();
      },
      error: (err) => {
        if (err?.error?.mensaje?.includes('denominación')) {
          this.actualizarService.mensajeError('Ya existe un modelo con esta denominación');
        } else {
          this.actualizarService.mensajeError('Error al guardar el modelo');
        }
        console.error('Error al guardar:', err);
      }
    });
  }

  aprobar(): void {
    this.actualizarService.confirmar(
      '¿Está seguro que desea aprobar esta versión del modelo?',
      () => {
        this.modeloService.aprobarModelo(this.idModelo).subscribe({
          next: () => {
            this.actualizarService.mensajeCorrecto('Modelo aprobado exitosamente');
            this.form.markAsPristine();
            this.volver();
          },
          error: (err) => {
            this.actualizarService.mensajeError('Error al aprobar el modelo');
            console.error('Error al aprobar:', err);
          }
        });
      }
    );
  }

  volver(): void {
    this.router.navigate(['/pliegos/modelos'], { queryParams: { volver: 1 } });
  }

  canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
