import { AfterViewInit, Component, forwardRef, Injector, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, ValidationErrors, Validator, Validators } from '@angular/forms';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';

type Modelo = { tipo: TipoUnidad; valor: number | null } | null;

@Component({
    selector: 'app-cantidad-porcentaje',
    templateUrl: './cantidad-porcentaje.component.html',
    standalone: false,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => CantidadPorcentajeComponent),
            multi: true,
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => CantidadPorcentajeComponent),
            multi: true,
        },
    ],
})

export class CantidadPorcentajeComponent
    implements OnInit, OnChanges, ControlValueAccessor, Validator, AfterViewInit {

    @Input() porcentajeHabilitado: boolean = true;
    @Input() cantidadHabilitada: boolean = true;
    @Input() cantidadFijaEnCantidad: number | null = null;
    @Input() disabled = false;

    protected form!: FormGroup<{
        tipo: FormControl<TipoUnidad>;
        valor: FormControl<number | null>;
    }>;

    private onChange: (v: Modelo) => void = () => { };
    private onTouched: () => void = () => { };
    private onValidatorChange: () => void = () => { };
    private tocado = false;
    private sucio = false;
    private destruido = false;
    private ngControl: NgControl | null = null;

    TipoUnidad = TipoUnidad;

    constructor(
        private readonly injector: Injector,
        private readonly fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.form = this.fb.group({
            tipo: this.fb.nonNullable.control<TipoUnidad>(TipoUnidad.CANTIDAD),
            valor: this.fb.control<number | null>(null),
        });
        this.form.valueChanges.subscribe(() => this.cambioDatos());
        if (this.disabled) {
            this.form.disable({ emitEvent: false });
        }
        this.aplicarValidadores(this.form.controls.tipo.value);
    }

    ngAfterViewInit(): void {
        this.cambioDatos();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            (changes['porcentajeHabilitado'] && !changes['porcentajeHabilitado'].isFirstChange()) ||
            (changes['cantidadFijaEnCantidad'] && !changes['cantidadFijaEnCantidad'].isFirstChange())
        ) {
            const normalizado = this.normalizar(this.form.getRawValue());
            this.form.patchValue(normalizado as any, { emitEvent: false });
            this.aplicarValidadores(normalizado.tipo);
            this.onValidatorChange();
            this.onChange(normalizado);
        }
        if (changes['disabled'] && !changes['disabled'].isFirstChange()) {
            this.setDisabledState(changes['disabled'].currentValue);
        }
    }

    ngOnDestroy(): void {
        this.destruido = true;
    }

    writeValue(value?: Modelo): void {
        const base: Modelo = value ?? { tipo: TipoUnidad.CANTIDAD, valor: null };
        const normalizado = this.normalizar(base);
        this.form.patchValue(normalizado as any, { emitEvent: false });
        this.aplicarValidadores(normalizado.tipo);
        this.resetPristine();
    }

    registerOnChange(fn: any): void { this.onChange = (val: Modelo) => fn(val); }
    registerOnTouched(fn: any): void { this.onTouched = fn; }
    registerOnValidatorChange(fn: () => void): void { this.onValidatorChange = fn; }

    setDisabledState(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (isDisabled) {
            this.form.disable({ emitEvent: false });
        } else {
            this.form.enable({ emitEvent: false });
        }
    }

    validate(_: AbstractControl): ValidationErrors | null {
        const { tipo, valor } = this.form.getRawValue();
        if (tipo === TipoUnidad.CANTIDAD) {
            if (this.cantidadFijaEnCantidad !== null) return null;
            if (valor === undefined || valor === null || valor < 1) return { cantidadMin: true };
            return null;
        } else {
            if (valor === undefined || valor === null || valor < 0 || valor > 100) return { porcentajeRango: true };
            return null;
        }
    }

    ngDoCheck(): void {
        this.ngControl = this.injector.get(NgControl, null);
        if (this.ngControl) {
            (this.ngControl as any).valueAccessor = this;
            this.chequearTocado(this.ngControl);
            this.chequearSucio(this.ngControl);
        }
    }

    private chequearSucio(ngControl: NgControl) {
        const nowDirty = ngControl.dirty;
        if (nowDirty !== this.sucio) {
            this.sucio = nowDirty ?? false;
            if (this.sucio) {
                this.form.get('tipo')?.markAsDirty();
                this.form.get('valor')?.markAsDirty();
            } else {
                this.form.get('tipo')?.markAsPristine();
                this.form.get('valor')?.markAsPristine();
            }
            if (nowDirty) this.markAsDirty();
        }
    }

    private chequearTocado(ngControl: NgControl) {
        const nowTouched = ngControl.touched;
        if (nowTouched !== this.tocado) {
            this.tocado = nowTouched ?? false;
            if (this.tocado) {
                this.form.get('tipo')?.markAsTouched();
                this.form.get('valor')?.markAsTouched();
            } else {
                this.form.get('tipo')?.markAsUntouched();
                this.form.get('valor')?.markAsUntouched();
                this.form.get('tipo')?.markAsPristine();
                this.form.get('valor')?.markAsPristine();
            }
            if (nowTouched) this.markAsTouched();
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
                console.error('Error al resetear "pristine":', error);
            }
        }, 100);
    }

    cambiarTipo(tipo: TipoUnidad) {
        const next = this.normalizar({ ...this.form.getRawValue(), tipo });
        this.form.patchValue(next as any, { emitEvent: true });
        this.aplicarValidadores(next.tipo);
        this.markAsTouched();
        this.onValidatorChange();
    }
    
    actualizarValor(valor: number | null) {
        if (this.form.controls.tipo.value === TipoUnidad.CANTIDAD &&
            this.cantidadFijaEnCantidad !== null) {
            return;
        }
        const next = this.normalizar({ ...this.form.getRawValue(), valor });
        this.form.patchValue(next as any, { emitEvent: true });
        this.markAsTouched();
    }

    limpiar() {
        this.form.patchValue(
            { tipo: TipoUnidad.CANTIDAD, valor: null } as any,
            { emitEvent: true }
        );
        this.aplicarValidadores(TipoUnidad.CANTIDAD);
        this.resetPristine();
    }

    markAsTouched(): void {
        this.form.markAllAsTouched();
        this.onTouched();
    }

    markAsDirty(): void {
        this.form.markAsDirty();
    }

    private cambioDatos() {
        const normalizado = this.normalizar(this.form.getRawValue());
        if (!this.equals(this.form.getRawValue(), normalizado)) {
            this.form.patchValue(normalizado as any, { emitEvent: false });
        }

        if (this.form.dirty) {
            this.markAsTouched();
        }

        this.onValidatorChange();
        this.onChange(normalizado);
    }

    private normalizar(v: Modelo): { tipo: TipoUnidad; valor: number | null } {
        let tipo = v?.tipo ?? TipoUnidad.CANTIDAD;
        let valor = v?.valor ?? null;

        const tieneValor = valor !== null && valor !== undefined;

        if (!this.porcentajeHabilitado && tipo === TipoUnidad.PORCENTAJE) {
            tipo = TipoUnidad.CANTIDAD;
            if (!tieneValor && this.cantidadFijaEnCantidad === null) valor = null;
        }

        if (!this.cantidadHabilitada && tipo === TipoUnidad.CANTIDAD) {
            if (!tieneValor || this.cantidadFijaEnCantidad === null) {
                tipo = TipoUnidad.PORCENTAJE;
                valor = null;
            }
        }

        if (tipo === TipoUnidad.CANTIDAD && this.cantidadFijaEnCantidad !== null) {
            valor = this.cantidadFijaEnCantidad;
        }

        return { tipo, valor };
    }


    private aplicarValidadores(tipo: TipoUnidad) {
        const ctrl = this.form.get('valor')!;
        ctrl.clearValidators();
        if (tipo === TipoUnidad.CANTIDAD) {
            if (this.cantidadFijaEnCantidad === null) {
                ctrl.setValidators([Validators.min(1)]);
            }
        } else {
            ctrl.setValidators([Validators.min(1), Validators.max(100)]);
        }
        ctrl.updateValueAndValidity({ emitEvent: false });
    }

    private equals(a?: Modelo, b?: Modelo) {
        return a?.tipo === b?.tipo && a?.valor === b?.valor;
    }

    get touched(): boolean {
        return this.form.touched;
    }

    get invalid(): boolean {
        return !!this.ngControl?.invalid;
    }

    get errorMsg(): string {
        const errors = this.ngControl?.errors;
        if (errors?.['excedePendienteCantidad']) {
            return 'La cantidad ingresada supera la cantidad pendiente por asignar';
        }
        if (errors?.['excedePendientePorcentaje']) {
            return 'El porcentaje ingresado supera el porcentaje pendiente por asignar';
        }
        if (errors?.['cantidadMin']) {
            return 'La cantidad debe ser mayor a 0';
        }
        if (errors?.['porcentajeRango']) {
            return 'El porcentaje debe estar entre 1 y 100';
        }
        if (errors?.['excedeSumaPorcentaje']) {
            return 'La suma de los porcentajes supera el 100%';
        }
        if (errors?.['cantidadDebeSerUno']) {
            return 'La cantidad debe ser 1';
        }
        if (errors?.['porcentajeRequerido']) {
            return 'Debe ingresar un porcentaje';
        }
        if(errors?.['cantidadRequerida']) {
            return 'Debe ingresar una cantidad';
        }
        return '';
    }

    get tipoActual(): TipoUnidad { return this.form.controls.tipo.value; }
    get valorActual(): number | null { return this.form.controls.valor.value; }
    get valorBloqueado(): boolean {
        return this.tipoActual === TipoUnidad.CANTIDAD && this.cantidadFijaEnCantidad !== null;
    }
}
