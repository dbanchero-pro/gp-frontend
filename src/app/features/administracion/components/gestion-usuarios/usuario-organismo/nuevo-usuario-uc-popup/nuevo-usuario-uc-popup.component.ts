import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { TipoPerfil } from 'src/app/shared/enum/tipo-perfil.enum';
import { UsuarioOrganismoDTO } from 'src/app/shared/models/usuario/usuario-organismo.model';
import { UsuarioOrganismoService } from 'src/app/shared/services/usuario/usuario-organismo.service';

@Component({
    selector: 'app-nuevo-usuario-uc-popup',
    templateUrl: './nuevo-usuario-uc-popup.component.html',
    styleUrls: ['./nuevo-usuario-uc-popup.component.scss'],

    standalone: false
})
export class NuevoUsuarioUcPopupComponent
    extends PopupBaseComponent
    implements OnInit {
    @Output() guardarEvento = new EventEmitter<any>();

    @Input() titulo = 'Agregar persona';

    @Input() tipoPerfil!: TipoPerfil;

    protected usuarios: UsuarioOrganismoDTO[] = [];

    protected noSeEncontraronUsuarios = false;

    protected intentoGuardar = false;

    constructor(
        private readonly fb: FormBuilder,
        private readonly usuarioOrganismoService: UsuarioOrganismoService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.fb.group({
            usuario: ['', Validators.required],
            organismo: [null, Validators.required],
            esEditorPrincipal: [false],
            esEditor: [false],
            esValidador: [false],
            esAprobador: [false],
        });
    }

    onCambioFiltro(filtro: any): void {
        const idInciso = filtro.idInciso;
        const idUnidadEjecutora = filtro.idUnidadEjecutora;
        const idUnidadCompra = filtro.idUnidadCompra;
        if (
            this.form.get('organismo')?.valid &&
            idInciso &&
            idUnidadEjecutora &&
            idUnidadCompra
        ) {
            this.cargarUsuariosPorUnidadCompra(
                idInciso,
                idUnidadEjecutora,
                idUnidadCompra
            );
        } else {
            this.usuarios = [];
            this.form.get('usuario')?.setValue('');
            this.showMsg = false;
        }
    }

    cargarUsuariosPorUnidadCompra(
        idInciso: number,
        idUnidadEjecutora: number,
        idUnidadCompra: number
    ): void {
        const filtros = {
            idInciso: idInciso,
            idUnidadEjecutora: idUnidadEjecutora,
            idUnidadCompra: idUnidadCompra,
        };
        this.deshabilitarCapturaErrores();
        this.usuarioOrganismoService
            .obtenerUsuariosOrganismoNoExiste(this.tipoPerfil, filtros)
            .subscribe({
                next: (res: UsuarioOrganismoDTO[]) => {
                    this.actualizarService.capturarErrores = true;
                    //Reseteo el array
                    this.usuarios = [];
                    this.usuarios.push(...res);
                    this.noSeEncontraronUsuarios = this.usuarios.length === 0;
                    if (this.noSeEncontraronUsuarios) {
                        this.form.get('usuario')?.setValue('');
                    }
                    this.showMsg = false;
                },
                error: (error) => {
                    this.usuarios = [];
                    this.noSeEncontraronUsuarios = true;
                    this.form.get('usuario')?.setValue('');
                    this.procesarError(error, 'Error al cargar usuarios');
                },
            });
    }

    guardar(): void {
        this.intentoGuardar = true;
        const usuarioSeleccionado = this.form.get('usuario')!.value;
        this.form.get('organismo')?.markAsTouched();
        this.form.get('usuario')?.markAsTouched();

        if (!usuarioSeleccionado || this.form.get('organismo')?.invalid || !this.alMenosUnRolSeleccionado()) {
            return;
        }

        const dataAGuardar = {
            idUsuario: usuarioSeleccionado,
            unidadCompra: this.form.get('organismo')?.value,
            roles: {
                esEditorPrincipal: this.form.get('esEditorPrincipal')?.value || false,
                esEditor: this.form.get('esEditor')?.value || false,
                esValidador: this.form.get('esValidador')?.value || false,
                esAprobador: this.form.get('esAprobador')?.value || false,
            }
        };

        this.guardarEvento.emit(dataAGuardar);
        this.cerrarPopup();
    }

    alMenosUnRolSeleccionado(): boolean {
        return (
            this.form.get('esEditorPrincipal')?.value ||
            this.form.get('esEditor')?.value ||
            this.form.get('esValidador')?.value ||
            this.form.get('esAprobador')?.value
        );
    }

    validarPopUpInvalido(): boolean {
        if (this.intentoGuardar) {
            return this.form.invalid || !this.alMenosUnRolSeleccionado();
        }
        return this.form.invalid;
    }

    transformarNroDocumento(nroDocumento: string): string {
        return 'uy-ci-' + nroDocumento;
    }

}


