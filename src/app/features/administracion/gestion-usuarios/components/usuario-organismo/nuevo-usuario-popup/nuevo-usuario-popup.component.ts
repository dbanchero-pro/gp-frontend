import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InputDocumentoComponent } from 'src/app/shared/components/input-documento/input-documento.component';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoMensajeEnum } from 'src/app/shared/enum/tipo-mensaje.enum';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { UsuarioOrganismoDTO } from 'src/app/shared/models/usuario/usuario-organismo.model';
import { UsuarioOrganismoService } from 'src/app/shared/services/usuario/usuario-organismo.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { transformarNroDocumento } from 'src/app/shared/utils/functions';
import { Logger } from 'src/app/shared/utils/logger';

@Component({
    selector: 'app-nuevo-usuario-popup',
    templateUrl: './nuevo-usuario-popup.component.html',
    styleUrls: ['./nuevo-usuario-popup.component.scss'],
    standalone: false,
})
export class NuevoUsuarioPopupComponent
    extends PopupBaseComponent
    implements OnInit
{
    @Output() guardarEvento = new EventEmitter<{ idUsuario: string }>();

    @Input() submitText = 'Guardar';
    @Input() titulo = 'Agregar persona';
    @Input() tipoPerfil!: TipoPerfil;

    usuario!: UsuarioOrganismoDTO;
    tienePermisoTodas = false;
    mensajePermiso = '';
    deshabilitarGuardar = true;
    buscando = false;
    intentoGuardar = false;

    @ViewChild('inputDocumento') inputDocumento!: InputDocumentoComponent;
    constructor(
        private readonly fb: FormBuilder,
        private readonly usuarioOrganismoService: UsuarioOrganismoService,
        private readonly usuarioOrganismoPerfilService: UsuarioOrganismoPerfilService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.fb.group({
            nroDocumento: ['', [Validators.minLength(7), Validators.required]],
            esEditorPrincipal: [false],
            esEditor: [false],
            esValidador: [false],
            esAprobador: [false],
        });
    }

    guardar(): void {
        this.intentoGuardar = true;

        if (this.form.invalid || this.tienePermisoTodas || !this.alMenosUnRolSeleccionado()) {
            return;
        }

        const dataAGuardar = {
            idUsuario: transformarNroDocumento(
                this.form.get('nroDocumento')!.value
            ),
            esEditorPrincipal: this.form.get('esEditorPrincipal')!.value,
            esEditor: this.form.get('esEditor')!.value,
            esValidador: this.form.get('esValidador')!.value,
            esAprobador: this.form.get('esAprobador')!.value,
        };

        this.guardarEvento.emit(dataAGuardar);
        this.cerrarPopup();
    }

    alMenosUnRolSeleccionado(): boolean {
        return (
            this.form.get('esEditorPrincipal')!.value ||
            this.form.get('esEditor')!.value ||
            this.form.get('esValidador')!.value ||
            this.form.get('esAprobador')!.value
        );
    }

    override buscar(): void {
        if (this.inputDocumento) {
            this.inputDocumento.markAsTouched();
        }
        
        if (this.form.get('nroDocumento')!.invalid) {
            return;
        }
        this.obtenerUsuario(this.form.get('nroDocumento')!.value);
    }

    obtenerUsuario(nroDocumento: string): void {
        const idUsuario = 'uy-ci-' + nroDocumento;
        this.tienePermisoTodas = false;
        this.mensajePermiso = '';

        this.deshabilitarCapturaErrores();
        this.buscando = true;
        this.usuarioOrganismoService.obtenerInformacionUsuarioSice(idUsuario, this.tipoPerfil)
            .subscribe({
                next: (usuario: UsuarioOrganismoDTO) => {
                    this.actualizarService.capturarErrores = true;
                    this.usuario = usuario;
                    this.showMsg = false;
                    this.buscando = false;
                    this.intentoGuardar = false;

                    // Verificar si el usuario ya tiene permiso (permiso 0)
                    this.verificarPermisoTodas(nroDocumento);
                },
                error: (error) => {
                    this.usuario = {} as UsuarioOrganismoDTO;
                    this.buscando = false;
                    this.procesarError(error, 'Error al obtener usuario');
                },
            });
    }

    verificarPermisoTodas(nroDocumento: string): void {
        const filtros = {
            nroDocumento: nroDocumento,
            idInciso: 0,
            idUnidadEjecutora: 0,
            idUnidadCompra: 0,
            tipoPerfil: this.tipoPerfil,
        };

        this.usuarioOrganismoPerfilService
            .obtenerTodos(filtros, 0, 1)
            .subscribe({
                next: (response) => {
                    if (response.content && response.content.length > 0) {
                        this.tienePermisoTodas = true;
                        this.mensajePermiso =
                            'El usuario ya cuenta con el permiso sobre todas sus unidades de compra.';
                        this.resultMsg = [this.mensajePermiso];
                        this.typeMsg = TipoMensajeEnum.warn;
                        this.showMsg = true;
                        this.deshabilitarGuardar = true;
                    } else {
                        this.tienePermisoTodas = false;
                        this.mensajePermiso = '';
                        this.showMsg = false;
                        this.deshabilitarGuardar = false;
                    }
                },
                error: (error) => {
                    Logger.logError(
                        'Error al verificar permiso global ',
                        error
                    );
                },
            });
    }
}
