import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoMensajeEnum } from 'src/app/shared/enum/tipo-mensaje.enum';
import { UsuarioAsignadoDTO } from '../../../models/usuario-asignado.model';

@Component({
  selector: 'app-modificar-usuario-popup',
  templateUrl: './modificar-usuario-popup.component.html',
  styleUrls: ['./modificar-usuario-popup.component.scss'],
})
export class ModificarUsuarioPopupComponent extends PopupBaseComponent implements OnInit {
  @Input() usuario!: UsuarioAsignadoDTO;
  @Output() guardarEvento = new EventEmitter<UsuarioAsignadoDTO>();

  override form!: FormGroup;
  intentoGuardar = false;
  guardando = false;

  constructor(private readonly fb: FormBuilder) {
    super();
  }

  override ngOnInit(): void {
    if (!this.usuario) {
      return;
    }

    // Inicializar el formulario con los roles actuales del usuario
    this.form = this.fb.group({
      esEditorPrincipal: [this.usuario.roles.includes('Editor Principal')],
      esEditor: [this.usuario.roles.includes('Editor')],
      esValidador: [this.usuario.roles.includes('Validador')],
      esAprobador: [this.usuario.roles.includes('Aprobador')],
    });
  }

  alMenosUnRolSeleccionado(): boolean {
    const valores = this.form.value;
    return valores.esEditorPrincipal || valores.esEditor || valores.esValidador || valores.esAprobador;
  }

  guardar(): void {
    this.intentoGuardar = true;

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

    const usuarioModificado: UsuarioAsignadoDTO = {
      ...this.usuario,
      roles: roles
    };

    this.guardarEvento.emit(usuarioModificado);
    this.guardando = false;
  }

  cancelar(): void {
    this.cerrarPopup();
  }
}


