import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { CanComponentDeactivate } from 'src/app/shared/utils/can-component-deactivate';
import { ActualizarService } from '../../../../../../shared/services/common/actualizar.service';
import { SeguridadService } from '../../../../../../shared/services/common/seguridad.service';
import { ZonaService } from '../../../../../../shared/services/zona.service';
import { campoVacio, formularioTocado } from '../../../../../../shared/utils/functions';
import { IFuncionarioPuntoRecepcionDTO } from '../../../models/funcionario-punto-recepcion.model';
import { IPuntoRecepcionDTO } from '../../../models/punto-recepcion.model';
import { ZonaDto } from '../../../models/zona.model';
import { PuntosRecepcionService } from '../../../services/puntosRecepcion.service';

@Component({
    selector: 'app-agregar-modificar-punto-recepcion',
    templateUrl: './agregar-modificar-punto-recepcion.component.html',
    styleUrl: './agregar-modificar-punto-recepcion.component.scss',
    standalone: false,
})
export class AgregarModificarPuntoRecepcionComponent implements OnInit, CanComponentDeactivate {

    form!: FormGroup;
    bsModalRef!: BsModalRef;

    puntoRecepcion!: IPuntoRecepcionDTO;
    funcionariosResponsables: IFuncionarioPuntoRecepcionDTO[] = [];
    idPc!: number;
    modoIngreso: boolean = false;

    subTituloRequeridos = "Los campos con * son obligatorios";
    colFiltro: string = 'col-lg-3';
    colTabla: string = 'col-lg-9';

    acciones: AccionBoton[] = [];
    opcionesZona: ZonaDto[] = [];
    opcionesLocalidad: any[] = [];
    correoValido = true;

    tienePermisoGuardar = this.seguridad.tienePermiso('GC_GESTION_PUNTOS.ALTA') || this.seguridad.tienePermiso('GC_GESTION_PUNTOS.MODIFICACION');

    constructor(
        private readonly router: Router,
        private readonly activatedRoute: ActivatedRoute,
        private readonly formBuilder: FormBuilder,
        private readonly actualizarServ: ActualizarService,
        private readonly zonaService: ZonaService,
        private readonly puntoRecepcionService: PuntosRecepcionService,
        protected readonly seguridad: SeguridadService,
    ) {
        this.activatedRoute.params.subscribe(params => {
            this.idPc = +params['idPC'];
            this.modoIngreso = !this.idPc;
        });


    }

    ngOnInit(): void {

        this.form = this.formBuilder.group({
            idPc: [{ value: '', disabled: true }, Validators.required],
            nombre: ['', Validators.required],
            zona: ['', Validators.required],
            direccion: ['', Validators.required],
            telefonos: ['', Validators.required],
            correosElectronicos: ['', [Validators.required, Validators.pattern('^([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})(;\\s*[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})*$')]], //NOSONAR
            horarios: ['', Validators.required],
            localidad: ['', Validators.required],
            latitud: ['', [Validators.pattern(/^[+-]?(?:90(?:\.0{1,6})?|[0-8]?\d(?:\.\d{1,6})?)$/)]],
            longitud: ['', [Validators.pattern(/^[+-]?(?:180(?:\.0{1,6})?|(?:1[0-7]\d|\d?\d)(?:\.\d{1,6})?)$/)]],
            observaciones: [''],
            codigoPostal: [undefined],
            organismo: [{ value: null, disabled: !this.modoIngreso }],
        });

        this.cargarDepartamentos();
        this.cargarFormulario();
    }

    cargarFormulario() {
        if (!this.modoIngreso) {

            this.form.get('nombre')?.disable();

            this.puntoRecepcionService.obtenerPuntoRecepcion(this.idPc).subscribe((res: any) => {
                this.puntoRecepcion = res;

                this.form.patchValue({
                    idPc: res.Id,
                    nombre: res.nombre,
                    direccion: res.direccion,
                    zona: res.zona.id,
                    latitud: this.obtenerString(res.latitud),
                    longitud: this.obtenerString(res.longitud),
                    localidad: res.localidad,
                    telefonos: res.telefonos,
                    correosElectronicos: res.correosElectronicos,
                    horarios: res.horarios,
                    observaciones: res.observaciones,
                    codigoPostal: res.codigoPostal,
                    organismo: {
                        idInciso: res.unidadCompra.idInciso,
                        idUnidadEjecutora: res.unidadCompra.idUnidadEjecutora,
                        idUnidadCompra: res.unidadCompra.idUnidadCompra
                    }
                });

                // Reseteo el estado "dirty" para evitar el falso positivo
                setTimeout(() => {
                    this.form.markAsPristine();
                }, 500);
            });
        }
        else {
            this.form.get('organismo')?.reset();
        }
    }

