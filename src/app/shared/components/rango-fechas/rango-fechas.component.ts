import { AfterViewInit, Component, forwardRef, Injector, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormControl, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, NgControl, ValidationErrors, Validator, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';import { CommonModule } from '@angular/common';import { RouterModule } from '@angular/router';import { AlertModule } from 'ngx-bootstrap/alert';import { BsDropdownModule } from 'ngx-bootstrap/dropdown';import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';import { ModalModule } from 'ngx-bootstrap/modal';import { PaginationModule } from 'ngx-bootstrap/pagination';import { TabsModule } from 'ngx-bootstrap/tabs';import { TooltipModule } from 'ngx-bootstrap/tooltip';import { TypeaheadModule } from 'ngx-bootstrap/typeahead';import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';import { NgxEditorModule } from 'ngx-editor';import { NgxDatatableModule } from '@swimlane/ngx-datatable';














@Component({
    selector: 'app-rango-fechas',
    templateUrl: './rango-fechas.component.html',
    styleUrls: ['./rango-fechas.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => RangoFechasComponent),
            multi: true
        },
        {
            provide: NG_VALIDATORS,
            useExisting: forwardRef(() => RangoFechasComponent),
            multi: true
        }
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
    NgxDatatableModule
  ],
})

export class RangoFechasComponent implements ControlValueAccessor, Validator, OnInit, OnDestroy, AfterViewInit {
    @Input() orientacion: 'horizontal' | 'vertical' = 'vertical';
    @Input() etiquetaFechaDesde: string | null = 'Fecha desde';
    @Input() etiquetaFechaHasta: string | null = 'Fecha hasta';
    @Input() etiquetaRango: string | null = 'Rango de fechas';
    @Input() requiereFechaDesde: boolean = false;
    @Input() requiereFechaHasta: boolean = false;
    @Input() permiteFechaFutura: boolean = false;


    protected form!: FormGroup;

    private onChange: (value: any) => void = () => { console.log("onChange no implementado"); };
    private onTouched: () => void = () => { console.log("onTouched no implementado"); };
    private readonly subscriptions: Subscription[] = [];
    disabled = false;

    errorFecha: string | null = null;
    window: any;

    rootControl: AbstractControl | null = null;
    maxFecha: string | null = null;

    constructor(private readonly fb: FormBuilder,
        private readonly injector: Injector
    ) {

    }

    ngOnInit() {

        this.form = this.fb.group({
            fechaDesde: ['', this.requiereFechaDesde ? Validators.required : []],
            fechaHasta: ['', this.requiereFechaHasta ? Validators.required : []]
        });

        if (!this.permiteFechaFutura) {
            const hoy = new Date();
            this.maxFecha = hoy.toISOString().split('T')[0]; // formato 'YYYY-MM-DD'
        }

    }

    ngAfterViewInit(): void {
        const ngControl = this.injector.get(NgControl, null);
        if (ngControl) {
            ngControl.valueAccessor = this;

            const parentControl = ngControl.control as FormControl | null;
            if (parentControl) {
                const originalMark = parentControl.markAsTouched;
                parentControl.markAsTouched = (...args: [opts?: { onlySelf?: boolean; emitEvent?: boolean; }]) => {
                    originalMark.apply(parentControl, args);
                    this.form.markAllAsTouched();
                };
            }
        }
    }

    cambioFechaDesde(): void {
       
        this.validate(this.form as any);
        this.onChange(this.form.value);
    }
    cambioFechaHasta(): void {
       
        this.validate(this.form as any);
        this.onChange(this.form.value);
    }



    writeValue(value: { fechaDesde: string; fechaHasta: string } | null): void {
        if (value) {
            this.form.setValue(value, { emitEvent: false });
        } else {
            this.form.reset({}, { emitEvent: false });
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = () => {
            this.form.markAllAsTouched(); // <- esto propaga internamente
            fn(); // <- notifica al padre también
        };
    }

    errorRango: boolean = false;

    validate(control: AbstractControl): ValidationErrors | null {
        this.errorRango = false;
        this.errorFecha = null;
        this.form.get('fechaDesde')?.setErrors(null);
        this.form.get('fechaHasta')?.setErrors(null);
        
        const { fechaDesde, fechaHasta } = this.form.value;

        const errors: ValidationErrors = {};

        // Validaciones fecha desde
        if (this.requiereFechaDesde && !fechaDesde) {
            errors['requiereFechaDesde'] = 'Fecha desde es obligatoria';
            this.form.get('fechaDesde')?.setErrors({ 'requiereFechaDesde': true });
            this.errorFecha = 'Fecha desde no puede estar vacío';
        }

        if (this.maxFecha != null && fechaDesde > this.maxFecha) {
            errors['maxFecha'] = 'La fecha desde no puede mayor a hoy';
            this.form.get('fechaDesde')?.setErrors({ 'maxFecha': true });
            this.errorFecha = 'Fecha desde no puede mayor a hoy';
        }

        //Validaciones fecha hasta 
        if (this.requiereFechaHasta && !fechaHasta) {
            errors['requiereFechaHasta'] = 'La fecha hasta es obligatoria';
            this.form.get('fechaHasta')?.setErrors({ 'requiereFechaHasta': true });
            this.errorFecha = 'Fecha hasta no puede estar vacío';
        }

        if (this.maxFecha != null && fechaHasta > this.maxFecha) {
            errors['requiereFechaHasta'] = 'La fecha hasta no puede mayor a hoy';
            this.form.get('fechaHasta')?.setErrors({ 'requiereFechaDesde': true });
            this.errorFecha = 'Fecha hasta no puede mayor a hoy';
        }

        //Validaciones conjuntas
        if (this.requiereFechaDesde && this.requiereFechaHasta && !fechaDesde && !fechaHasta) {
            this.errorFecha = 'Las fechas desde y hasta no pueden estar vacías';
        }

        if (this.maxFecha != null && fechaHasta > this.maxFecha && fechaDesde > this.maxFecha) {
            this.errorFecha = 'Las fechas desde y hasta no pueden ser mayor a hoy';
        }

        if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
            errors['rangoInvalido'] = 'Fecha desde debe ser anterior a fecha hasta';
            this.errorFecha = 'Fecha desde debe ser anterior a fecha hasta';
            this.form.get('fechaDesde')?.setErrors({ 'rangoInvalido': true });
            this.form.get('fechaHasta')?.setErrors({ 'rangoInvalido': true });
            this.form.get('fechaDesde')?.markAsDirty();
            this.form.get('fechaHasta')?.markAsDirty();
        }

        this.errorRango = Object.keys(errors).length > 0;

        return Object.keys(errors).length > 0 ? errors : null;
    }


    setDisabledState?(isDisabled: boolean): void {
        this.disabled = isDisabled;
        if (isDisabled) {
            this.form.disable({ emitEvent: false });
        } else {
            this.form.enable({ emitEvent: false });
        }
    }

    campoError(campo: 'fechaDesde' | 'fechaHasta'): boolean {
        const control = this.form.get(campo);
        return !!(control && control.invalid && (control.dirty || control.touched));
    }

    markAsTouched(): void {
        this.form.markAllAsTouched();
        this.onTouched();
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(s => s.unsubscribe());
    }
}

