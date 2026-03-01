import {
    Component,
    EventEmitter,
    forwardRef,
    Injector,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import {
    AbstractControl,
    ControlValueAccessor,
    FormBuilder,
    FormControl,
    FormGroup,
    NG_VALIDATORS,
    NG_VALUE_ACCESSOR,
    NgControl,
    ValidationErrors,
    Validator,
    Validators,
    FormsModule,
    ReactiveFormsModule,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { IFiltroOrganismoDTO } from '../../models/filtros/filtro-organismo.model';
import { IIncisoDTO } from '../../models/sice/inciso.model';
import { UnidadCompraDTO } from '../../models/sice/unidad-compra.model';
import { UnidadEjecutoraDTO } from '../../models/sice/unidad-ejecutora.model';
import { OrganismoService } from '../../services/organismo.service';
import { NumeroNulo } from '../../types/numero-nulo.type';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
    selector: 'app-filtro-organismo',
    templateUrl: './filtro-organismo.component.html',
    styleUrls: ['./filtro-organismo.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => FiltroOrganismoComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => FiltroOrganismoComponent),
            multi: true,
        },
    ],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AlertModule,
        BsDropdownModule,
        BsDatepickerModule,
        ModalModule,
        PaginationModule,
        TabsModule,
        TooltipModule,
        TypeaheadModule,
        NgxDaterangepickerBootstrapModule,
        NgxEditorModule,
        NgxDatatableModule,
    ],
})
export class FiltroOrganismoComponent
    implements OnChanges, OnInit, ControlValueAccessor, Validator
{
    @Output() cambioFiltro = new EventEmitter<IFiltroOrganismoDTO>();
    @Output() limpiarFiltro = new EventEmitter();
    // Emitido cuando se cargan los datos del filtro para poder deshabilitarlo o hacerle acciones adicionales
    @Output() datosCargados = new EventEmitter<void>();

    @Input() filtro: IFiltroOrganismoDTO | null = null;
    @Input() orientacion: 'horizontal' | 'vertical' = 'vertical';

    @Input() requeridoInciso = false;
    @Input() requeridoUE = false;
    @Input() requeridoUC = false;
    @Input() incluirAdministrativas = false;
    @Input() disabled = false;
    @Input() idUsuarioSeleccionado: string | undefined;
    @Input() tipoSeguimientoProveedor: boolean = false;

    private onChange: (v: IFiltroOrganismoDTO) => void = () => {};
    private onTouched: () => void = () => {};
    private onValidatorChange: () => void = () => {};
    private tocado = false;
    private sucio = false;
    public idControl!: number;

    protected form!: FormGroup<{
        idInciso: FormControl<NumeroNulo>;
        idUnidadEjecutora: FormControl<NumeroNulo>;
        idUnidadCompra: FormControl<NumeroNulo>;
    }>;
    protected incisos: IIncisoDTO[] = [];
    protected unidadesEjecutoras: UnidadEjecutoraDTO[] = [];
    protected unidadesCompra: UnidadCompraDTO[] = [];
    private readonly destroy$ = new Subject<void>();
    private destruido = false;
    constructor(
        private readonly injector: Injector,
        private readonly filterService: OrganismoService,
        private readonly formBuild: FormBuilder,
    ) {}

    ngOnInit(): void {
        this.idControl = Math.random(); //NOSONAR
        const validatorsInciso = this.requeridoInciso
            ? [Validators.required]
            : [];
        const validatorsUE = this.requeridoUE ? [Validators.required] : [];
        const validatorsUC = this.requeridoUC ? [Validators.required] : [];

        this.form = this.formBuild.group({
            idInciso: this.formBuild.control<NumeroNulo>('', validatorsInciso),
            idUnidadEjecutora: this.formBuild.control<NumeroNulo>(
                '',
                validatorsUE,
            ),
            idUnidadCompra: this.formBuild.control<NumeroNulo>(
                '',
                validatorsUC,
            ),
        });

        this.form.valueChanges
            .pipe(takeUntil(this.destroy$))
            .subscribe(() => this.cambioDatosFiltros());
        let observador;
        if (this.tipoSeguimientoProveedor) {
            observador = this.filterService.obtenerIncisosOCProveedor();
        } else {
            observador = this.filterService.obtenerIncisos(
                this.incluirAdministrativas,
                this.idUsuarioSeleccionado,
            );
        }
        observador.subscribe((res: IIncisoDTO[]) => {
            this.incisos = res;
        });

        if (this.disabled) {
            this.form.disable({ emitEvent: false });
        }
    }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (isDisabled) {
            this.form.get('idInciso')?.disable();
            this.form.get('idUnidadEjecutora')?.disable();
            this.form.get('idUnidadCompra')?.disable();
        } else {
            this.form.get('idInciso')?.enable();
            this.form.get('idUnidadEjecutora')?.enable();
            this.form.get('idUnidadCompra')?.enable();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        this.aplicarValidadores(changes);
        if (changes['disabled'] && !changes['disabled'].isFirstChange()) {
            this.setDisabledState(changes['disabled'].currentValue);
        }

        if (
            changes['filtro'] &&
            changes['filtro'].isFirstChange() &&
            this.filtro
        ) {
            const idInciso = this.filtro['idInciso'] ?? null;
            // Si hay inciso en el filtro proceso
            if (idInciso && idInciso !== null) {
                this.form.get('idInciso')?.setValue(idInciso);
                this.cargarUnidadesEjecutoras(idInciso, false);
            } else {
                this.form.get('idInciso')?.setValue('');
            }
            this.cambioDatosFiltros();
        }
    }

    cambioUC() {
        //Se deja por si se necesita
    }

    aplicarValidadores(changes: SimpleChanges): void {
        if (changes['requeridoInciso'] && this.form) {
            const ctrl = this.form.get('idInciso')!;
            if (this.requeridoInciso) {
                ctrl.setValidators([Validators.required]);
            } else {
                ctrl.clearValidators();
            }
            ctrl.updateValueAndValidity({ emitEvent: false });
        }

        if (changes['requeridoUE'] && this.form) {
            const ctrl = this.form.get('idUnidadEjecutora')!;
            if (this.requeridoUE) {
                ctrl.setValidators([Validators.required]);
            } else {
                ctrl.clearValidators();
            }
            ctrl.updateValueAndValidity({ emitEvent: false });
        }

        if (changes['requeridoUC'] && this.form) {
            const ctrl = this.form.get('idUnidadCompra')!;
            if (this.requeridoUC) {
                ctrl.setValidators([Validators.required]);
            } else {
                ctrl.clearValidators();
            }
            ctrl.updateValueAndValidity({ emitEvent: false });
        }
    }

    markAsTouched(): void {
        this.form.markAllAsTouched();
        this.onTouched();
    }

    markAsDirty(): void {
        this.form.markAsDirty();
    }

    ngOnDestroy(): void {
        this.destruido = true;
        this.destroy$.next();
        this.destroy$.complete();
    }

    writeValue(dto?: IFiltroOrganismoDTO | null): void {
        if (dto) {
            this.form.setValue(
                {
                    idInciso: dto.idInciso ?? '',
                    idUnidadEjecutora: dto.idUnidadEjecutora ?? '',
                    idUnidadCompra: dto.idUnidadCompra ?? '',
                },
                { emitEvent: false },
            );

            this.resetPristine();
            if (dto.idInciso) {
                this.cambioInciso(false);
            } else {
                this.form.get('idInciso')?.setValue('');
                this.resetPristine();
            }
        } else {
            this.limpiar();
        }
        this.resetPristine();
        this.datosCargados?.emit();
    }

    cambioDatosFiltros() {
        const filtro: IFiltroOrganismoDTO = {
            idInciso: this.getNumberNullable('idInciso') ?? undefined,
            idUnidadEjecutora:
                this.getNumberNullable('idUnidadEjecutora') ?? undefined,
            idUnidadCompra:
                this.getNumberNullable('idUnidadCompra') ?? undefined,
        };

        this.onValidatorChange();
        this.cambioFiltro.emit(filtro);
        this.onChange(filtro);
    }

    cambioInciso(limpiarSeleccion: boolean = true) {
        const selectedValue = this.form.get('idInciso')?.value;
        const oldidUnidadEjecutora = this.form.get('idUnidadEjecutora')?.value;
        const oldidUnidadCompra = this.form.get('idUnidadCompra')?.value;
        if (limpiarSeleccion) {
            this.form.get('idUnidadEjecutora')?.setValue('');
            this.form.get('idUnidadCompra')?.setValue('');
        } else {
            this.resetPristine();
        }
        this.unidadesEjecutoras = [];
        this.unidadesCompra = [];
        this.form.get('idUnidadEjecutora')?.markAsUntouched();
        this.form.get('idUnidadEjecutora')?.markAsPristine();

        if (selectedValue && !isNaN(selectedValue)) {
            this.cargarUnidadesEjecutoras(selectedValue, limpiarSeleccion);
        } else {
            if (
                oldidUnidadEjecutora !==
                this.form.get('idUnidadEjecutora')?.value
            ) {
                this.form.get('idUnidadEjecutora')?.markAsTouched();
            }
            if (oldidUnidadCompra !== this.form.get('idUnidadCompra')?.value) {
                this.form.get('idUnidadCompra')?.markAsTouched();
            }
        }
    }

    private cargarUnidadesEjecutoras(
        selectedValue: number,
        limpiarSeleccion: boolean,
    ) {
        let observador;

        if (this.tipoSeguimientoProveedor) {
            observador = this.filterService.obtenerUEOCProveedor(selectedValue);
        } else {
            observador = this.filterService.obtenerUE(
                selectedValue,
                this.incluirAdministrativas,
                this.idUsuarioSeleccionado,
            );
        }
        observador.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: UnidadEjecutoraDTO[]) => {
                this.unidadesEjecutoras = res;
                if (this.unidadesEjecutoras.length > 0 && !this.disabled) {
                    this.form.get('idUnidadEjecutora')?.enable();
                }
                if (
                    res.length === 1 &&
                    (!this.form.get('idUnidadEjecutora')?.value ||
                        this.form.get('idUnidadEjecutora')?.value === '')
                ) {
                    this.form
                        .get('idUnidadEjecutora')
                        ?.setValue(res[0].idUnidadEjecutora ?? '');
                    this.resetPristine();
                }
                if (
                    this.form.get('idUnidadEjecutora')?.value &&
                    this.form.get('idUnidadEjecutora')?.value !== ''
                ) {
                    this.cambioUE(limpiarSeleccion);
                }
            },
            error: (err: Error) => {
                console.error(
                    'Error cargando unidades ejecutoras:',
                    err.message,
                );
                this.unidadesEjecutoras = [];
                this.form.get('idUnidadEjecutora')?.setValue('');
                this.unidadesCompra = [];
                this.form.get('idUnidadCompra')?.setValue('');
            },
        });
    }

    cambioUE(limpiarSeleccion: boolean = true) {
        const oldidUnidadCompra = this.form.get('idUnidadCompra')?.value;
        if (limpiarSeleccion) {
            this.form.get('idUnidadCompra')?.setValue('');
        } else {
            this.resetPristine();
        }
        const selectedIncisoValue = this.form.get('idInciso')?.value;
        const selectedValue = this.form.get('idUnidadEjecutora')?.value;

        this.unidadesCompra = [];
        this.form.get('idUnidadCompra')?.markAsUntouched();
        this.form.get('idUnidadCompra')?.markAsPristine();
        if (
            selectedIncisoValue &&
            !isNaN(selectedIncisoValue) &&
            selectedValue &&
            !isNaN(selectedValue)
        ) {
            let observador;
            if (this.tipoSeguimientoProveedor) {
                observador = this.filterService.obtenerUCProveedor(
                    selectedIncisoValue,
                    selectedValue,
                );
            } else {
                observador = this.filterService.obtenerUC(
                    selectedIncisoValue,
                    selectedValue,
                    this.incluirAdministrativas,
                    this.idUsuarioSeleccionado,
                );
            }

            observador.subscribe({
                next: (res: UnidadCompraDTO[]) => {
                    this.unidadesCompra = res;
                    if (this.unidadesCompra.length > 0 && !this.disabled) {
                        this.form.get('idUnidadCompra')?.enable();
                    }
                    if (res.length === 1) {
                        this.form
                            .get('idUnidadCompra')
                            ?.setValue(res[0].idUnidadCompra ?? '');
                        this.resetPristine();
                    }
                    this.datosCargados.emit();
                },
                error: (err: any) => {
                    console.error('Error cargando unidades de compra:', err);
                    this.datosCargados.emit();
                },
            });
        } else {
            if (oldidUnidadCompra !== this.form.get('idUnidadCompra')?.value) {
                this.form.get('idUnidadCompra')?.markAsTouched();
            }
            this.datosCargados.emit();
        }
    }

    limpiar() {
        this.form.get('idInciso')?.setValue('');
        this.form.get('idUnidadEjecutora')?.setValue('');
        this.form.get('idUnidadCompra')?.setValue('');

        this.unidadesEjecutoras = [];
        this.unidadesCompra = [];
        this.form.get('idUnidadEjecutora')?.disable();
        this.form.get('idUnidadCompra')?.disable();
        this.form.markAsUntouched();
        this.resetPristine();
        this.limpiarFiltro.emit();
    }

    getNumberNullable(formControlName: string): number | null {
        const value = this.form.get(formControlName)?.value;
        if (value && value !== null && value !== '') {
            const numValue = Number(value);
            return isNaN(numValue) ? null : numValue;
        }
        return null;
    }

    validate(_: AbstractControl): ValidationErrors | null {
        if (this.form.valid) {
            return null;
        }
        return {
            filtroIncompleto: {
                requiredInciso:
                    this.requeridoInciso && !this.form.get('idInciso')!.value,
                requiredUE:
                    this.requeridoUE &&
                    !this.form.get('idUnidadEjecutora')!.value,
                requiredUC:
                    this.requeridoUC && !this.form.get('idUnidadCompra')!.value,
            },
        };
    }

    registerOnChange(fn: (val: IFiltroOrganismoDTO) => void): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChange = fn;
    }
    ngDoCheck(): void {
        const ngControl = this.injector.get(NgControl, null);
        if (ngControl) {
            ngControl.valueAccessor = this;

            this.chequearTocado(ngControl);
            this.chequearSucio(ngControl);
        }
    }

    private chequearSucio(ngControl: NgControl) {
        const nowDirty = ngControl.dirty;
        this.sucio = false;
        if (nowDirty !== this.sucio) {
            this.sucio = nowDirty ?? false;
            if (this.sucio) {
                this.form.get('idInciso')?.markAsDirty();
                this.form.get('idUnidadEjecutora')?.markAsDirty();
                this.form.get('idUnidadCompra')?.markAsDirty();
            } else {
                this.form.get('idInciso')?.markAsPristine();
                this.form.get('idUnidadEjecutora')?.markAsPristine();
                this.form.get('idUnidadCompra')?.markAsPristine();
            }
            if (nowDirty) {
                this.markAsDirty();
            }
        }
    }

    private chequearTocado(ngControl: NgControl) {
        const nowTouched = ngControl.touched;

        this.tocado = false;
        if (nowTouched !== this.tocado) {
            this.tocado = nowTouched ?? false;
            if (this.tocado) {
                this.form.get('idInciso')?.markAsTouched();
                this.form.get('idUnidadEjecutora')?.markAsTouched();
                this.form.get('idUnidadCompra')?.markAsTouched();
            } else {
                this.form.get('idInciso')?.markAsUntouched();
                this.form.get('idUnidadEjecutora')?.markAsUntouched();
                this.form.get('idUnidadCompra')?.markAsUntouched();
                this.form.get('idInciso')?.markAsPristine();
                this.form.get('idUnidadEjecutora')?.markAsPristine();
                this.form.get('idUnidadCompra')?.markAsPristine();
            }
            if (nowTouched) {
                this.markAsTouched();
            }
        }
    }

    public resetPristine() {
        setTimeout(() => {
            try {
                if (!this.destruido) {
                    const ngControl = this.injector.get(NgControl, null);
                    if (ngControl?.control) {
                        ngControl.control.markAsPristine();
                    }
                }
            } catch (error) {
                console.error('Error al resetear el estado "pristine":', error);
            }
        }, 100);
    }
}
