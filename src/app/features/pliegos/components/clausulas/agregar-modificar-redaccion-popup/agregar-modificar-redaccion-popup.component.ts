import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PopupBaseComponent } from '../../../../../shared/components/popup-base/popup-base.component';
import { RedaccionClausula } from '../../../models/redaccion-clausula.model';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';

@Component({
  selector: 'app-agregar-modificar-redaccion-popup',
  templateUrl: './agregar-modificar-redaccion-popup.component.html',
  styleUrls: ['./agregar-modificar-redaccion-popup.component.scss'],
  standalone: false
})
export class AgregarModificarRedaccionPopupComponent extends PopupBaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly fechaPipe = inject(FechaPipe);

  @Output() redaccionGuardada = new EventEmitter<RedaccionClausula>();

  clausulaInfo: any;
  redaccion?: RedaccionClausula;
  redaccionesExistentes: RedaccionClausula[] = [];
  modoIngreso = true;
  colapsado = true;

  override form!: FormGroup<{
    prioridad: FormControl<number | null>;
    redaccion: FormControl<string>;
  }>;

  override ngOnInit(): void {
    this.modoIngreso = !this.redaccion;
    this.inicializarFormulario();
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

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.actualizarService.mensajeError('Por favor complete todos los campos obligatorios');
      return;
    }

    const prioridad = this.form.value.prioridad;

    const yaExiste = this.redaccionesExistentes.some(r => r.prioridad === prioridad);
    if (yaExiste) {
      this.actualizarService.mensajeError('Ya existe una redacción con esta prioridad');
      return;
    }

    const redaccionNueva: RedaccionClausula = {
      prioridad: prioridad!,
      redaccion: this.form.value.redaccion!
    };

    this.redaccionGuardada.emit(redaccionNueva);
    this.cerrarPopup();
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
