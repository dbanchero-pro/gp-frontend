import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    forwardRef,
    OnDestroy
} from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Editor, Toolbar, Validators, schema } from 'ngx-editor';

@Component({
    selector: 'app-text-editor',
    templateUrl: './text-editor.component.html',
    styleUrls: [],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TextEditorComponent),
            multi: true
        }
    ],

    standalone: false
})
export class TextEditorComponent implements OnInit, OnChanges, OnDestroy, ControlValueAccessor {
    editor!: Editor;
    @Input() toolbar: Toolbar = [
        ['bold', 'italic'],
        ['underline', 'link', 'image'],
        ['ordered_list', 'bullet_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
        ['text_color', 'background_color'],
        ['align_left', 'align_center', 'align_right', 'align_justify'],
    ];
    control: FormControl = new FormControl({ value: '', disabled: false });
    @Input() value: string = '';
    @Input() placeholder = '';
    @Input() required = false;
    @Output() valueChange = new EventEmitter<string>();

    private onChange: (value: any) => void = () => {};
    private onTouched: () => void = () => {};

    ngOnInit(): void {
        this.editor = new Editor({
            inputRules: true,
        });
        if (this.required) {
            this.control = new FormControl({ value: '', disabled: false }, [
                Validators.required(schema),
            ]);
        }
        this.control.valueChanges.subscribe((value) => {
            this.emitValue();
            this.onChange(value);
            this.onTouched();
        });
    }

    ngOnChanges() {
        if (this.value) {
            this.control.setValue(this.value, { emitEvent: false });
        }
    }

    ngOnDestroy(): void {
        this.editor.destroy();
    }

    emitValue() {
        const value = this.control.valid ? this.control.value : '';
        this.valueChange.emit(value);
    }

    fieldError(): boolean {
        return this.control.invalid && this.control.dirty;
    }

    writeValue(value: any): void {
        if (value !== undefined && value !== null) {
            this.control.setValue(value, { emitEvent: false });
        } else {
            this.control.setValue('', { emitEvent: false });
        }
    }

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    setDisabledState?(isDisabled: boolean): void {
        if (isDisabled) {
            this.control.disable();
        } else {
            this.control.enable();
        }
    }
}


