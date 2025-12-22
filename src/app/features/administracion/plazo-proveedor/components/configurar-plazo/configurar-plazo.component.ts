import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { campoVacio } from 'src/app/shared/utils/functions';
import { ProveedorService } from '../../../puntos-recepcion/services/proveedor.service';

@Component({
    selector: 'app-configurar-plazo',
    templateUrl: './configurar-plazo.component.html',
    standalone: false
})
export class ConfigurarPlazoComponent implements OnInit {

    form!: FormGroup;
    proveedores: ProveedorDTO[] = [];
    valorAnterior?: string = '';

    constructor(
        private readonly fb: FormBuilder,
        private readonly seguridadService: SeguridadService,
        private readonly proveedorService: ProveedorService,
        private readonly actualizarServ: ActualizarService
    ) {
        this.inicializarFormulario();
    }

    ngOnInit(): void {
        this.cargarProveedores();
    }

    private inicializarFormulario(): void {
        this.form = this.fb.group({
            proveedor: ['', Validators.required],
            cantidadDias: ['', [Validators.required]]
        });

    }

    private cargarProveedores(): void {
        this.proveedores = this.seguridadService.obtenerProveedores();

        if (this.proveedores.length === 1) {
            this.form.get('proveedor')?.setValue(this.proveedores[0].id);
            this.cambioProveedor({ target: { value: this.proveedores[0].id } });
        }
    }

    private cargarConfiguracionExistente(idProveedor: number): void {
        this.proveedorService.obtenerProveedor(idProveedor).subscribe(
            proveedor => {
                this.form.get('cantidadDias')?.setValue(proveedor.plazoEntrega);
                this.form.get('cantidadDias')?.markAsUntouched();
            }
        );
        
    }

    campoVacio(control: string): boolean {
        return campoVacio(control, this.form);
    }

    cambioProveedor(evento: any): void {
        const proveedorControl = this.form.get('proveedor');
        const valorActual = proveedorControl?.value;
       
        // Si el formulario tiene cambios (además del proveedor)
        const huboCambios = this.form.get('cantidadDias')?.dirty || this.form.get('cantidadDias')?.touched;

        if (huboCambios) {
            proveedorControl?.setValue(this.valorAnterior);
            this.actualizarServ.confirmar('Hay cambios sin guardar. Si continúa, se perderán. ¿Desea continuar?',
                () => {
                    proveedorControl?.setValue(valorActual);
                    this.valorAnterior = valorActual;
                    if (valorActual !== '') {
                        this.cargarConfiguracionExistente(valorActual);
                    } else {
                        this.form.get('cantidadDias')?.setValue('');
                        this.form.get('cantidadDias')?.markAsUntouched();
                        this.form.get('cantidadDias')?.markAsPristine();
                    }
                },
                () => {
                    proveedorControl?.setValue(this.valorAnterior);
                }
            );
           
        } else{
            this.valorAnterior = valorActual;
            if (valorActual !== '') {
                this.cargarConfiguracionExistente(valorActual);
            } else {
                this.form.get('cantidadDias')?.setValue('');
                this.form.get('cantidadDias')?.markAsUntouched();
                this.form.get('cantidadDias')?.markAsPristine();
            }
        }

    }


    
    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        this.proveedorService.actualizarPlazoEntrega(this.form.get('proveedor')?.value,
            this.form.get('cantidadDias')?.value).subscribe(
                () => {
                    this.actualizarServ.mensajeCorrecto('Plazo de entrega actualizado correctamente');
                    
                    this.form.get('cantidadDias')?.markAsUntouched();
                    this.form.get('cantidadDias')?.markAsPristine();
                });

    }
}
