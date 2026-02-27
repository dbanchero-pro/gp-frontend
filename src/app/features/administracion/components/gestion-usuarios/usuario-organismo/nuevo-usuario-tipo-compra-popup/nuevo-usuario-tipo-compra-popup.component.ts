import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { InputDocumentoComponent } from 'src/app/shared/components/input-documento/input-documento.component';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoMensajeEnum } from 'src/app/shared/enum/tipo-mensaje.enum';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { TipoCompraDTO } from 'src/app/shared/models/sice/tipo-compra.model';
import { UsuarioOrganismoDTO } from 'src/app/shared/models/usuario/usuario-organismo.model';
import { TipoCompraService } from 'src/app/shared/services/sice/tipo-compra.service';
import { UsuarioOrganismoService } from 'src/app/shared/services/usuario/usuario-organismo.service';
import { UsuarioOrganismoPerfilService } from 'src/app/shared/services/usuario/usuario-perfil.service';
import { transformarNroDocumento } from 'src/app/shared/utils/functions';
import { Logger } from 'src/app/shared/utils/logger';

@Component({
    selector: 'app-nuevo-usuario-tipo-compra-popup',
    templateUrl: './nuevo-usuario-tipo-compra-popup.component.html',
    styleUrls: ['./nuevo-usuario-tipo-compra-popup.component.scss'],
})
export class NuevoUsuarioTipoCompraPopupComponent
    extends PopupBaseComponent
    implements OnInit
{
    @Output() guardarEvento = new EventEmitter<{
        idUsuario: string;
        idTipoCompra: string;
        esEditorPrincipal: boolean;
        esEditor: boolean;
        esValidador: boolean;
        esAprobador: boolean;
    }>();

    @Input() titulo = 'Asignar roles por tipo de compra';
    @Input() tipoPerfil!: TipoPerfil;

    usuario!: UsuarioOrganismoDTO;
    tiposCompra: TipoCompraDTO[] = [];
    tienePermisoTodas = false;
    mensajePermiso = '';
    deshabilitarGuardar = true;
    buscando = false;
    intentoGuardar = false;

    @ViewChild('inputDocumento') inputDocumento!: InputDocumentoComponent;

    constructor(
        private readonly fb: FormBuilder,
        private readonly usuarioOrganismoService: UsuarioOrganismoService,
        private readonly usuarioOrganismoPerfilService: UsuarioOrganismoPerfilService,
        private readonly tipoCompraService: TipoCompraService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.fb.group({
            nroDocumento: ['', [Validators.minLength(7), Validators.required]],
            idTipoCompra: ['', Validators.required],
            esEditorPrincipal: [false],
            esEditor: [false],
            esValidador: [false],
            esAprobador: [false],
        });

        this.obtenerTiposCompra();
    }

    obtenerTiposCompra(): void {
        this.tipoCompraService.obtenerTiposCompraSinPaginado().subscribe({
            next: (res) => {
                this.tiposCompra = res;
            },
            error: (error) => {
                Logger.logError('Error al obtener tipos de compra', error);
            },
        });
    }

    guardar(): void {
        this.intentoGuardar = true;

        if (this.form.invalid || this.tienePermisoTodas) {
            return;
        }

        if (!this.alMenosUnRolSeleccionado()) {
            return;
        }

        const dataAGuardar = {
            idUsuario: transformarNroDocumento(
                this.form.get('nroDocumento')!.value
            ),
            idTipoCompra: this.form.get('idTipoCompra')!.value,
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
        this.usuarioOrganismoService
            .obtenerInformacionUsuarioSice(idUsuario, this.tipoPerfil)
            .subscribe({
                next: (usuario: UsuarioOrganismoDTO) => {
                    this.actualizarService.capturarErrores = true;
                    this.usuario = usuario;
                    this.showMsg = false;
                    this.buscando = false;
                    this.intentoGuardar = false;
                    this.deshabilitarGuardar = false;
                },
                error: (error) => {
                    this.usuario = {} as UsuarioOrganismoDTO;
                    this.buscando = false;
                    this.procesarError(error, 'Error al obtener usuario');
                },
            });
    }
}


