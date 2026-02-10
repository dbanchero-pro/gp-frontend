import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CanComponentDeactivate } from '../../../../../shared/utils/can-component-deactivate';
import { FormularioBaseComponent } from '../../../../../shared/components/base/formulario-base.component';
import { CapituloService } from '../../../services/capitulo.service';
import { Capitulo, ClausulaCapitulo } from '../../../models/capitulo.model';
import { EstadoClausula } from '../../../enum/estado-clausula.enum';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';
import { RedaccionClausula } from '../../../models/redaccion-clausula.model';

@Component({
  selector: 'app-agregar-modificar-capitulo',
  templateUrl: './agregar-modificar-capitulo.component.html',
  styleUrls: ['./agregar-modificar-capitulo.component.scss'],
  standalone: false
})
export class AgregarModificarCapituloComponent extends FormularioBaseComponent implements OnInit, CanComponentDeactivate {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly capituloService = inject(CapituloService);

  idCapitulo!: number;
  modoIngreso = false;
  titulo = 'Agregar capítulo';

  override form!: FormGroup<{
    denominacion: FormControl<string>;
    fechaVigenciaDesde: FormControl<string>;
    fechaVigenciaHasta: FormControl<string>;
  }>;

  clausulasAgregadas: ClausulaCapitulo[] = [];

  constructor() {
    super();
    this.activatedRoute.params.subscribe(params => {
      this.idCapitulo = +params['idCapitulo'];
      this.modoIngreso = !this.idCapitulo;
    });
  }

  ngOnInit(): void {
    if (!this.modoIngreso) {
      this.titulo = 'Modificar capítulo';
    }

    this.inicializarFormulario();

    if (this.modoIngreso) {
      this.verificarClausulaSeleccionada();
    } else {
      this.cargarDatosCapitulo();
    }
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

  private agregarClausulaDesdeSeleccion(clausula: ClausulaCapitulo): void {
    const yaExiste = this.clausulasAgregadas.some(c => c.clausulaId === clausula.clausulaId);

    if (yaExiste) {
      this.actualizarService.mensajeError('La cláusula ya está agregada al capítulo');
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

  private cargarDatosCapitulo(): void {
    if (this.modoIngreso) {
      return;
    }

    this.capituloService.obtenerCapituloPorId(this.idCapitulo).subscribe({
      next: (capitulo: Capitulo | undefined) => {
        if (!capitulo) {
          this.actualizarService.mensajeError('Capítulo no encontrado');
          this.volver();
          return;
        }

        const convertirFecha = (fecha: any): string => {
          if (!fecha) return '';
          if (fecha instanceof Date) return fecha.toISOString().split('T')[0];
          return String(fecha);
        };

        this.form.patchValue({
          denominacion: capitulo.denominacion,
          fechaVigenciaDesde: convertirFecha(capitulo.fechaVigenciaDesde),
          fechaVigenciaHasta: convertirFecha(capitulo.fechaVigenciaHasta)
        });

        this.clausulasAgregadas = [...(capitulo.clausulas || [])];

        setTimeout(() => {
          this.form.markAsPristine();
        }, 500);

        this.verificarClausulaSeleccionada();
      },
      error: (err) => {
        this.actualizarService.mensajeError('Error al cargar el capítulo');
        console.error('Error al cargar capítulo:', err);
      }
    });
  }

  agregarClausula(): void {
    this.router.navigate(['/pliegos/clausulas'], {
      queryParams: {
        origen: 'capitulo',
        idCapitulo: this.idCapitulo || 'nuevo'
      }
    });
  }

  eliminarClausula(clausula: ClausulaCapitulo): void {
      const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
      if (index > -1) {
        this.clausulasAgregadas.splice(index, 1);
        this.reordenarClausulas();
        this.marcarFormularioTocado();
      }
  }

  moverClausulaArriba(clausula: ClausulaCapitulo): void {
    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
    if (index > 0) {
      [this.clausulasAgregadas[index - 1], this.clausulasAgregadas[index]] =
        [this.clausulasAgregadas[index], this.clausulasAgregadas[index - 1]];
      this.reordenarClausulas();
      this.marcarFormularioTocado();
    }
  }

  moverClausulaAbajo(clausula: ClausulaCapitulo): void {
    const index = this.clausulasAgregadas.findIndex(c => c.clausulaId === clausula.clausulaId);
    if (index < this.clausulasAgregadas.length - 1) {
      [this.clausulasAgregadas[index], this.clausulasAgregadas[index + 1]] =
        [this.clausulasAgregadas[index + 1], this.clausulasAgregadas[index]];
      this.reordenarClausulas();
      this.marcarFormularioTocado();
    }
  }

  private reordenarClausulas(): void {
    this.clausulasAgregadas.forEach((clausula, index) => {
      clausula.orden = index + 1;
    });
  }

  obtenerAccionesClausula(clausula: ClausulaCapitulo): AccionBoton[] {
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

     acciones.push({
      nombre: 'Ver',
      clase: 'btn btn-sm',
      icono: 'fa fa-eye',
      ariaLabel: `Ver redacciones de cláusula ${clausula.denominacion}`,
      //accion: () => this.eliminarClausula(clausula)
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

    const capitulo: Partial<Capitulo> = {
      id: this.modoIngreso ? null : this.idCapitulo,
      denominacion: valores.denominacion!,
      fechaVigenciaDesde: valores.fechaVigenciaDesde || null,
      fechaVigenciaHasta: valores.fechaVigenciaHasta || null,
      clausulas: this.clausulasAgregadas,
      estado: EstadoClausula.BORRADOR,
      versionada: false,
      version: this.modoIngreso ? 1 : undefined,
      fechaCreacion: null,
      usuarioCreacion: null,
      fechaModificacion: null,
      usuarioModificacion: null
    };

    const operacion = this.modoIngreso
      ? this.capituloService.crearCapitulo(capitulo as Capitulo)
      : this.capituloService.actualizarCapitulo(this.idCapitulo, capitulo as Capitulo);

    operacion.subscribe({
      next: () => {
        this.actualizarService.mensajeCorrecto(
          this.modoIngreso ? 'Capítulo creado exitosamente' : 'Capítulo actualizado exitosamente'
        );
        this.form.markAsPristine();
        this.volver();
      },
      error: (err) => {
        if (err?.error?.mensaje?.includes('denominación')) {
          this.actualizarService.mensajeError('Ya existe un capítulo con esta denominación');
        } else {
          this.actualizarService.mensajeError('Error al guardar el capítulo');
        }
        console.error('Error al guardar:', err);
      }
    });
  }

  aprobar(): void {
    this.actualizarService.confirmar(
      '¿Está seguro que desea aprobar esta versión del capítulo?',
      () => {
        this.capituloService.aprobarCapitulo(this.idCapitulo).subscribe({
          next: () => {
            this.actualizarService.mensajeCorrecto('Capítulo aprobado exitosamente');
            this.form.markAsPristine();
            this.volver();
          },
          error: (err) => {
            this.actualizarService.mensajeError('Error al aprobar el capítulo');
            console.error('Error al aprobar:', err);
          }
        });
      }
    );
  }

  volver(): void {
    this.router.navigate(['/pliegos/capitulos'], { queryParams: { volver: 1 } });
  }

  canDeactivate(): boolean {
    return !this.form.dirty;
  }
}
