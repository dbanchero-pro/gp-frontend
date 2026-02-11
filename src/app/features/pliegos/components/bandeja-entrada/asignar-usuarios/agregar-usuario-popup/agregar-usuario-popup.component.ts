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
  usuarioSeleccionado: UsuarioBusqueda | null = null;

  usuariosFiltrados: UsuarioBusqueda[] = [];

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

    // Inicializar con todos los usuarios
    this.usuariosFiltrados = [...this.usuariosMock];
  }

  getUsuariosDataSource(): Observable<UsuarioBusqueda[]> {
    return of(this.usuariosFiltrados);
  }

  onBuscarUsuario(event: Event): void {
    const texto = (event.target as HTMLInputElement).value;
    this.buscarUsuarios(texto);
  }

  buscarUsuarios(texto: string): void {
    if (!texto || texto.trim().length === 0) {
      this.usuariosFiltrados = [...this.usuariosMock];
      return;
    }

    const textoBusqueda = texto.toLowerCase().trim();

    if (this.tipoBusqueda.value === TipoBusquedaUsuario.CI) {
      // Búsqueda por CI (eliminar puntos y guiones para comparar)
      const ciLimpia = textoBusqueda.replace(/[.\-]/g, '');
      this.usuariosFiltrados = this.usuariosMock.filter(u =>
        u.numeroDocumento.replace(/[.\-]/g, '').includes(ciLimpia)
      );
    } else {
      // Búsqueda por nombre completo
      this.usuariosFiltrados = this.usuariosMock.filter(u =>
        `${u.nombre} ${u.apellido}`.toLowerCase().includes(textoBusqueda)
      );
    }
  }

  cambioTipoBusqueda(): void {
    this.busquedaTexto.setValue('');
    this.usuarioSeleccionado = null;
    this.usuariosFiltrados = [...this.usuariosMock];
  }

  onSeleccionarUsuario(event: TypeaheadMatch): void {
    if (event && event.item) {
      this.usuarioSeleccionado = event.item;
    }
  }

  onDeseleccionarUsuario(): void {
    // Solo limpiar si el texto no coincide con un usuario seleccionado
    const textoActual = this.busquedaTexto.value?.trim();
    if (!textoActual) {
      this.usuarioSeleccionado = null;
    }
  }

  obtenerTextoUsuario(usuario: UsuarioBusqueda): string {
    return this.tipoBusqueda.value === TipoBusquedaUsuario.CI
      ? usuario.numeroDocumento
      : `${usuario.nombre} ${usuario.apellido}`;
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
