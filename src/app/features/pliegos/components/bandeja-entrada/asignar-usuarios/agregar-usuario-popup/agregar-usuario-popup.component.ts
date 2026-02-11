import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, of } from 'rxjs';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoMensajeEnum } from 'src/app/shared/enum/tipo-mensaje.enum';
import { UsuarioAsignado } from '../models/usuario-asignado.model';

enum TipoBusquedaUsuario {
  CI = 'CI',
  NOMBRE = 'NOMBRE'
}

interface UsuarioBusqueda {
  id: number;
  numeroDocumento: string;
  nombre: string;
  apellido: string;
}

@Component({
  selector: 'app-agregar-usuario-popup',
  templateUrl: './agregar-usuario-popup.component.html',
  styleUrls: ['./agregar-usuario-popup.component.scss'],
  standalone: false,
})
export class AgregarUsuarioPopupComponent extends PopupBaseComponent implements OnInit {
  @Output() guardarEvento = new EventEmitter<UsuarioAsignado>();
  @Output() cancelarEvento = new EventEmitter<void>();

  override form!: FormGroup;
  intentoGuardar = false;
  guardando = false;

  tipoBusqueda: FormControl = new FormControl(TipoBusquedaUsuario.CI);
  busquedaTexto: FormControl = new FormControl('');
  busquedaCI: FormControl = new FormControl('');
  busquedaNombre: FormControl = new FormControl('');
  usuarioSeleccionado: UsuarioBusqueda | null = null;

  usuariosFiltrados: UsuarioBusqueda[] = [];
  cedulaValida = false;
  nombreValido = false;

  TipoBusquedaUsuario = TipoBusquedaUsuario;

  // Datos mock para pruebas - ampliada la lista
  private usuariosMock: UsuarioBusqueda[] = [
    { id: 10, numeroDocumento: '1.234.567-8', nombre: 'Juan', apellido: 'Pérez' },
    { id: 11, numeroDocumento: '8.765.432-1', nombre: 'María', apellido: 'González' },
    { id: 12, numeroDocumento: '1.122.334-4', nombre: 'Pedro', apellido: 'Rodríguez' },
    { id: 13, numeroDocumento: '5.566.778-8', nombre: 'Ana', apellido: 'Martínez' },
    { id: 14, numeroDocumento: '9.988.776-6', nombre: 'Luis', apellido: 'Fernández' },
    { id: 15, numeroDocumento: '2.233.445-5', nombre: 'Carolina', apellido: 'López' },
    { id: 16, numeroDocumento: '6.677.889-9', nombre: 'Diego', apellido: 'Sánchez' },
    { id: 17, numeroDocumento: '3.344.556-6', nombre: 'Laura', apellido: 'Ramírez' },
    { id: 18, numeroDocumento: '7.788.990-0', nombre: 'Roberto', apellido: 'Torres' },
    { id: 19, numeroDocumento: '4.455.667-7', nombre: 'Sofía', apellido: 'Vega' },
    { id: 20, numeroDocumento: '2.345.678-9', nombre: 'Carlos', apellido: 'Méndez' },
    { id: 21, numeroDocumento: '3.456.789-0', nombre: 'Patricia', apellido: 'Silva' },
    { id: 22, numeroDocumento: '4.567.890-1', nombre: 'Fernando', apellido: 'Castro' },
    { id: 23, numeroDocumento: '5.678.901-2', nombre: 'Gabriela', apellido: 'Díaz' },
    { id: 24, numeroDocumento: '6.789.012-3', nombre: 'Andrés', apellido: 'Morales' },
    { id: 25, numeroDocumento: '7.890.123-4', nombre: 'Valentina', apellido: 'Rojas' },
  ];

  constructor(private readonly fb: FormBuilder) {
    super();
  }

  override ngOnInit(): void {
    this.form = this.fb.group({
      esEditorPrincipal: [false],
      esEditor: [false],
      esValidador: [false],
      esAprobador: [false],
    });

    // Inicializar con lista vacía hasta que haya una búsqueda válida
    this.usuariosFiltrados = [];
  }

  /**
   * Valida si una cédula tiene el formato correcto
   */
  private validarCedula(cedula: string): boolean {
    if (!cedula) return false;

    // Eliminar puntos y guiones
    const soloDigitos = cedula.replace(/[.\-]/g, '');

    // Debe tener entre 7 y 8 dígitos
    return soloDigitos.length >= 7 && soloDigitos.length <= 8;
  }

  /**
   * Evento que se dispara al salir del campo CI (blur)
   */
  onBlurCI(): void {
    const cedula = this.busquedaCI.value;
    this.cedulaValida = this.validarCedula(cedula);

    if (this.cedulaValida) {
      this.buscarPorCI(cedula);
    } else {
      this.usuariosFiltrados = [];
      this.usuarioSeleccionado = null;
      this.busquedaTexto.setValue('');
    }
  }

  /**
   * Busca usuarios por cédula de identidad
   */
  private buscarPorCI(cedula: string): void {
    const ciLimpia = cedula.replace(/[.\-]/g, '');

    this.usuariosFiltrados = this.usuariosMock.filter(u => {
      const ciUsuarioLimpia = u.numeroDocumento.replace(/[.\-]/g, '');
      return ciUsuarioLimpia.includes(ciLimpia);
    });

    // Limpiar la selección anterior
    this.usuarioSeleccionado = null;
    this.busquedaTexto.setValue('');
  }

  /**
   * Evento que se dispara al escribir en el campo Nombre
   */
  onBuscarPorNombre(event: Event): void {
    const texto = (event.target as HTMLInputElement).value;
    this.nombreValido = texto.trim().length >= 5;

    if (this.nombreValido) {
      this.buscarPorNombre(texto);
    } else {
      this.usuariosFiltrados = [];
      this.usuarioSeleccionado = null;
      this.busquedaTexto.setValue('');
    }
  }

  /**
   * Busca usuarios por nombre
   */
  private buscarPorNombre(texto: string): void {
    const textoBusqueda = texto.toLowerCase().trim();

    this.usuariosFiltrados = this.usuariosMock.filter(u => {
      const nombreCompleto = `${u.nombre} ${u.apellido}`.toLowerCase();
      return nombreCompleto.includes(textoBusqueda);
    });

    // Limpiar la selección anterior
    this.usuarioSeleccionado = null;
    this.busquedaTexto.setValue('');
  }

  cambioTipoBusqueda(): void {
    // Limpiar todos los campos y flags al cambiar el tipo de búsqueda
    this.busquedaTexto.setValue('');
    this.busquedaCI.setValue('');
    this.busquedaNombre.setValue('');
    this.usuarioSeleccionado = null;
    this.usuariosFiltrados = [];
    this.cedulaValida = false;
    this.nombreValido = false;
  }

  onSeleccionarUsuario(event: TypeaheadMatch): void {
    if (event && event.item) {
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

    // Construir array de roles seleccionados
    const roles: string[] = [];
    if (this.form.value.esEditorPrincipal) roles.push('Editor Principal');
    if (this.form.value.esEditor) roles.push('Editor');
    if (this.form.value.esValidador) roles.push('Validador');
    if (this.form.value.esAprobador) roles.push('Aprobador');

    const nuevoUsuario: UsuarioAsignado = {
      id: this.usuarioSeleccionado.id,
      numeroDocumento: this.usuarioSeleccionado.numeroDocumento,
      nombre: this.usuarioSeleccionado.nombre,
      apellido: this.usuarioSeleccionado.apellido,
      roles: roles
    };

    this.guardarEvento.emit(nuevoUsuario);
  }

  cancelar(): void {
    this.cancelarEvento.emit();
  }
}
