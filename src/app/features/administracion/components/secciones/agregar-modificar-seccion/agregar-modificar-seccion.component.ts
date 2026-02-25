import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormularioBaseComponent } from 'src/app/shared/components/base/formulario-base.component';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { CapituloSeccion, ClausulaSeccion, Seccion } from 'src/app/shared/models/pliego/seccion.model';
import { CanComponentDeactivate } from 'src/app/shared/utils/can-component-deactivate';
import { EstadoElemento } from 'src/app/shared/enum/estado-elemento.enum';
import { SeccionService } from '../../../services/seccion.service';

@Component({
  selector: 'app-agregar-modificar-seccion',
  templateUrl: './agregar-modificar-seccion.component.html',
  styleUrls: ['./agregar-modificar-seccion.component.scss'],
  standalone: false
})
export class AgregarModificarSeccionComponent extends FormularioBaseComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly seccionService = inject(SeccionService);

  idSeccion!: number;
  modoIngreso = false;
  titulo = 'Agregar sección';

  override form!: FormGroup<{
    denominacion: FormControl<string>;
    fechaVigenciaDesde: FormControl<string>;
    fechaVigenciaHasta: FormControl<string>;
  }>;

  capitulosAgregados: CapituloSeccion[] = [];
  clausulasAgregadas: ClausulaSeccion[] = [];

  constructor() {
    super();
    this.activatedRoute.params.subscribe(params => {
      this.idSeccion = +params['idSeccion'];
      this.modoIngreso = !this.idSeccion;
    });
  }

  ngOnInit(): void {
    if (!this.modoIngreso) {
      this.titulo = 'Modificar sección';
    }

    this.inicializarFormulario();

    if (this.modoIngreso) {
      this.verificarCapituloSeleccionado();
      this.verificarClausulaSeleccionada();
    } else {
      this.cargarDatosSeccion();
    }
  }

  private verificarCapituloSeleccionado(): void {
    setTimeout(() => {
      const navigation = this.router.getCurrentNavigation();
      const state = navigation?.extras.state;

      if (state && state['capituloSeleccionado']) {
        this.agregarCapituloDesdeSeleccion(state['capituloSeleccionado']);
      } else {
        const historyState = window.history.state;
        if (historyState?.capituloSeleccionado) {
          this.agregarCapituloDesdeSeleccion(historyState.capituloSeleccionado);
          const newState = { ...historyState };
          delete newState.capituloSeleccionado;
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

  private agregarCapituloDesdeSeleccion(capitulo: CapituloSeccion): void {
    const yaExiste = this.capitulosAgregados.some(c => c.capituloId === capitulo.capituloId);

    if (yaExiste) {
      this.actualizarService.mensajeError('El capítulo ya está agregado a la sección');
      return;
    }

    capitulo.orden = this.capitulosAgregados.length + 1;
    this.capitulosAgregados.push(capitulo);
    this.marcarFormularioTocado();
    this.actualizarService.mensajeCorrecto('Capítulo agregado exitosamente');
  }

  private agregarClausulaDesdeSeleccion(clausula: ClausulaSeccion): void {
    const yaExiste = this.clausulasAgregadas.some(c => c.clausulaId === clausula.clausulaId);

    if (yaExiste) {
      this.actualizarService.mensajeError('La cláusula ya está agregada a la sección');
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

  private cargarDatosSeccion(): void {
    if (this.modoIngreso) {
      return;
    }

    this.seccionService.obtenerSeccionPorId(this.idSeccion).subscribe({
      next: (seccion: Seccion | undefined) => {
        if (!seccion) {
          this.actualizarService.mensajeError('Sección no encontrada');
          this.volver();
          return;
        }

        const convertirFecha = (fecha: any): string => {
          if (!fecha) return '';
          if (fecha instanceof Date) return fecha.toISOString().split('T')[0];
          return String(fecha);
        };

        this.form.patchValue({
          denominacion: seccion.denominacion,
          fechaVigenciaDesde: convertirFecha(seccion.fechaVigenciaDesde),
          fechaVigenciaHasta: convertirFecha(seccion.fechaVigenciaHasta)
        });

        this.capitulosAgregados = [...(seccion.capitulos || [])];
        this.clausulasAgregadas = [...(seccion.clausulas || [])];

        setTimeout(() => {
          this.form.markAsPristine();
        }, 500);

        this.verificarCapituloSeleccionado();
        this.verificarClausulaSeleccionada();
      },
      error: (err) => {
        this.actualizarService.mensajeError('Error al cargar la sección');
        console.error('Error al cargar sección:', err);
      }
    });
  }

  agregarCapitulo(): void {
    this.router.navigate(['/administracion/capitulos'], {
      queryParams: {
        origen: 'seccion',
        idSeccion: this.idSeccion || 'nuevo'
      }
    });
  }

  agregarClausula(): void {
    this.router.navigate(['/administracion/clausulas'], {
      queryParams: {
        origen: 'seccion',
        idSeccion: this.idSeccion || 'nuevo'
      }
    });
  }

  eliminarCapitulo(capitulo: CapituloSeccion): void {
      const index = this.capitulosAgregados.findIndex(c => c.capituloId === capitulo.capituloId);
      if (index > -1) {
        this.capitulosAgregados.splice(index, 1);
        this.reordenarCapitulos();
        this.marcarFormularioTocado();
      }
  }

  eliminarClausula(clausula: ClausulaSeccion): void {
      const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
      if (index > -1) {
        this.clausulasAgregadas.splice(index, 1);
        this.reordenarClausulas();
        this.marcarFormularioTocado();
      }
  }

  moverCapituloArriba(capitulo: CapituloSeccion): void {
    const index = this.capitulosAgregados.findIndex(c => c.capituloId === capitulo.capituloId);
    if (index > 0) {
      [this.capitulosAgregados[index - 1], this.capitulosAgregados[index]] =
        [this.capitulosAgregados[index], this.capitulosAgregados[index - 1]];
      this.reordenarCapitulos();
      this.marcarFormularioTocado();
    }
  }

  moverCapituloAbajo(capitulo: CapituloSeccion): void {
    const index = this.capitulosAgregados.findIndex(c => c.capituloId === capitulo.capituloId);
    if (index < this.capitulosAgregados.length - 1) {
      [this.capitulosAgregados[index], this.capitulosAgregados[index + 1]] =
        [this.capitulosAgregados[index + 1], this.capitulosAgregados[index]];
      this.reordenarCapitulos();
      this.marcarFormularioTocado();
    }
  }

  moverClausulaArriba(clausula: ClausulaSeccion): void {
    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
    if (index > 0) {
      [this.clausulasAgregadas[index - 1], this.clausulasAgregadas[index]] =
        [this.clausulasAgregadas[index], this.clausulasAgregadas[index - 1]];
      this.reordenarClausulas();
      this.marcarFormularioTocado();
    }
  }

  moverClausulaAbajo(clausula: ClausulaSeccion): void {
    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
    if (index < this.clausulasAgregadas.length - 1) {
      [this.clausulasAgregadas[index], this.clausulasAgregadas[index + 1]] =
        [this.clausulasAgregadas[index + 1], this.clausulasAgregadas[index]];
      this.reordenarClausulas();
      this.marcarFormularioTocado();
    }
  }

  private reordenarCapitulos(): void {
    this.capitulosAgregados.forEach((capitulo, index) => {
      capitulo.orden = index + 1;
    });
  }

  private reordenarClausulas(): void {
    this.clausulasAgregadas.forEach((clausula, index) => {
      clausula.orden = index + 1;
    });
  }

  obtenerAccionesCapitulo(capitulo: CapituloSeccion): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    const index = this.capitulosAgregados.findIndex(c => c.capituloId === capitulo.capituloId);

    if (index > 0) {
      acciones.push({
        nombre: 'Subir',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-up',
        ariaLabel: `Subir capítulo ${capitulo.denominacion}`,
        accion: () => this.moverCapituloArriba(capitulo)
      });
    }

    if (index < this.capitulosAgregados.length - 1) {
      acciones.push({
        nombre: 'Bajar',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-down',
        ariaLabel: `Bajar capítulo ${capitulo.denominacion}`,
        accion: () => this.moverCapituloAbajo(capitulo)
      });
    }

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn btn-sm',
      icono: 'fa fa-trash',
      ariaLabel: `Eliminar capítulo ${capitulo.denominacion}`,
      accion: () => this.eliminarCapitulo(capitulo)
    });

    return acciones;
  }

  obtenerAccionesClausula(clausula: ClausulaSeccion): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);

    if (index > 0) {
      acciones.push({
        nombre: 'Subir',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-up',
        ariaLabel: `Subir cláusula ${clausula.denominacion}`,
        accion: () => this.moverClausulaArriba(clausula)
      });
    }

    if (index < this.clausulasAgregadas.length - 1) {
      acciones.push({
        nombre: 'Bajar',
        clase: 'btn btn-sm',
        icono: 'fa fa-arrow-down',
        ariaLabel: `Bajar cláusula ${clausula.denominacion}`,
        accion: () => this.moverClausulaAbajo(clausula)
      });
    }

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn btn-sm',
      icono: 'fa fa-trash',
      ariaLabel: `Eliminar cláusula ${clausula.denominacion}`,
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
      return;
    }

    if (this.form.errors?.['fechasInvalidas']) {
      this.actualizarService.mensajeError('La fecha vigencia desde debe ser anterior a la fecha vigencia hasta');
      return;
    }

    const valores = this.form.value;

    const seccion: Partial<Seccion> = {
      id: this.modoIngreso ? null : this.idSeccion,
      denominacion: valores.denominacion!,
      fechaVigenciaDesde: valores.fechaVigenciaDesde || null,
      fechaVigenciaHasta: valores.fechaVigenciaHasta || null,
      capitulos: this.capitulosAgregados,
      clausulas: this.clausulasAgregadas,
      estado: EstadoElemento.BORRADOR,
      versionada: false,
      version: this.modoIngreso ? 1 : undefined,
      fechaCreacion: null,
      usuarioCreacion: null,
      fechaModificacion: null,
      usuarioModificacion: null
    };

    const operacion = this.modoIngreso
      ? this.seccionService.crearSeccion(seccion as Seccion)
      : this.seccionService.actualizarSeccion(this.idSeccion, seccion as Seccion);

    operacion.subscribe({
      next: () => {
        this.actualizarService.mensajeCorrecto(
          this.modoIngreso ? 'Sección creada exitosamente' : 'Sección actualizada exitosamente'
        );
        this.form.markAsPristine();
        this.volver();
      },
      error: (err) => {
        if (err?.error?.mensaje?.includes('denominación')) {
          this.actualizarService.mensajeError('Ya existe una sección con esta denominación');
        } else {
          this.actualizarService.mensajeError('Error al guardar la sección');
        }
        console.error('Error al guardar:', err);
      }
    });
  }

  aprobar(): void {
    this.actualizarService.confirmar(
      '¿Está seguro que desea aprobar esta versión de la sección?',
      () => {
        this.seccionService.aprobarSeccion(this.idSeccion).subscribe({
          next: () => {
            this.actualizarService.mensajeCorrecto('Sección aprobada exitosamente');
            this.form.markAsPristine();
            this.volver();
          },
          error: (err) => {
            this.actualizarService.mensajeError('Error al aprobar la sección');
            console.error('Error al aprobar:', err);
          }
        });
      }
    );
  }

  volver(): void {
    this.router.navigate(['/administracion/secciones'], { queryParams: { volver: 1 } });
  }

  canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
