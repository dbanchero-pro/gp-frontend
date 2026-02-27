import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularioBaseComponent } from 'src/app/shared/components/base/formulario-base.component';
import { SiNoValor } from 'src/app/shared/enum/si-no-valor.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { ModeloDTO } from 'src/app/shared/models/pliego/modelo/modelo.model';
import { ModeloSeccionDTO } from 'src/app/shared/models/pliego/modelo/modelo-seccion.model';
import { TipoCompraClausulaModeloDTO } from 'src/app/shared/models/pliego/comun/tipo-compra-clausula-modelo.model';
import { SeccionDTO } from 'src/app/shared/models/pliego/seccion/seccion.model';
import { IncisoDTO } from 'src/app/shared/models/sice/inciso.model';
import { SubtipoCompraDTO } from 'src/app/shared/models/sice/subtipo-compra.model';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { UnidadEjecutoraDTO } from 'src/app/shared/models/sice/unidad-ejecutora.model';
import { CanComponentDeactivate } from 'src/app/shared/utils/can-component-deactivate';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { ModeloService } from '../../../services/modelo.service';

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

  seccionesAgregadas: ModeloSeccionDTO[] = [];
  tiposCompraAgregados: TipoCompraClausulaModeloDTO[] = [];

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

  private agregarSeccionDesdeSeleccion(seccion: ModeloSeccionDTO | SeccionDTO): void {
    const seccionNormalizada = this.normalizarSeccionSeleccionada(seccion);
    const seccionId = seccionNormalizada.seccion?.id;
    const yaExiste = this.seccionesAgregadas.some(s => s.seccion?.id === seccionId);

    if (yaExiste) {
      this.actualizarService.mensajeError('La sección ya está agregada al modelo');
      return;
    }

    seccionNormalizada.orden = this.seccionesAgregadas.length + 1;
    this.seccionesAgregadas.push(seccionNormalizada);
    this.marcarFormularioTocado();
    this.actualizarService.mensajeCorrecto('Sección agregada exitosamente');
  }

  private normalizarSeccionSeleccionada(seccion: ModeloSeccionDTO | SeccionDTO): ModeloSeccionDTO {
    if ('seccion' in seccion) {
      return seccion;
    }

    return {
      id: null,
      seccion: seccion,
      orden: 0
    };
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
      next: (modelo: ModeloDTO | undefined) => {
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
    this.router.navigate(['/administracion/secciones'], {
      queryParams: {
        origen: 'modelo',
        idModelo: this.idModelo || 'nuevo'
      }
    });
  }

  eliminarSeccion(seccion: ModeloSeccionDTO): void {
    const index = this.seccionesAgregadas.findIndex(s => s.seccion?.id === seccion.seccion?.id);
    if (index > -1) {
      this.seccionesAgregadas.splice(index, 1);
      this.reordenarSecciones();
      this.marcarFormularioTocado();
    }
  }

  moverSeccionArriba(seccion: ModeloSeccionDTO): void {
    const index = this.seccionesAgregadas.findIndex(s => s.seccion?.id === seccion.seccion?.id);
    if (index > 0) {
      [this.seccionesAgregadas[index - 1], this.seccionesAgregadas[index]] =
        [this.seccionesAgregadas[index], this.seccionesAgregadas[index - 1]];
      this.reordenarSecciones();
      this.marcarFormularioTocado();
    }
  }

  moverSeccionAbajo(seccion: ModeloSeccionDTO): void {
    const index = this.seccionesAgregadas.findIndex(s => s.seccion?.id === seccion.seccion?.id);
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

  obtenerAccionesSeccion(seccion: ModeloSeccionDTO): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    const index = this.seccionesAgregadas.findIndex(s => s.seccion?.id === seccion.seccion?.id);

    if (index > 0) {
      acciones.push({
        nombre: 'Subir',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-up',
        ariaLabel: 'Subir sección ' + seccion.seccion?.denominacion || '',
        accion: () => this.moverSeccionArriba(seccion)
      });
    }

    if (index < this.seccionesAgregadas.length - 1) {
      acciones.push({
        nombre: 'Bajar',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-down',
        ariaLabel: 'Bajar sección ' + seccion.seccion?.denominacion || '',
        accion: () => this.moverSeccionAbajo(seccion)
      });
    }

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn btn-sm',
      icono: 'fa fa-trash',
      ariaLabel: 'Eliminar sección ' + seccion.seccion?.denominacion || '',
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

    const inciso = this.incisos.find(i => i.id === valores.incisoId) || null;
    const unidadEjecutora = valores.unidadEjecutoraId
      ? this.unidadesEjecutorasMock.find(ue => ue.id === valores.unidadEjecutoraId) || null
      : null;

    const organismo = inciso
      ? {
          inciso: inciso,
          unidadEjecutora: unidadEjecutora || undefined
        }
      : undefined;

    const modelo: Partial<ModeloDTO> = {
      id: this.modoIngreso ? null : this.idModelo,
      denominacion: valores.denominacion!,
      fechaVigenciaDesde: valores.fechaVigenciaDesde || null,
      fechaVigenciaHasta: valores.fechaVigenciaHasta || null,
      secciones: this.seccionesAgregadas,
      tiposCompra: this.tiposCompraAgregados,
      organismo: organismo,
      estado: EstadoElemento.BORRADOR,
      version: this.modoIngreso ? 1 : undefined,
      fechaCreacion: null,
      usuarioCreacion: null,
      fechaModificacion: null,
      usuarioModificacion: null
    };

    const operacion = this.modoIngreso
      ? this.modeloService.crearModelo(modelo as ModeloDTO)
      : this.modeloService.actualizarModelo(this.idModelo, modelo as ModeloDTO);

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
    this.router.navigate(['/administracion/modelos'], { queryParams: { volver: 1 } });
  }

  canDeactivate(): boolean {
    return !this.form.dirty;
  }
}







