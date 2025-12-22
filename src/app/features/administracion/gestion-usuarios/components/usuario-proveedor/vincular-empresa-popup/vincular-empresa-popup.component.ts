import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ProveedorService } from 'src/app/features/administracion/puntos-recepcion/services/proveedor.service';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { UsuarioProveedorService } from 'src/app/shared/services/usuario/usuario-proveedor.service';
import { UsuarioProveedorGuardarDTO } from '../../../models/usuario-proveedor-guardar.model';

@Component({
    selector: 'app-vincular-empresa-popup',
    templateUrl: './vincular-empresa-popup.component.html',
    styleUrls: ['./vincular-empresa-popup.component.scss'],
    standalone: false,
})
export class VincularEmpresaPopupComponent extends PopupBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<any>();
    @Input() datosIniciales: any;

    proveedores: ProveedorDTO[] = [];


    constructor(
        private readonly fb: FormBuilder,
        private readonly proveedorService: ProveedorService,
        private readonly usuarioProveedorService: UsuarioProveedorService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.form = this.fb.group({
            proveedor: ['', Validators.required],
            correo: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
        });
        this.proveedorService.obtenerProveedoresRupe().subscribe((proveedores) => {
            this.proveedores = proveedores;
            if (this.proveedores.length === 1) {
                this.form.get('proveedor')?.setValue(this.proveedores[0].id);
            }
        });

        if (this.proveedores.length === 1) {
            this.form.get('proveedor')?.setValue(this.proveedores[0].id);
        }
    }

    guardar(): void {

        if (this.form.invalid) { this.form.markAllAsTouched(); return; }

        const proveedorId = this.form.get('proveedor')!.value;
        const proveedor = this.proveedores.find(p => (p.id + '') === (proveedorId + ''));
        this.showMsg = false;
        if (!proveedor) {
            setTimeout(() => {
                this.resultMsg = ['Proveedor no válido.'];
                this.showMsg = true;
            }, 100);
           
            return;
        }

        const usuario: UsuarioProveedorGuardarDTO = {
            id: this.datosIniciales?.idUsuario?.toLowerCase() ?? '',
            nombre: this.form.value.nombre,
            correo: this.form.value.correo,
            proveedor: proveedor
        };
        this.deshabilitarCapturaErrores();
        this.usuarioProveedorService.guardarUsuarioProveedor(usuario).subscribe({
            next: () => {
                this.guardarEvento.emit(usuario);
                this.cerrarPopup();
                this.actualizarService.capturarErrores = true;
            },
            error: (error) => {
                this.procesarError(error, 'Error al vincular proveedor');
                this.actualizarService.capturarErrores = true;
            }
        });
    }

}
