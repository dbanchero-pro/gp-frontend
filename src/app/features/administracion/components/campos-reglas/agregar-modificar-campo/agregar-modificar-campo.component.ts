import { Component, inject, OnInit } from '@angular/core';
import {
    FormBuilder,
    FormControl,
    FormGroup,
    Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from '../../../../../shared/utils/can-component-deactivate';
import { formularioTocado } from '../../../../../shared/utils/functions';
import { FormularioBaseComponent } from '../../../../../shared/components/base/formulario-base.component';
import { CampoDTO } from 'src/app/shared/models/pliego/comun/campo.model';
import { SiNoValor } from 'src/app/shared/enum/si-no-valor.enum';
import { AccionBoton } from 'src/app/shared/models/common/accion-boton.model';
import { TipoDatoCampo } from '../../../enums/tipo-dato-campo.enum';
import { TipoFuenteCampo } from '../../../enums/tipo-fuente-campo.enum';
import { TipoRegla } from '../../../enums/tipo-regla.enum';
import { IReglaDTO, ReglaDTO } from '../../../models/regla.model';
import { CampoService } from '../../../services/campo.service';
import { OperadorHelperService } from '../../../services/operador-helper.service';
import { AgregarModificarReglaPopupComponent } from '../agregar-modificar-regla-popup/agregar-modificar-regla-popup.component';
import { AgregarValorPopupComponent } from '../agregar-valor-popup/agregar-valor-popup.component';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-agregar-modificar-campo',
    templateUrl: './agregar-modificar-campo.component.html',
    styleUrls: ['./agregar-modificar-campo.component.scss'],
    standalone: true,
    imports: [SharedModule],
})
export class AgregarModificarCampoComponent
    extends FormularioBaseComponent
    implements OnInit, CanComponentDeactivate
{
    private readonly fb = inject(FormBuilder);
    private readonly router = inject(Router);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly campoService = inject(CampoService);
    private readonly operadorHelper = inject(OperadorHelperService);

    idCampo!: number;
    modoIngreso = false;
    titulo = 'Agregar campo';

    override form!: FormGroup<{
        etiqueta: FormControl<string>;
        descripcion: FormControl<string>;
        tipoDato: FormControl<string>;
        largoMaximo: FormControl<number | null>;
        sePuedeEliminar: FormControl<string>;
    }>;

    fuenteCampo = 'Usuario';
    tiposDato: { id: string; nombre: string }[] = [];
    opcionesSiNo: { id: string; nombre: string }[] = [
        { id: SiNoValor.SI, nombre: 'Sí' },
        { id: SiNoValor.NO, nombre: 'No' },
    ];

    reglas: IReglaDTO[] = [];
    siguienteIdRegla = 1;
    mostrarLargoMaximo = false;
    mostrarValoresPermitidos = false;
    valoresPermitidos: string[] = [];

    constructor() {
        super();
        this.activatedRoute.params.subscribe((params) => {
            this.idCampo = +params['idCampo'];
            this.modoIngreso = !this.idCampo;
        });
    }

    ngOnInit(): void {
        this.tiposDato = this.campoService.obtenerTiposDato();

        if (!this.modoIngreso) {
            this.titulo = 'Modificar campo';
        }

        this.inicializarFormulario();
        this.cargarDatosCampo();
    }

    private inicializarFormulario(): void {
        this.form = this.fb.nonNullable.group({
            etiqueta: this.fb.nonNullable.control<string>('', [
                Validators.required,
                Validators.maxLength(50),
            ]),
            descripcion: this.fb.nonNullable.control<string>(
                '',
                Validators.required,
            ),
            tipoDato: this.fb.nonNullable.control<string>(
                '',
                Validators.required,
            ),
            largoMaximo: this.fb.control<number | null>(null),
            sePuedeEliminar: this.fb.nonNullable.control<string>(
                SiNoValor.SI,
                Validators.required,
            ),
        });

        this.form.get('tipoDato')?.valueChanges.subscribe((tipoDato) => {
            this.actualizarValidacionLargoMaximo(tipoDato as TipoDatoCampo);
            this.actualizarVisibilidadValoresPermitidos(tipoDato as TipoDatoCampo);
        });
    }

    private actualizarValidacionLargoMaximo(tipoDato: TipoDatoCampo): void {
        const largoMaximoControl = this.form.get('largoMaximo');

        if (tipoDato === TipoDatoCampo.TEXTO) {
            this.mostrarLargoMaximo = true;
            largoMaximoControl?.setValidators([
                Validators.required,
                Validators.min(1),
                Validators.max(4000),
            ]);
        } else {
            this.mostrarLargoMaximo = false;
            largoMaximoControl?.clearValidators();
            largoMaximoControl?.setValue(null);
        }

        largoMaximoControl?.updateValueAndValidity();
    }

    private actualizarVisibilidadValoresPermitidos(tipoDato: TipoDatoCampo): void {
        if (
            tipoDato === TipoDatoCampo.LISTA_UNICA_SELECCION ||
            tipoDato === TipoDatoCampo.LISTA_MULTIPLE_SELECCION
        ) {
            this.mostrarValoresPermitidos = true;
        } else {
            this.mostrarValoresPermitidos = false;
            this.valoresPermitidos = [];
        }
    }

    private cargarDatosCampo(): void {
        if (this.modoIngreso) {
            return;
        }

        this.campoService.obtenerPorId(this.idCampo).subscribe({
            next: (campo: CampoDTO | undefined) => {
                if (!campo) {
                    this.actualizarService.mensajeError('Campo no encontrado');
                    this.volver();
                    return;
                }

                this.form.patchValue({
                    etiqueta: campo.etiqueta || '',
                    descripcion: campo.descripcion || '',
                    tipoDato: campo.tipoDato || '',
                    largoMaximo: campo.largoMaximo || null,
                    sePuedeEliminar: campo.sePuedeEliminar || SiNoValor.SI,
                });

                if (campo.fuente) {
                    const nombreFuente = this.obtenerNombreFuente(campo.fuente);
                    this.fuenteCampo = nombreFuente;
                }

                if (campo.tipoDato) {
                    this.actualizarValidacionLargoMaximo(campo.tipoDato as TipoDatoCampo);
                    this.actualizarVisibilidadValoresPermitidos(campo.tipoDato as TipoDatoCampo);
                }

                if (campo.valoresPermitidos) {
                    this.valoresPermitidos = [...campo.valoresPermitidos];
                }

                if (campo.reglas) {
                    this.reglas = [...campo.reglas];
                    const maxId = Math.max(
                        0,
                        ...this.reglas.map((r) => r.id || 0),
                    );
                    this.siguienteIdRegla = maxId + 1;
                }

                setTimeout(() => {
                    this.form.markAsPristine();
                }, 500);
            },
            error: (err) => {
                this.actualizarService.mensajeError('Error al cargar el campo');
                console.error('Error al cargar campo:', err);
            },
        });
    }

    abrirAgregarRegla(): void {
        const tipoDato = this.form.value.tipoDato as TipoDatoCampo;
        if (!tipoDato) {
            this.actualizarService.mensajeError(
                'Debe seleccionar un tipo de dato antes de agregar reglas',
            );
            return;
        }

        const popup = this.abrirPopupXXL(
            AgregarModificarReglaPopupComponent,
            'Guardar',
            {
                backdrop: 'static',
                keyboard: false,
                initialState: {
                    tipoDatoCampo: tipoDato,
                    reglasExistentes: this.reglas,
                    idCampoActual: this.idCampo,
                },
            },
        );

        if (popup.reglaGuardada) {
            popup.reglaGuardada.subscribe((regla: IReglaDTO) => {
                regla.id = this.siguienteIdRegla++;
                this.reglas.push(regla);
            });
        }
    }

    obtenerAccionesRegla(regla: IReglaDTO): AccionBoton[] {
        const acciones: AccionBoton[] = [];

        acciones.push({
            nombre: 'Modificar',
            clase: 'btn btn-sm',
            icono: 'fa fa-edit',
            accion: () => this.modificarRegla(regla),
        });

        acciones.push({
            nombre: 'Eliminar',
            clase: 'btn btn-sm',
            icono: 'fa fa-trash',
            accion: () => this.eliminarRegla(regla),
        });

        return acciones;
    }

    ejecutarAccionRegla(accion: AccionBoton): void {
        if (accion.accion) {
            accion.accion();
        }
    }

    modificarRegla(regla: IReglaDTO): void {
        const tipoDato = this.form.value.tipoDato as TipoDatoCampo;
        if (!tipoDato) {
            return;
        }

        const popup = this.abrirPopupXXL(
            AgregarModificarReglaPopupComponent,
            'Guardar',
            {
                backdrop: 'static',
                keyboard: false,
                initialState: {
                    tipoDatoCampo: tipoDato,
                    reglaExistente: regla,
                    reglasExistentes: this.reglas.filter(
                        (r) => r.id !== regla.id,
                    ),
                    idCampoActual: this.idCampo,
                },
            },
        );

        if (popup.reglaGuardada) {
            popup.reglaGuardada.subscribe((reglaModificada: IReglaDTO) => {
                const index = this.reglas.findIndex((r) => r.id === regla.id);
                if (index !== -1) {
                    this.reglas[index] = { ...reglaModificada, id: regla.id };
                }
            });
        }
    }

    eliminarRegla(regla: IReglaDTO): void {
        const index = this.reglas.findIndex((r) => r.id === regla.id);
        if (index !== -1) {
            this.reglas.splice(index, 1);
        }
    }

    obtenerEtiquetaTipoRegla(tipoRegla: TipoRegla | undefined): string {
        switch (tipoRegla) {
            case TipoRegla.VALOR:
                return 'Valor';
            case TipoRegla.CAMPO:
                return 'Campo';
            default:
                return '-';
        }
    }

    obtenerNombreOperador(regla: IReglaDTO): string {
        return regla.operador
            ? this.operadorHelper.obtenerNombreOperador(regla.operador)
            : '-';
    }

    obtenerNombreFuente(fuente: TipoFuenteCampo): string {
        switch (fuente) {
            case TipoFuenteCampo.USUARIO:
                return 'Usuario';
            case TipoFuenteCampo.SICE_EDITABLE:
                return 'SICE Editable';
            case TipoFuenteCampo.SICE_NO_EDITABLE:
                return 'SICE No Editable';
            default:
                return '';
        }
    }

    guardar(): void {
        this.form.markAllAsTouched();

        if (!this.form.valid) {
            return;
        }

        if (this.mostrarValoresPermitidos && this.valoresPermitidos.length === 0) {
            this.actualizarService.mensajeError(
                'Debe agregar al menos un valor permitido para las listas de selección',
            );
            return;
        }

        const campo = new CampoDTO(
            this.modoIngreso ? undefined : this.idCampo,
            this.form.value.etiqueta || '',
            this.form.value.descripcion || '',
            TipoFuenteCampo.USUARIO,
            this.form.value.tipoDato as TipoDatoCampo,
            this.form.value.largoMaximo || undefined,
            this.mostrarValoresPermitidos ? this.valoresPermitidos : undefined,
            this.form.value.sePuedeEliminar as SiNoValor,
            this.reglas.map(
                (r) =>
                    new ReglaDTO(
                        undefined,
                        r.codigo,
                        r.nombre,
                        r.tipoRegla,
                        r.operador,
                        r.valor,
                        r.idCampoComparar,
                        r.etiquetaCampoComparar,
                        r.mensajeError,
                    ),
            ),
            new Date(),
            new Date(),
            true,
        );

        try {
            const operacion = this.modoIngreso
                ? this.campoService.crear(campo)
                : this.campoService.actualizar(campo);

            operacion.subscribe({
                next: () => {
                    const mensaje = this.modoIngreso
                        ? 'Campo agregado correctamente'
                        : 'Campo modificado correctamente';
                    this.form.markAsPristine();
                    this.volver();
                    window.setTimeout(() => {
                        this.actualizarService.mensajeCorrecto(mensaje);
                    }, 1000);
                },
                error: (err) => {
                    this.actualizarService.mensajeError(
                        err.message || 'Error al guardar el campo',
                    );
                    console.error('Error al guardar el campo:', err);
                },
            });
        } catch (error: any) {
            this.actualizarService.mensajeError(
                error.message || 'Error al guardar el campo',
            );
            console.error('Error al guardar el campo:', error);
        }
    }

    volver(): void {
        this.router.navigate(['/administracion/campos-reglas'], {
            queryParams: { volver: 1 },
        });
    }

    abrirAgregarValor(): void {
        const popup = this.abrirPopup(AgregarValorPopupComponent, 'Guardar', {
            backdrop: 'static',
            keyboard: false,
            initialState: {
                valoresExistentes: this.valoresPermitidos,
            },
        });

        if (popup.valorGuardado) {
            popup.valorGuardado.subscribe((valor: string) => {
                this.valoresPermitidos.push(valor);
                this.form.markAsDirty();
            });
        }
    }

    eliminarValor(index: number): void {
        this.valoresPermitidos.splice(index, 1);
        this.form.markAsDirty();
    }

    obtenerAccionesValor(index: number): AccionBoton[] {
        return [
            {
                nombre: 'Eliminar',
                icono: 'fa fa-trash',
                clase: 'btn btn-sm',
                ariaLabel: 'Eliminar valor',
                accion: () => this.eliminarValor(index),
            },
        ];
    }

    canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
        return !formularioTocado(this.form);
    }
}
