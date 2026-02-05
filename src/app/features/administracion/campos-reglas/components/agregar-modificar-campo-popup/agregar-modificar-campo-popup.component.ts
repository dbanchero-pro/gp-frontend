import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PopupBaseComponent } from '../../../../../shared/components/popup-base/popup-base.component';
import { CampoService } from '../../services/campo.service';
import { CampoDTO } from '../../models/campo.model';
import { TipoFuenteCampo } from '../../enum/tipo-fuente-campo.enum';
import { TipoDatoCampo } from '../../enum/tipo-dato-campo.enum';
import { SiNoValor } from '../../../../../shared/enum/si-no-valor.enum';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { AgregarModificarReglaPopupComponent } from '../agregar-modificar-regla-popup/agregar-modificar-regla-popup.component';
import { IReglaDTO, ReglaDTO } from '../../models/regla.model';
import { AccionBoton } from '../../../../../shared/models/common/accion-boton.model';
import { OperadorHelperService } from '../../services/operador-helper.service';
import { TipoRegla } from '../../enum/tipo-regla.enum';

@Component({
  selector: 'app-agregar-modificar-campo-popup',
  templateUrl: './agregar-modificar-campo-popup.component.html',
  styleUrls: ['./agregar-modificar-campo-popup.component.scss'],
  standalone: false
})
export class AgregarModificarCampoPopupComponent extends PopupBaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly campoService = inject(CampoService);
  private readonly operadorHelper = inject(OperadorHelperService);
  protected readonly actualizarServ = inject(ActualizarService);

  @Output() campoGuardado = new EventEmitter<CampoDTO>();

  campoExistente?: CampoDTO;
  esModificacion = false;
  titulo = 'Agregar campo';

  override form!: FormGroup<{
    etiqueta: FormControl<string>;
    descripcion: FormControl<string>;
    fuente: FormControl<string>;
    tipoDato: FormControl<string>;
    sePuedeEliminar: FormControl<string>;
  }>;

  tiposFuente: { id: string; nombre: string }[] = [];
  tiposDato: { id: string; nombre: string }[] = [];
  opcionesSiNo: { id: string; nombre: string }[] = [
    { id: SiNoValor.SI, nombre: 'Sí' },
    { id: SiNoValor.NO, nombre: 'No' }
  ];

  reglas: IReglaDTO[] = [];
  siguienteIdRegla = 1;

  override ngOnInit(): void {
    super.ngOnInit();

    this.tiposFuente = this.campoService.obtenerTiposFuente().filter(t => t.id !== '');
    this.tiposDato = this.campoService.obtenerTiposDato();

    if (this.campoExistente) {
      this.esModificacion = true;
      this.titulo = 'Modificar campo';
    }

    this.inicializarFormulario();
    this.cargarDatosCampo();
  }

  private inicializarFormulario(): void {
    this.form = this.fb.nonNullable.group({
      etiqueta: this.fb.nonNullable.control<string>('', [Validators.required, Validators.maxLength(50)]),
      descripcion: this.fb.nonNullable.control<string>('', Validators.required),
      fuente: this.fb.nonNullable.control<string>('', Validators.required),
      tipoDato: this.fb.nonNullable.control<string>('', Validators.required),
      sePuedeEliminar: this.fb.nonNullable.control<string>(SiNoValor.SI, Validators.required)
    });
  }

  private cargarDatosCampo(): void {
    if (!this.campoExistente) {
      return;
    }

    this.form.patchValue({
      etiqueta: this.campoExistente.etiqueta || '',
      descripcion: this.campoExistente.descripcion || '',
      fuente: this.campoExistente.fuente || '',
      tipoDato: this.campoExistente.tipoDato || '',
      sePuedeEliminar: this.campoExistente.sePuedeEliminar || SiNoValor.SI
    });

    if (this.campoExistente.reglas) {
      this.reglas = [...this.campoExistente.reglas];
      const maxId = Math.max(0, ...this.reglas.map(r => r.id || 0));
      this.siguienteIdRegla = maxId + 1;
    }
  }

  abrirAgregarRegla(): void {
    const tipoDato = this.form.value.tipoDato as TipoDatoCampo;
    if (!tipoDato) {
      this.mostrarError('Debe seleccionar un tipo de dato antes de agregar reglas');
      return;
    }

    const popup = this.abrirPopup(AgregarModificarReglaPopupComponent, undefined, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false,
      initialState: {
        tipoDatoCampo: tipoDato,
        reglasExistentes: this.reglas,
        idCampoActual: this.campoExistente?.id
      }
    });

    if (popup.reglaGuardada) {
      popup.reglaGuardada.subscribe((regla: IReglaDTO) => {
        regla.id = this.siguienteIdRegla++;
        this.reglas.push(regla);
      });
    }
  }

  obtenerAccionesRegla(regla: IReglaDTO): AccionBoton[] {
    const acciones: AccionBoton[] = [];

    acciones.push({
      nombre: 'Modificar',
      clase: 'btn btn-success',
      icono: 'fa fa-edit',
      accion: () => this.modificarRegla(regla)
    });

    acciones.push({
      nombre: 'Eliminar',
      clase: 'btn btn-success',
      icono: 'fa fa-trash',
      accion: () => this.eliminarRegla(regla)
    });

    return acciones;
  }

  ejecutarAccionRegla(accion: AccionBoton): void {
    if (accion.accion) {
      accion.accion();
    }
  }

  modificarRegla(regla: IReglaDTO): void {
    const tipoDato = this.form.value.tipoDato as TipoDatoCampo;
    if (!tipoDato) {
      return;
    }

    const popup = this.abrirPopup(AgregarModificarReglaPopupComponent, undefined, {
      class: 'modal-lg',
      backdrop: 'static',
      keyboard: false,
      initialState: {
        tipoDatoCampo: tipoDato,
        reglaExistente: regla,
        reglasExistentes: this.reglas.filter(r => r.id !== regla.id),
        idCampoActual: this.campoExistente?.id
      }
    });

    if (popup.reglaGuardada) {
      popup.reglaGuardada.subscribe((reglaModificada: IReglaDTO) => {
        const index = this.reglas.findIndex(r => r.id === regla.id);
        if (index !== -1) {
          this.reglas[index] = { ...reglaModificada, id: regla.id };
        }
      });
    }
  }

  eliminarRegla(regla: IReglaDTO): void {
    const index = this.reglas.findIndex(r => r.id === regla.id);
    if (index !== -1) {
      this.reglas.splice(index, 1);
    }
  }

  obtenerEtiquetaTipoRegla(tipoRegla: TipoRegla | undefined): string {
    switch (tipoRegla) {
      case TipoRegla.VALOR:
        return 'Valor';
      case TipoRegla.CAMPO:
        return 'Campo';
      default:
        return '-';
    }
  }

  obtenerNombreOperador(regla: IReglaDTO): string {
    return regla.operador ? this.operadorHelper.obtenerNombreOperador(regla.operador) : '-';
  }

  guardar(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    const campo = new CampoDTO(
      this.campoExistente?.id,
      this.form.value.etiqueta || '',
      this.form.value.descripcion || '',
      this.form.value.fuente as TipoFuenteCampo,
      this.form.value.tipoDato as TipoDatoCampo,
      this.form.value.sePuedeEliminar as SiNoValor,
      this.reglas.map(r => new ReglaDTO(
        undefined,
        r.codigo,
        r.nombre,
        r.tipoRegla,
        r.operador,
        r.valor,
        r.idCampoComparar,
        r.etiquetaCampoComparar,
        r.mensajeError
      )),
      this.campoExistente?.fechaCreacion || new Date(),
      new Date(),
      true
    );

    try {
      const operacion = this.esModificacion
        ? this.campoService.actualizar(campo)
        : this.campoService.crear(campo);

      operacion.subscribe({
        next: (campoGuardado) => {
          const mensaje = this.esModificacion
            ? 'Campo modificado correctamente'
            : 'Campo agregado correctamente';
          this.actualizarServ.mensajeCorrecto(mensaje);
          this.campoGuardado.emit(campoGuardado);
          this.cerrarPopup();
        },
        error: (err) => {
          this.mostrarError(err, 'Error al guardar el campo');
        }
      });
    } catch (error: any) {
      this.mostrarError(error, 'Error al guardar el campo');
    }
  }

  cancelar(): void {
    this.cancelarConConfirmacion();
  }
}
