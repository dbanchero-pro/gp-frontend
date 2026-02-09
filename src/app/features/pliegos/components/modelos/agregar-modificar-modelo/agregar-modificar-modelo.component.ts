import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '../../../../../shared/utils/can-component-deactivate';
import { FormularioBaseComponent } from '../../../../../shared/components/base/formulario-base.component';
import { ModeloService } from '../../../services/modelo.service';
import { Modelo, SeccionModelo, ClausulaModelo } from '../../../models/modelo.model';
import { EstadoClausula } from '../../../enum/estado-clausula.enum';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';

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
  }>;

  seccionesAgregadas: SeccionModelo[] = [];
  clausulasAgregadas: ClausulaModelo[] = [];

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

    this.inicializarFormulario();

    if (this.modoIngreso) {
      this.verificarSeccionSeleccionada();
      this.verificarClausulaSeleccionada();
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

  private verificarClausulaSeleccionada(): void {
    setTimeout(() => {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state;

      if (state && state['clausulaSeleccionada']) {
        this.agregarClausulaDesdeSeleccion(state['clausulaSeleccionada']);
      } else {
        const historyState = window.history.state;
        if (historyState?.clausulaSeleccionada) {
          this.agregarClausulaDesdeSeleccion(historyState.clausulaSeleccionada);
          const newState = { ...historyState };
          delete newState.clausulaSeleccionada;
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

  private agregarClausulaDesdeSeleccion(clausula: ClausulaModelo): void {
    const yaExiste = this.clausulasAgregadas.some(c => c.clausulaId === clausula.clausulaId);

    if (yaExiste) {
      this.actualizarService.mensajeError('La cláusula ya está agregada al modelo');
      return;
    }

    clausula.orden = this.clausulasAgregadas.length + 1;
    this.clausulasAgregadas.push(clausula);
    this.marcarFormularioTocado();
    this.actualizarService.mensajeCorrecto('Cláusula agregada exitosamente');
  }

  private inicializarFormulario(): void {
    const hoy = new Date().toISOString().split('T')[0];

    this.form = this.fb.nonNullable.group({
      denominacion: this.fb.nonNullable.control<string>('', [Validators.required, Validators.maxLength(500)]),
      fechaVigenciaDesde: this.fb.nonNullable.control<string>(this.modoIngreso ? hoy : ''),
      fechaVigenciaHasta: this.fb.nonNullable.control<string>('')
    }, { validators: this.validarFechas.bind(this) });
  }

  private validarFechas(control: any): { [key: string]: boolean } | null {
    const desde = control.get('fechaVigenciaDesde')?.value;
    const hasta = control.get('fechaVigenciaHasta')?.value;

    if (desde && hasta && desde > hasta) {
      return { fechasInvalidas: true };
    }

    return null;
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
        this.clausulasAgregadas = [...(modelo.clausulas || [])];

        setTimeout(() => {
          this.form.markAsPristine();
        }, 500);

        this.verificarSeccionSeleccionada();
        this.verificarClausulaSeleccionada();
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

  agregarClausula(): void {
    this.router.navigate(['/pliegos/clausulas'], {
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

  eliminarClausula(clausula: ClausulaModelo): void {
    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
    if (index > -1) {
      this.clausulasAgregadas.splice(index, 1);
      this.reordenarClausulas();
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

  moverClausulaArriba(clausula: ClausulaModelo): void {
    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
    if (index > 0) {
      [this.clausulasAgregadas[index - 1], this.clausulasAgregadas[index]] =
        [this.clausulasAgregadas[index], this.clausulasAgregadas[index - 1]];
      this.reordenarClausulas();
      this.marcarFormularioTocado();
    }
  }

  moverClausulaAbajo(clausula: ClausulaModelo): void {
    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
    if (index < this.clausulasAgregadas.length - 1) {
      [this.clausulasAgregadas[index], this.clausulasAgregadas[index + 1]] =
        [this.clausulasAgregadas[index + 1], this.clausulasAgregadas[index]];
      this.reordenarClausulas();
      this.marcarFormularioTocado();
    }
  }

  private reordenarSecciones(): void {
    this.seccionesAgregadas.forEach((seccion, index) => {
      seccion.orden = index + 1;
    });
  }

  private reordenarClausulas(): void {
    this.clausulasAgregadas.forEach((clausula, index) => {
      clausula.orden = index + 1;
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

  obtenerAccionesClausula(clausula: ClausulaModelo): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);

    if (index > 0) {
      acciones.push({
        nombre: 'Subir',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-up',
        ariaLabel: 'Subir cláusula ' + clausula.denominacion,
        accion: () => this.moverClausulaArriba(clausula)
      });
    }

    if (index < this.clausulasAgregadas.length - 1) {
      acciones.push({
        nombre: 'Bajar',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-down',
        ariaLabel: 'Bajar cláusula ' + clausula.denominacion,
        accion: () => this.moverClausulaAbajo(clausula)
      });
    }

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn btn-sm',
      icono: 'fa fa-trash',
      ariaLabel: 'Eliminar cláusula ' + clausula.denominacion,
      accion: () => this.eliminarClausula(clausula)
    });

    return acciones;
  }

  private marcarFormularioTocado(): void {
    this.form.markAsDirty();
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.actualizarService.mensajeError('Por favor complete todos los campos obligatorios correctamente');
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
      clausulas: this.clausulasAgregadas,
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
