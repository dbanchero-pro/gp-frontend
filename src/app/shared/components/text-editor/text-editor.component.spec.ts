import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorComponent } from './text-editor.component';
import { SharedModule } from '../../shared.module';
import { Validators, schema } from 'ngx-editor';
import { FormControl } from '@angular/forms';
describe('TextEditorComponent', () => {
    let component: TextEditorComponent;
    let fixture: ComponentFixture<TextEditorComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [],
            imports: [
              SharedModule,
              TextEditorComponent,
            ],
        });
        fixture = TestBed.createComponent(TextEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    it('debería inicializar el editor y el control', () => {
        // Act
        component.ngOnInit();

        // Assert
        expect(component.editor).toBeDefined();
        expect(component.control).toBeDefined();
    });

    it('debería crear un control con Validators.required si required es true', () => {
        // Arrange
        component.required = true;
        component.control = new FormControl({ value: '', disabled: false }, [
            Validators.required(schema),
        ]);
        // Act
        component.ngOnInit();

        // Assert
        expect(component.control.invalid).toBeTruthy();
    });

    it('debería establecer el valor del control si se proporciona un valor', () => {
        // Arrange
        const mockValue = '<p>test value</p>';
        component.value = mockValue;

        // Act
        component.ngOnChanges();

        // Assert
        expect(component.control.value).toEqual(mockValue);
    });

    it('debería destruir el editor en ngOnDestroy', () => {
        // Arrange
        spyOn(component.editor, 'destroy').and.callThrough();

        // Act
        component.ngOnDestroy();

        // Assert
        expect(component.editor.destroy).toHaveBeenCalled();
    });

    it('debería emitir el valor del control cuando es válido', () => {
        // Arrange
        const mockValue = 'test value';
        component.control = new FormControl(mockValue, [
            Validators.required(schema),
        ]);

        spyOn(component.valueChange, 'emit');

        // Act
        component.emitValue();

        // Assert
        expect(component.valueChange.emit).toHaveBeenCalledWith(mockValue);
    });

    it('debería emitir una cadena vacía para un control no válido', () => {
        // Arrange
        component.control = new FormControl('', [Validators.required(schema)]);

        spyOn(component.valueChange, 'emit');

        // Act
        component.emitValue();

        // Assert
        expect(component.valueChange.emit).toHaveBeenCalledWith('');
    });

    it('debería devolver true cuando el control es inválido y está marcado como dirty', () => {
        // Arrange
        component.control = new FormControl('', [Validators.required(schema)]);
        component.control.markAsDirty();
        component.control.setErrors({ required: true }); // Simulate an invalid state

        // Act
        const result = component.fieldError();

        // Assert
        expect(result).toBe(true);
    });

    it('debería devolver false cuando el control no está marcado como dirty', () => {
        // Arrange
        component.control = new FormControl('', [Validators.required(schema)]);
        component.control.setErrors({ required: true }); // Simulate an invalid state

        // Act
        const result = component.fieldError();

        // Assert
        expect(result).toBe(false);
    });

    it('debería devolver false cuando el control no es inválido', () => {
        // Arrange
        component.control = new FormControl('valid value', [
            Validators.required(schema),
        ]);
        component.control.markAsDirty();

        // Act
        const result = component.fieldError();

        // Assert
        expect(result).toBe(false);
    });
});
