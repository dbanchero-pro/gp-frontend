import { Component, ElementRef, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { uuidv4 } from '../../utils/functions';

@Component({
    selector: 'app-input-documento',
    templateUrl: './input-documento.component.html',
    styleUrls: ['./input-documento.component.scss'],
    providers: [
        { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => InputDocumentoComponent), multi: true },
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => InputDocumentoComponent), multi: true }
    ],
})
export class InputDocumentoComponent implements ControlValueAccessor, Validator, OnChanges {

    @Input() placeholder = '';
    @Input() esCedula = false;
    @Input() required = false;
    @Input() minLength = 7;
    @Input() label = 'Cédula de identidad';
    @Input() id = 'nroDocumento' + uuidv4();
    @Output() enter = new EventEmitter<string>();
    @ViewChild('input', { static: true }) inputRef!: ElementRef<HTMLInputElement>;
    @Output() blur = new EventEmitter<void>();

    ngOnChanges(changes: SimpleChanges): void {
        // Si cambia esCedula y el componente ya se cambio
        if (changes['esCedula'] && !changes['esCedula'].firstChange && this.touched) {
            this.validateInput();
            this.onValidatorChange();

            if (this._value) {
                this.setInputValue(this.formatearValor(this._value));
            }
        }
    }

    invalid = false;
    touched = false;
    errorMessage = '';

    private _value = '';
    private onChange: (v: any) => void = () => { };
    private onTouched: () => void = () => { };
    private onValidatorChange: () => void = () => { };
    // regex para validación de formato
    private readonly pattern = /^(?:\d\.\d{3}\.\d{3}-\d|\d{3}\.\d{3}-\d)$/;

    ngAfterViewInit(): void {
        const inputEl = this.inputRef.nativeElement;
        inputEl.addEventListener('input', this.onInput.bind(this));
        inputEl.addEventListener('blur', this.onBlur.bind(this));
    }
    writeValue(value: any): void {
        this._value = value ?? '';
        this.setInputValue(this.formatearValor(this._value));
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = () => {
            fn();
            this.touched = true;
            this.validateInput();
        };
    }

    setDisabledState(isDisabled: boolean): void {
        this.inputRef.nativeElement.disabled = isDisabled;
    }

    private validateInput(): void {
        this.invalid = false;
        this.errorMessage = '';

        if (this.touched) {
            if (this.required && !this._value) {
                this.invalid = true;
                this.errorMessage = 'La cédula de identidad no puede estar vacía';
            } else if (this.esCedula && this._value && this._value.replace(/\D+/g, '').length < this.minLength) {
                this.invalid = true;
                this.errorMessage = `El formato de la cédula es inválido`;
            } else if (this.esCedula && this._value && !this.pattern.test(this.formatearValor(this._value))) {
                this.invalid = true;
                this.errorMessage = 'El formato de la cédula es incorrecto';
            }
        }
    }

    // Método para actualizar el estado de touched desde fuera del componente
    public markAsTouched(): void {
        this.touched = true;
        this.validateInput();
    }

    onInput(event: Event): void {
        const el = event.target as HTMLInputElement;

        if (this.esCedula) {
            const digits = el.value.replace(/\D+/g, '');
            this._value = digits;
            // mostrar dígitos puros mientras escribe
            el.value = digits;
            this.setInputValue(this.formatearValor(this._value));
        } else {
            this._value = el.value;
        }
        this.onChange(this._value);
        // Solo actualizamos el valor sin mostrar errores durante la escritura
        this.onValidatorChange();
    }

    onBlur(): void {
        this.touched = true;
        this.setInputValue(this.formatearValor(this._value));
        this.onTouched();
        this.validateInput();
        this.onValidatorChange();
        this.blur.emit();
    }

    onKeyPress($event: KeyboardEvent) {
        if ($event.key === 'Enter') {
            this.onBlur();
            this.enter.emit(this._value);
        }
    } formatearValor(valor: string): string {
        if (this.esCedula) {
            let digits = valor.replace(/\D+/g, '');
            if (digits.length > 8) {
                digits = digits.slice(0, 8);
            }
            let formatted = digits;
            if (digits.length === 4 || digits.length === 5 || digits.length === 6) {
                formatted = digits.replace(/^(\d{1,3})(\d{3})$/, '$1.$2');
            } else if (digits.length === 8) {
                formatted = digits.replace(/^(\d)(\d{3})(\d{3})(\d)$/, '$1.$2.$3-$4');
            } else if (digits.length === 7) {
                formatted = digits.replace(/^(\d{3})(\d{3})(\d)$/, '$1.$2-$3');
            }
            return formatted;
        }
        return valor;
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (this.required && !control.value) {
            return { required: true };
        }

        if (this.esCedula && control.value) {
            const digitsLength = control.value.toString().replace(/\D+/g, '').length;
            if (digitsLength < this.minLength) {
                return { minlength: { requiredLength: this.minLength, actualLength: digitsLength } };
            }

            return this.pattern.test(this.formatearValor(control.value)) ? null : { pattern: true };
        } else {
            return null;
        }
    }

    registerOnValidatorChange(fn: () => void): void {
        this.onValidatorChange = fn;
    }

    private setInputValue(val: string): void {
        this.inputRef.nativeElement.value = val;
    }
}



