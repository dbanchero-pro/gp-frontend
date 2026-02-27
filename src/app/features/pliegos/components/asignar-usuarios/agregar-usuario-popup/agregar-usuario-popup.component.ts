import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoMensajeEnum } from 'src/app/shared/enum/tipo-mensaje.enum';
import { UsuarioAsignadoDTO } from '../../../models/usuario-asignado.model';
import { UsuarioBusquedaDTO } from '../../../models/usuario-busqueda.model';
import { BandejaEntradaService } from '../../../services/bandeja-entrada.service';

enum TipoBusquedaUsuario {
  CI = 'CI',
  NOMBRE = 'NOMBRE'
}

@Component({
  selector: 'app-agregar-usuario-popup',
  templateUrl: './agregar-usuario-popup.component.html',
  styleUrls: ['./agregar-usuario-popup.component.scss'],
})
export class AgregarUsuarioPopupComponent extends PopupBaseComponent implements OnInit, OnDestroy {
  @Output() guardarEvento = new EventEmitter<UsuarioAsignadoDTO>();

  override form!: FormGroup;
  intentoGuardar = false;
  guardando = false;

  tipoBusqueda: FormControl = new FormControl(TipoBusquedaUsuario.CI);
  busquedaTexto: FormControl = new FormControl('');
  busquedaCI: FormControl = new FormControl('');
  busquedaNombre: FormControl = new FormControl('');
  usuarioSeleccionado: UsuarioBusquedaDTO | null = null;

  usuariosFiltrados: UsuarioBusquedaDTO[] = [];
  cedulaValida = false;
  nombreValido = false;
  busquedaRealizada = false;

  TipoBusquedaUsuario = TipoBusquedaUsuario;

  private destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly bandejaEntradaService: BandejaEntradaService
  ) {
    super();
  }

  override ngOnInit(): void {
    this.form = this.fb.group({
      esEditorPrincipal: [false],
      esEditor: [false],
      esValidador: [false],
      esAprobador: [false],
    });

    this.usuariosFiltrados = [];

    this.busquedaCI.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(cedula => {
        this.cedulaValida = this.validarCedula(cedula);

        if (this.cedulaValida) {
          this.buscarPorCI(cedula);
        } else {
          this.usuariosFiltrados = [];
          this.busquedaRealizada = false;
          this.usuarioSeleccionado = null;
          this.busquedaTexto.setValue('', { emitEvent: false });
        }
      });

    this.busquedaNombre.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(texto => {
        this.nombreValido = texto && texto.trim().length >= 5;

        if (this.nombreValido) {
          this.buscarPorNombre(texto);
        } else {
          this.usuariosFiltrados = [];
          this.busquedaRealizada = false;
          this.usuarioSeleccionado = null;
          this.busquedaTexto.setValue('', { emitEvent: false });
        }
      });
  }

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private validarCedula(cedula: string): boolean {
    if (!cedula) return false;

    const soloDigitos = cedula.replace(/[.\-]/g, '');
    return soloDigitos.length >= 7 && soloDigitos.length <= 8;
  }

  private buscarPorCI(cedula: string): void {
    this.bandejaEntradaService.buscarUsuariosParaAsignacion(cedula, 'CI').subscribe({
      next: (usuarios: UsuarioBusquedaDTO[]) => {
        this.usuariosFiltrados = usuarios;
        this.busquedaRealizada = true;
        this.usuarioSeleccionado = null;
        this.busquedaTexto.setValue('', { emitEvent: false });
      },
      error: () => {
        this.usuariosFiltrados = [];
        this.busquedaRealizada = true;
        this.usuarioSeleccionado = null;
        this.busquedaTexto.setValue('', { emitEvent: false });
      }
    });
  }

  private buscarPorNombre(texto: string): void {
    this.bandejaEntradaService.buscarUsuariosParaAsignacion(texto, 'NOMBRE').subscribe({
      next: (usuarios: UsuarioBusquedaDTO[]) => {
        this.usuariosFiltrados = usuarios;
        this.busquedaRealizada = true;
        this.usuarioSeleccionado = null;
        this.busquedaTexto.setValue('', { emitEvent: false });
      },
      error: () => {
        this.usuariosFiltrados = [];
        this.busquedaRealizada = true;
        this.usuarioSeleccionado = null;
        this.busquedaTexto.setValue('', { emitEvent: false });
      }
    });
  }

  cambioTipoBusqueda(): void {
    this.busquedaTexto.setValue('', { emitEvent: false });
    this.busquedaCI.setValue('', { emitEvent: false });
    this.busquedaNombre.setValue('', { emitEvent: false });
    this.usuarioSeleccionado = null;
    this.usuariosFiltrados = [];
    this.cedulaValida = false;
    this.nombreValido = false;
    this.busquedaRealizada = false;
  }

  onSeleccionarUsuario(event: TypeaheadMatch): void {
    if (event?.item) {
      this.usuarioSeleccionado = event.item;
    }
  }

  alMenosUnRolSeleccionado(): boolean {
    const valores = this.form.value;
    return valores.esEditorPrincipal || valores.esEditor || valores.esValidador || valores.esAprobador;
  }

  guardar(): void {
    this.intentoGuardar = true;

    if (!this.usuarioSeleccionado) {
      this.showMsg = true;
      this.typeMsg = TipoMensajeEnum.error;
      this.resultMsg = ['Debe seleccionar un usuario'];
      return;
    }

    if (!this.alMenosUnRolSeleccionado()) {
      return;
    }

    this.guardando = true;

    const roles: string[] = [];
    if (this.form.value.esEditorPrincipal) roles.push('Editor Principal');
    if (this.form.value.esEditor) roles.push('Editor');
    if (this.form.value.esValidador) roles.push('Validador');
    if (this.form.value.esAprobador) roles.push('Aprobador');

    const nuevoUsuario: UsuarioAsignadoDTO = {
      id: this.usuarioSeleccionado.id,
      numeroDocumento: this.usuarioSeleccionado.numeroDocumento,
      nombre: this.usuarioSeleccionado.nombre,
      apellido: this.usuarioSeleccionado.apellido,
      roles: roles
    };

    this.guardarEvento.emit(nuevoUsuario);
    this.guardando = false;
  }

  cancelar(): void {
    this.cerrarPopup();
  }
}


