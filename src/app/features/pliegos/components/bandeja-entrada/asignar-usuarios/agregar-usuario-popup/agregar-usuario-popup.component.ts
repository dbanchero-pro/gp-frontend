import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { TypeaheadMatch } from 'ngx-bootstrap/typeahead';
import { Observable, Subject, debounceTime, distinctUntilChanged, of, switchMap } from 'rxjs';
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

  override form!: FormGroup;
  intentoGuardar = false;
  guardando = false;

  tipoBusqueda: FormControl = new FormControl(TipoBusquedaUsuario.CI);
  busquedaTexto: FormControl = new FormControl('');
  usuarioSeleccionado: UsuarioBusqueda | null = null;

  usuarios$: Observable<UsuarioBusqueda[]> = of([]);
  busquedaUsuario$: Subject<string> = new Subject();

  TipoBusquedaUsuario = TipoBusquedaUsuario;

  // Datos mock para pruebas
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

    this.usuarios$ = this.busquedaUsuario$.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      switchMap((texto: string) => {
        if (!texto) return of([]);
        return this.buscarUsuarios(texto);
      })
    );
  }

  buscarUsuarios(texto: string): Observable<UsuarioBusqueda[]> {
    const textoBusqueda = texto.toLowerCase();

    if (this.tipoBusqueda.value === TipoBusquedaUsuario.CI) {
      // Búsqueda por CI (eliminar puntos y guiones para comparar)
      const ciLimpia = texto.replace(/[.\-]/g, '');
      return of(this.usuariosMock.filter(u =>
        u.numeroDocumento.replace(/[.\-]/g, '').includes(ciLimpia)
      ));
    } else {
      // Búsqueda por nombre completo
      return of(this.usuariosMock.filter(u =>
        `${u.nombre} ${u.apellido}`.toLowerCase().includes(textoBusqueda)
      ));
    }
  }

  buscarUsuario(event: Event): void {
    const texto = (event.target as HTMLInputElement).value;
    if (!texto) {
      return;
    }
    this.busquedaUsuario$.next(texto);
  }

  cambioTipoBusqueda(): void {
    this.busquedaTexto.setValue('');
    this.usuarioSeleccionado = null;
  }

  seleccionarUsuario(event: TypeaheadMatch | null): void {
    if (event) {
      this.usuarioSeleccionado = event.item;
      const textoUsuario = this.tipoBusqueda.value === TipoBusquedaUsuario.CI
        ? event.item.numeroDocumento
        : `${event.item.nombre} ${event.item.apellido}`;
      this.busquedaTexto.setValue(textoUsuario);
    } else {
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
    this.cerrarPopup();
  }
}