    obtenerString(longitud: number | undefined): string | undefined {
        if (longitud !== undefined) {
            return longitud.toString();
        }
        return undefined;
    }

    cargarDepartamentos() {
        this.zonaService.obtenerZonas().subscribe((res) => {
            this.opcionesZona = res;
        });
    }

    validarCorreo() {
        this.correoValido = this.form.get('correosElectronicos')?.value === "" || !this.form.get('correosElectronicos')?.invalid;
    }

    manejarAccion(accion: AccionBoton) {
        if (accion.url) this.router.navigate(accion.url);
    }

    guardar(): void {
        if (!this.esFormularioValido()) {
            return;
        }

        const puntoRecepcion = this.obtenerDto();
        if (this.modoIngreso) {
            this.form.markAsPristine();
            this.puntoRecepcionService.altaPuntoRecepcion(puntoRecepcion).subscribe(() => {
                this.volver();
                window.setTimeout(() => {
                    this.actualizarServ.mensajeCorrecto('Se ha guardado el punto de recepción de forma exitosa.');
                }, 1000);
            });
        } else {
            this.form.markAsPristine();
            this.puntoRecepcionService.modificarPuntoRecepcion(this.idPc, puntoRecepcion).subscribe(() => {
                this.volver();
                window.setTimeout(() => {
                    this.actualizarServ.mensajeCorrecto('Se ha guardado el punto de recepción de forma exitosa.');
                }, 1000);
            });
        }

    }

    private esFormularioValido(): boolean {
        this.form.markAllAsTouched();
        this.form.get('organismo')?.markAsTouched();
        const errores: string[] = [];

        if (!this.form.valid) {
            errores.push('Para poder guardar la información debe corregir los errores.');
        }

        const form = this.form.getRawValue();

        const latitud = form.latitud;
        const longitud = form.longitud;

        if ((latitud != "" && longitud === "") || (longitud != "" && latitud === "")) {
            errores.push('Debe ingresar latitud y longitud o ninguna.');
        }

        if (errores.length > 0) {
            this.actualizarServ.showMsgError(errores, true, () => this.cambioValores());
            return false;
        }

        return true;
    }

    cambioValores(): void {
        this.form.valueChanges.subscribe(() => {
            this.actualizarServ.mensajeOcultar();
        });
    }
    cambioValoresFiltroOrganismo(): void {
        this.actualizarServ.mensajeOcultar();
    }


    canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
        return !formularioTocado(this.form);
    }

    volver(): void {
        this.router.navigate(['/administracion/puntos-recepcion'], { queryParams: { volver: 1 } });
    }

    campoVacio(control: string): boolean {
        return campoVacio(control, this.form);
    }

    obtenerDto(): IPuntoRecepcionDTO {
        const form = this.form.getRawValue();
        const idInciso = form.organismo.idInciso;
        const idUE = form.organismo.idUnidadEjecutora;
        const idUC = form.organismo.idUnidadCompra;

        return {
            id: this.modoIngreso ? null : this.idPc,
            idInciso: idInciso,
            idUnidadEjecutora: idUE,
            idUnidadCompra: idUC,
            nombre: form.nombre,
            direccion: form.direccion,
            telefonos: form.telefonos,
            correosElectronicos: form.correosElectronicos,
            horarios: form.horarios,
            localidad: form.localidad,
            zona: {
                id: +form.zona
            },
            observaciones: form.observaciones,
            latitud: this.obtenerNumero(form.latitud),
            longitud: this.obtenerNumero(form.longitud),
            unidadCompra: {
                idInciso: idInciso,
                idUnidadEjecutora: idUE,
                idUnidadCompra: idUC
            },
            codigoPostal: form.codigoPostal,
        }
    }
    
    obtenerNumero(valor?: string): number | undefined {
        if (valor) {
            if ((parseFloat(valor) || parseFloat(valor) === 0)) {
                return parseFloat(valor);
            }
        }
        return undefined;

    }
}
