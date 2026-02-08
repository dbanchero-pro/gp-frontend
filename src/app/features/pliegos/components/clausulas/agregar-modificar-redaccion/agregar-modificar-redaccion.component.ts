import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormularioBaseComponent } from '../../../../../shared/components/base/formulario-base.component';
import { RedaccionClausula } from '../../../models/redaccion-clausula.model';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { SnapshotGenericService } from '../../../../../shared/services/common/snapshot-generic.service';

@Component({
  selector: 'app-agregar-modificar-redaccion',
  templateUrl: './agregar-modificar-redaccion.component.html',
  styleUrls: ['./agregar-modificar-redaccion.component.scss'],
  standalone: false
})
export class AgregarModificarRedaccionComponent extends FormularioBaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly fechaPipe = inject(FechaPipe);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly snapshotService = inject(SnapshotGenericService);

  clausulaInfo: any;
  redaccion?: RedaccionClausula;
  redaccionesExistentes: RedaccionClausula[] = [];
  modoIngreso = true;
  colapsado = true;
  idClausula?: number;
  idRedaccion?: number;
  titulo: string = 'Agregar redacción';

  override form!: FormGroup<{
    prioridad: FormControl<number | null>;
    redaccion: FormControl<string>;
  }>;

  ngOnInit(): void {
    this.idClausula = Number(this.route.snapshot.paramMap.get('idClausula'));
    const idRedaccionParam = this.route.snapshot.paramMap.get('idRedaccion');
    this.idRedaccion = idRedaccionParam ? Number(idRedaccionParam) : undefined;

    this.modoIngreso = !this.idRedaccion;

    console.log('Inicializando redacción - Modo:', this.modoIngreso ? 'INGRESO' : 'MODIFICACIÓN');
    console.log('ID Cláusula:', this.idClausula);
    console.log('ID Redacción:', this.idRedaccion, 'Tipo:', typeof this.idRedaccion);

    this.cargarDatosTemporales();
    this.inicializarFormulario();

    if (!this.modoIngreso)
      this.titulo = 'Modificar redacción';

    console.log('Redacción cargada:', this.redaccion);
    console.log('Valores del formulario - Prioridad:', this.form.value.prioridad, 'Redacción length:', this.form.value.redaccion?.length);
  }

  private cargarDatosTemporales(): void {
    const datos = this.snapshotService.load<any>('clausula_temporal');

    if (datos) {
      this.clausulaInfo = datos.clausulaInfo;
      this.redaccionesExistentes = datos.redacciones || [];

      if (this.idRedaccion) {
        this.redaccion = this.redaccionesExistentes.find(r => Number(r.id) === Number(this.idRedaccion));

        if (!this.redaccion) {
          console.error('No se encontró la redacción con ID:', this.idRedaccion);
          console.log('Redacciones disponibles:', this.redaccionesExistentes.map(r => ({ id: r.id, prioridad: r.prioridad })));
        }
      }
    }
  }

  private inicializarFormulario(): void {
    this.form = this.fb.nonNullable.group({
      prioridad: this.fb.control<number | null>(
        this.redaccion?.prioridad || null,
        [Validators.required, Validators.min(1)]
      ),
      redaccion: this.fb.nonNullable.control<string>(
        this.redaccion?.redaccion || '',
        Validators.required
      )
    });
  }

  aceptar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.actualizarService.mensajeError('Por favor complete todos los campos obligatorios');
      return;
    }

    const prioridad = this.form.value.prioridad;

    const yaExiste = this.redaccionesExistentes.some(r =>
      r.prioridad === prioridad && Number(r.id) !== Number(this.idRedaccion)
    );

    if (yaExiste) {
      this.actualizarService.mensajeError('Ya existe una redacción con esta prioridad');
      return;
    }

    const redaccionNueva: RedaccionClausula = {
      id: this.idRedaccion,
      prioridad: prioridad!,
      redaccion: this.form.value.redaccion!
    };

    const datos = this.snapshotService.load<any>('clausula_temporal');
    if (datos) {
      if (this.modoIngreso) {
        datos.redacciones = datos.redacciones || [];
        redaccionNueva.id = this.obtenerNuevoId(datos.redacciones);
        datos.redacciones.push(redaccionNueva);
      } else {
        const index = datos.redacciones.findIndex((r: RedaccionClausula) => Number(r.id) === Number(this.idRedaccion));
        if (index > -1) {
          datos.redacciones[index] = redaccionNueva;
        } else {
          console.error('No se pudo encontrar la redacción para actualizar. ID:', this.idRedaccion);
        }
      }

      this.snapshotService.save('clausula_temporal', datos);
    }

    this.form.markAsPristine();
    this.volver();
  }

  private obtenerNuevoId(redacciones: RedaccionClausula[]): number {
    if (!redacciones || redacciones.length === 0) {
      return 1;
    }
    const maxId = Math.max(...redacciones.map(r => r.id || 0));
    return maxId + 1;
  }

  volver(): void {
    this.location.back();
  }

  canDeactivate(): boolean {
    return !this.form.dirty;
  }

  obtenerResumenTiposCompra(): string {
    if (!this.clausulaInfo?.tiposCompra || this.clausulaInfo.tiposCompra.length === 0) {
      return 'No especificados';
    }

    return this.clausulaInfo.tiposCompra
      .map((tc: any) => {
        const subtipos = tc.subtipos.map((st: any) => st.subtipoCompraDescripcion).join(', ');
        return subtipos ? `${tc.tipoCompraDescripcion} | ${subtipos}` : tc.tipoCompraDescripcion;
      })
      .join(' • ');
  }

  obtenerResumenObjetosCompra(): string {
    if (!this.clausulaInfo?.objetosCompra || this.clausulaInfo.objetosCompra.length === 0) {
      return 'No especificados';
    }

    return this.clausulaInfo.objetosCompra
      .map((oc: any) => {
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

  obtenerTextoVigencia(): string {
    const desde = this.clausulaInfo?.fechaVigenciaDesde
      ? this.fechaPipe.transform(this.clausulaInfo.fechaVigenciaDesde)
      : 'N/A';
    const hasta = this.clausulaInfo?.fechaVigenciaHasta
      ? this.fechaPipe.transform(this.clausulaInfo.fechaVigenciaHasta)
      : 'Indefinido';
    return `${desde} - ${hasta}`;
  }

  toggleColapsado(): void {
    this.colapsado = !this.colapsado;
  }
}
