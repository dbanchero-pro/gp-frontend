import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PopupBaseComponent } from '../../../../../shared/components/popup-base/popup-base.component';
import { IReglaDTO, ReglaDTO } from '../../models/regla.model';
import { TipoRegla } from '../../enum/tipo-regla.enum';
import { OperadorRegla } from '../../enum/operador-regla.enum';
import { TipoDatoCampo } from '../../enum/tipo-dato-campo.enum';
import { ActualizarService } from '../../../../../shared/services/common/actualizar.service';
import { OperadorHelperService } from '../../services/operador-helper.service';
import { CampoService } from '../../services/campo.service';
import { CampoDTO } from 'src/app/shared/models/pliego/campo.model';

@Component({
  selector: 'app-agregar-modificar-regla-popup',
  templateUrl: './agregar-modificar-regla-popup.component.html',
  styleUrls: ['./agregar-modificar-regla-popup.component.scss'],
  standalone: false
})
export class AgregarModificarReglaPopupComponent extends PopupBaseComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly operadorHelper = inject(OperadorHelperService);
  private readonly campoService = inject(CampoService);
  protected readonly actualizarServ = inject(ActualizarService);

  @Output() reglaGuardada = new EventEmitter<IReglaDTO>();

  reglaExistente?: IReglaDTO;
  reglasExistentes: IReglaDTO[] = [];
  tipoDatoCampo!: TipoDatoCampo;
  idCampoActual?: number;
  esModificacion = false;
  titulo = 'Agregar regla';

  override form!: FormGroup<{
    codigo: FormControl<string>;
    nombre: FormControl<string>;
    tipoRegla: FormControl<string>;
    operador: FormControl<string>;
    valor: FormControl<string>;
    valorRangoInicio: FormControl<string>;
    valorRangoFin: FormControl<string>;
    valorLista: FormControl<string>;
    idCampoComparar: FormControl<string>;
    mensajeError: FormControl<string>;
  }>;

  tiposRegla: { id: string; nombre: string }[] = [
    { id: TipoRegla.VALOR, nombre: 'Valor' },
    { id: TipoRegla.CAMPO, nombre: 'Campo' }
  ];

  operadores: { id: string; nombre: string }[] = [];
  camposDisponibles: CampoDTO[] = [];

  readonly TipoRegla = TipoRegla;
  readonly OperadorRegla = OperadorRegla;
  readonly TipoDatoCampo = TipoDatoCampo;

  override ngOnInit(): void {
    super.ngOnInit();

    if (this.reglaExistente) {
      this.esModificacion = true;
      this.titulo = 'Modificar regla';
    }

    this.operadores = this.operadorHelper.obtenerOperadoresPorTipoDato(this.tipoDatoCampo);

    this.inicializarFormulario();
    this.cargarCamposDisponibles();
    this.cargarDatosRegla();
    this.configurarCambiosTipoRegla();
    this.configurarCambiosOperador();
  }

  private inicializarFormulario(): void {
    this.form = this.fb.nonNullable.group({
      codigo: this.fb.nonNullable.control<string>('', Validators.required),
      nombre: this.fb.nonNullable.control<string>('', Validators.required),
      tipoRegla: this.fb.nonNullable.control<string>('', Validators.required),
      operador: this.fb.nonNullable.control<string>('', Validators.required),
      valor: this.fb.nonNullable.control<string>(''),
      valorRangoInicio: this.fb.nonNullable.control<string>(''),
      valorRangoFin: this.fb.nonNullable.control<string>(''),
      valorLista: this.fb.nonNullable.control<string>(''),
      idCampoComparar: this.fb.nonNullable.control<string>(''),
      mensajeError: this.fb.nonNullable.control<string>('', Validators.required)
    });
  }

  private cargarCamposDisponibles(): void {
    this.campoService.obtenerCamposPorTipo(this.tipoDatoCampo, this.idCampoActual).subscribe({
      next: (campos) => {
        this.camposDisponibles = campos;
      },
      error: (err) => {
        console.error('Error al cargar campos disponibles:', err);
      }
    });
  }

  private cargarDatosRegla(): void {
    if (!this.reglaExistente) {
      return;
    }

    let valor = '';
    let valorRangoInicio = '';
    let valorRangoFin = '';
    let valorLista = '';

    if (this.reglaExistente.operador === OperadorRegla.RANGO && Array.isArray(this.reglaExistente.valor)) {
      valorRangoInicio = this.reglaExistente.valor[0]?.toString() || '';
      valorRangoFin = this.reglaExistente.valor[1]?.toString() || '';
    } else if (this.reglaExistente.operador === OperadorRegla.LISTA_VALORES && Array.isArray(this.reglaExistente.valor)) {
      valorLista = this.reglaExistente.valor.join(';');
    } else {
      valor = this.reglaExistente.valor?.toString() || '';
    }

    this.form.patchValue({
      codigo: this.reglaExistente.codigo || '',
      nombre: this.reglaExistente.nombre || '',
      tipoRegla: this.reglaExistente.tipoRegla || '',
      operador: this.reglaExistente.operador || '',
      valor: valor,
      valorRangoInicio: valorRangoInicio,
      valorRangoFin: valorRangoFin,
      valorLista: valorLista,
      idCampoComparar: this.reglaExistente.idCampoComparar?.toString() || '',
      mensajeError: this.reglaExistente.mensajeError || ''
    });
  }

  private configurarCambiosTipoRegla(): void {
    this.form.get('tipoRegla')?.valueChanges.subscribe((tipoRegla) => {
      this.actualizarValidadoresSegunTipo(tipoRegla as TipoRegla);
    });
  }

  private configurarCambiosOperador(): void {
    this.form.get('operador')?.valueChanges.subscribe((operador) => {
      this.actualizarValidadoresSegunOperador(operador as OperadorRegla);
    });
  }

  private actualizarValidadoresSegunTipo(tipoRegla: TipoRegla): void {
    const valorControl = this.form.get('valor');
    const valorRangoInicioControl = this.form.get('valorRangoInicio');
    const valorRangoFinControl = this.form.get('valorRangoFin');
    const valorListaControl = this.form.get('valorLista');
    const idCampoCompararControl = this.form.get('idCampoComparar');

    valorControl?.clearValidators();
    valorRangoInicioControl?.clearValidators();
    valorRangoFinControl?.clearValidators();
    valorListaControl?.clearValidators();
    idCampoCompararControl?.clearValidators();

    if (tipoRegla === TipoRegla.CAMPO) {
      idCampoCompararControl?.setValidators(Validators.required);
    }

    valorControl?.updateValueAndValidity();
    valorRangoInicioControl?.updateValueAndValidity();
    valorRangoFinControl?.updateValueAndValidity();
    valorListaControl?.updateValueAndValidity();
    idCampoCompararControl?.updateValueAndValidity();
  }

  private actualizarValidadoresSegunOperador(operador: OperadorRegla): void {
    const tipoRegla = this.form.get('tipoRegla')?.value as TipoRegla;
    if (tipoRegla !== TipoRegla.VALOR) {
      return;
    }

    const valorControl = this.form.get('valor');
    const valorRangoInicioControl = this.form.get('valorRangoInicio');
    const valorRangoFinControl = this.form.get('valorRangoFin');
    const valorListaControl = this.form.get('valorLista');

    valorControl?.clearValidators();
    valorRangoInicioControl?.clearValidators();
    valorRangoFinControl?.clearValidators();
    valorListaControl?.clearValidators();

    if (operador === OperadorRegla.RANGO) {
      valorRangoInicioControl?.setValidators(Validators.required);
      valorRangoFinControl?.setValidators(Validators.required);
    } else if (operador === OperadorRegla.LISTA_VALORES) {
      valorListaControl?.setValidators(Validators.required);
    } else {
      valorControl?.setValidators(Validators.required);
    }

    valorControl?.updateValueAndValidity();
    valorRangoInicioControl?.updateValueAndValidity();
    valorRangoFinControl?.updateValueAndValidity();
    valorListaControl?.updateValueAndValidity();
  }

  esTipoValor(): boolean {
    return this.form.get('tipoRegla')?.value === TipoRegla.VALOR;
  }

  esTipoCampo(): boolean {
    return this.form.get('tipoRegla')?.value === TipoRegla.CAMPO;
  }

  esOperadorRango(): boolean {
    return this.form.get('operador')?.value === OperadorRegla.RANGO;
  }

  esOperadorLista(): boolean {
    return this.form.get('operador')?.value === OperadorRegla.LISTA_VALORES;
  }

  esOperadorSimple(): boolean {
    const operador = this.form.get('operador')?.value as OperadorRegla;
    return operador !== OperadorRegla.RANGO && operador !== OperadorRegla.LISTA_VALORES;
  }

  guardar(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      this.mostrarError('Por favor complete todos los campos requeridos');
      return;
    }

    const codigo = this.form.value.codigo || '';
    const nombre = this.form.value.nombre || '';

    const codigoExiste = this.reglasExistentes.some(r => r.codigo === codigo);
    if (codigoExiste) {
      this.mostrarError('Ya existe una regla con ese código');
      return;
    }

    const nombreExiste = this.reglasExistentes.some(r => r.nombre === nombre);
    if (nombreExiste) {
      this.mostrarError('Ya existe una regla con ese nombre');
      return;
    }

    const tipoRegla = this.form.value.tipoRegla as TipoRegla;
    const operador = this.form.value.operador as OperadorRegla;
    let valor: any;
    let idCampoComparar: number | undefined;
    let etiquetaCampoComparar: string | undefined;

    if (tipoRegla === TipoRegla.VALOR) {
      if (operador === OperadorRegla.RANGO) {
        const inicio = this.form.value.valorRangoInicio || '';
        const fin = this.form.value.valorRangoFin || '';

        if (this.tipoDatoCampo === TipoDatoCampo.NUMERO) {
          const inicioNum = parseFloat(inicio);
          const finNum = parseFloat(fin);
          if (isNaN(inicioNum) || isNaN(finNum)) {
            this.mostrarError('Los valores del rango deben ser numéricos');
            return;
          }
          if (inicioNum >= finNum) {
            this.mostrarError('El primer valor del rango debe ser menor que el segundo');
            return;
          }
          valor = [inicioNum, finNum];
        } else {
          if (inicio >= fin) {
            this.mostrarError('El primer valor del rango debe ser menor que el segundo');
            return;
          }
          valor = [inicio, fin];
        }
      } else if (operador === OperadorRegla.LISTA_VALORES) {
        const lista = (this.form.value.valorLista || '').split(';').map(v => v.trim()).filter(v => v);
        if (lista.length === 0) {
          this.mostrarError('Debe ingresar al menos un valor en la lista');
          return;
        }
        const listaUnica = [...new Set(lista)];
        if (listaUnica.length !== lista.length) {
          this.mostrarError('Los valores de la lista no se pueden repetir');
          return;
        }
        valor = lista;
      } else {
        valor = this.form.value.valor || '';
        if (this.tipoDatoCampo === TipoDatoCampo.NUMERO) {
          valor = parseFloat(valor);
          if (isNaN(valor)) {
            this.mostrarError('El valor debe ser numérico');
            return;
          }
        }
      }
    } else {
      const idCampo = parseInt(this.form.value.idCampoComparar || '');
      if (isNaN(idCampo)) {
        this.mostrarError('Debe seleccionar un campo para comparar');
        return;
      }
      idCampoComparar = idCampo;
      const campoSeleccionado = this.camposDisponibles.find(c => c.id === idCampoComparar);
      etiquetaCampoComparar = campoSeleccionado?.etiqueta;
    }

    const regla = new ReglaDTO(
      undefined,
      codigo,
      nombre,
      tipoRegla,
      operador,
      valor,
      idCampoComparar,
      etiquetaCampoComparar,
      this.form.value.mensajeError || ''
    );

    this.reglaGuardada.emit(regla);
    this.cerrarPopup();
  }

  cancelar(): void {
    this.cancelarConConfirmacion();
  }
}
