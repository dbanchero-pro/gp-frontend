import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Editor, Toolbar, Validators, schema } from 'ngx-editor';

@Component({
    selector: 'app-text-editor',
    templateUrl: './text-editor.component.html',
    styleUrls: [],
    standalone: false
})
export class TextEditorComponent implements OnInit, OnChanges {
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

    ngOnInit(): void {
        this.editor = new Editor({
            inputRules: true,
        });
        if (this.required) {
            this.control = new FormControl({ value: '', disabled: false }, [
                Validators.required(schema),
            ]);
        }
        this.control.valueChanges.subscribe(() => {
            this.emitValue();
        });
    }
    ngOnChanges() {
        if (this.value) {
            this.control.setValue(this.value);
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
}
