import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProveedorService } from 'src/app/features/administracion/puntos-recepcion/services/proveedor.service';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { Pais } from 'src/app/shared/enum/pais.enum';
import { TipoDocumentoUsuario } from 'src/app/shared/enum/tipo-documento-usuario.enum';
import { PaisDTO } from 'src/app/shared/models/common/pais.model';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { TipoDocumentoUsuarioDTO } from 'src/app/shared/models/usuario/tipo-documento-usuario.model';
import { UsuarioProveedorDTO } from 'src/app/shared/models/usuario/usuario-proveedor.model';
import { UsuarioDTO } from 'src/app/shared/models/usuario/usuario.model';
import { PaisService } from 'src/app/shared/services/usuario/pais.service';
import { TipoDocumentoUsuarioService } from 'src/app/shared/services/usuario/tipo-documento-usuario.service';
import { UsuarioService } from 'src/app/shared/services/usuario/usuario.service';
import { volverConConfirmacion } from 'src/app/shared/utils/functions';
import { UsuarioProveedorGuardarDTO } from '../../../models/usuario-proveedor-guardar.model';
@Component({
    selector: 'app-agregar-modificar-proveedor-popup',
    templateUrl: './agregar-modificar-proveedor-popup.component.html',
    styleUrls: ['./agregar-modificar-proveedor-popup.component.scss'],
    standalone: false,
})
export class AgregarModificarProveedorPopupComponent
    extends PopupBaseComponent
    implements OnInit {
    @Input() datosIniciales!: {  pais: string,
                tipoDoc: string,
                nroDoc: string,
                correo: string,
        proveedor: string,
        nombre: string,
        fechaNombreConfirmado: Date | null,
        idUsuario: string,
        id?: string,};

    @Output() guardarEvento = new EventEmitter<UsuarioProveedorGuardarDTO>();

    proveedores: ProveedorDTO[] = [];
    paises: PaisDTO[] = [];
    tipoDocumentoOpciones: TipoDocumentoUsuarioDTO[] = [];
    tituloFormulario = '';
    idUsuarioBuscado = '';

    TipoDocumentoUsuario = TipoDocumentoUsuario;

    private _resultadoBusqueda?: UsuarioProveedorDTO;
    set resultadoBusqueda(v: typeof this._resultadoBusqueda) {
        this._resultadoBusqueda = v;
        const ctrl = this.form.get('nombre')!;
        if (v) {
            ctrl.setValue(v.nombre);
            if (v.fechaNombreConfirmado) {
                ctrl.disable();
            } else {
                ctrl.enable();
            }
        } else {
            ctrl.reset();
            ctrl.enable();
        }
    }

    get resultadoBusqueda() {
        return this._resultadoBusqueda;
    }

    constructor(
        private readonly fb: FormBuilder,
        private readonly paisService: PaisService,
        private readonly tipoDocService: TipoDocumentoUsuarioService,
        private readonly usuarioService: UsuarioService,
        private readonly proveedorService: ProveedorService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.inicializarFormulario();
        this.cargarPaisesYSeleccionarDefault();
        this.cargarProveedoresDelUsuario();
    }

    private inicializarFormulario(): void {
        this.form = this.fb.group({
            pais: ['', Validators.required],
            tipoDoc: ['', Validators.required],
            nroDoc: ['', Validators.required],
            correo: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
                ],
            ],
            nombre: ['', Validators.required],
            proveedor: ['', Validators.required],
        });

        // Es una alta
        if (!this.datosIniciales) {
            this.tituloFormulario = 'Agregar usuario proveedor';
            this.idUsuarioBuscado = '';
            this.deshabilitarFormulario();
        }
        else { // es una modificación
            this.form.patchValue({
                pais: this.datosIniciales.pais,
                tipoDoc: this.datosIniciales.tipoDoc,
                nroDoc: this.datosIniciales.nroDoc,
                correo: this.datosIniciales.correo,
                proveedor: this.datosIniciales.proveedor,
            });

            this.habilitarFormulario();

            this.form.get('nombre')?.setValue(this.datosIniciales.nombre);
            this.form.get('pais')?.disable();
            this.form.get('tipoDoc')?.disable();
            this.form.get('nroDoc')?.disable();
            this.form.get('proveedor')?.disable();

            if (this.datosIniciales.fechaNombreConfirmado) {
                this.form.get('nombre')?.disable();
            }

            this.tituloFormulario = 'Modificar usuario proveedor';

        }
    }

    private cargarProveedoresDelUsuario(): void {
        this.proveedorService.obtenerProveedoresRupe().subscribe((proveedores) => {
            this.proveedores = proveedores;
            if (this.proveedores.length === 1) {
                this.form.get('proveedor')?.setValue(this.proveedores[0].id);
            }
        });
    }

    private cargarPaisesYSeleccionarDefault(): void {
        this.paisService.obtenerTodos().subscribe((paises) => {
            this.paises = paises;
            const uy = paises.find((p) => p.id === Pais.URUGUAY);
            if( this.datosIniciales?.pais ) {
                this.form.get('pais')!.setValue(this.datosIniciales.pais);
                this.cambioPais();
            } else if (uy) {
                this.form.get('pais')!.setValue(uy.id);
                this.cambioPais();
            }
            
        });
    }

    cambioPais() {
        const pais = this.form.get('pais')?.value;
        if (!pais) { this.tipoDocumentoOpciones = []; return; }
        this.tipoDocService.obtenerTiposDocumentoUsuario(0, 1000, 'id.idTipoDocumento,asc', pais)
            .subscribe(resp => {
                this.tipoDocumentoOpciones = resp.content;
                const uy = pais === Pais.URUGUAY;
                if (this.datosIniciales) {
                    this.form.get('tipoDoc')!.setValue(this.datosIniciales.tipoDoc);
                } else if (uy) {
                    this.form.get('tipoDoc')!.setValue(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
                }
                //Fuerzo seteo en el suscribe
                else if (this.tipoDocumentoOpciones.length === 1) {
                    this.form.get('tipoDoc')!.setValue(this.tipoDocumentoOpciones[0].idTipoDocumento);
                }
                else if (this.tipoDocumentoOpciones.length > 1 && !this.form.get('tipoDoc')?.value) {
                    this.form.get('tipoDoc')!.setValue(this.tipoDocumentoOpciones[0].idTipoDocumento);
                }

                this.cambioTipoDoc();
            });
    }

    cambioTipoDoc() {
        setTimeout(() => {
            const ctrl = this.form.get('nroDoc');
            if (ctrl) {
                ctrl.setValue(ctrl.value);
            }
        });
    }

    override buscar(): void {
        this.idUsuarioBuscado = '';
        if (this.form.get('pais')!.invalid || this.form.get('tipoDoc')!.invalid || this.form.get('nroDoc')!.invalid) {
            this.procesarError('Complete país, tipo y número de documento.');
            return;
        }

        this.resultMsg = [];
        this.showMsg = false;

        const formValue = this.form.getRawValue();
        this.idUsuarioBuscado = `${formValue.pais}-${formValue.tipoDoc}-${formValue.nroDoc}`.toLowerCase();
        this.deshabilitarCapturaErrores();
        this.usuarioService.buscarUsuarioPorId(this.idUsuarioBuscado).subscribe({
            next: (res: UsuarioDTO) => {
                this.resultMsg = [];
                this.showMsg = false;
                this.actualizarService.capturarErrores = true;

                if (!res) {
                    this.resultadoBusqueda = undefined;
                    return;
                }

                const usuarioProveedor: UsuarioProveedorDTO =
                    res as UsuarioProveedorDTO;

                this.resultadoBusqueda = {
                    id: usuarioProveedor.id,
                    pais: usuarioProveedor.pais,
                    tipoDocumento: usuarioProveedor.tipoDocumento,
                    nroDocumento: usuarioProveedor.nroDocumento,
                    nombre: usuarioProveedor.nombre,
                    correo: usuarioProveedor.correo ?? '',
                    proveedor: usuarioProveedor.proveedor,
                    fechaNombreConfirmado:
                        usuarioProveedor.fechaNombreConfirmado,
                };

                this.actualizarService.capturarErrores = true;

            },
            error: (err) => {
                this.resultadoBusqueda = undefined;
                this.procesarError(err, 'Error al buscar el usuario.');

            },
        });

        this.habilitarFormulario();
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        let proveedorSeleccionado: ProveedorDTO | undefined;
        const formData = this.form.getRawValue();

        if (this.proveedores.length == 1) {
            proveedorSeleccionado = this.proveedores[0];
        } else {
            proveedorSeleccionado = this.proveedores.find((p) => String(p.id) === String(formData.proveedor));
        }

        if (!proveedorSeleccionado) {
            return;
        }

        if (!this.datosIniciales && this.idUsuarioBuscado != this.generarIdUsuario()) {
            this.procesarError('El documento ingresado no coincide con el buscado.');
            return;
        }

        if (!this.resultadoBusqueda && !this.datosIniciales) {
            const usuario: UsuarioProveedorGuardarDTO = {
                id: this.generarIdUsuario(),
                nombre: this.form.value.nombre,
                pais: { id: formData.pais },
                tipoDocumento: { id: formData.tipoDoc, idPais: formData.pais },
                nroDocumento: formData.nroDoc,
                correo: this.form.value.correo,
                proveedor: proveedorSeleccionado,
            };
            this.guardarEvento.emit(usuario);
        } else if (this.resultadoBusqueda || this.datosIniciales) {
            const usuario: UsuarioProveedorGuardarDTO = {
                id: this.resultadoBusqueda?.id ?? // viene de la búsqueda,
                    this.datosIniciales?.idUsuario, // de la modificacion
                nombre: this.form.value.nombre,
                correo: this.form.value.correo,
                proveedor: proveedorSeleccionado,
            };
            this.guardarEvento.emit(usuario);
        }
    }

    generarIdUsuario(): string {
        const pais = this.form.get('pais')?.value;
        const tipoDoc = this.form.get('tipoDoc')?.value;
        const nroDoc = this.form.get('nroDoc')?.value;

        if (pais && tipoDoc && nroDoc) {
            return `${pais.toLowerCase()}-${tipoDoc.toLowerCase()}-${nroDoc}`;
        }
        return '';
    }

    volverConConfirmacion(): void {
        volverConConfirmacion(this.actualizarService, () => this.cerrarPopup(), this.form);
    }

    deshabilitarFormulario(): void {
        this.form.get('nombre')?.disable();
        this.form.get('proveedor')?.disable();
        this.form.get('correo')?.disable();
    }

    habilitarFormulario(): void {
        this.form.get('nombre')?.enable();
        this.form.get('proveedor')?.enable();
        this.form.get('correo')?.enable();
    }

}
