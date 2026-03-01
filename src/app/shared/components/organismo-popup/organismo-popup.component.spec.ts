import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ActualizarService } from '../../services/common/actualizar.service';
import { SharedModule } from '../../shared.module';
import { OrganismoPopupComponent } from './organismo-popup.component';

describe('OrganismoPopupComponent', () => {
    let component: OrganismoPopupComponent;
    let bsModalRef: jasmine.SpyObj<BsModalRef>;

    beforeEach(async () => {
        bsModalRef = jasmine.createSpyObj('BsModalRef', ['hide']);

        await TestBed.configureTestingModule({
            declarations: [],
            imports: [
                ReactiveFormsModule,
                SharedModule,
                OrganismoPopupComponent,
            ],
            providers: [
                { provide: BsModalRef, useValue: bsModalRef },
                FormBuilder,
                { provide: ActualizarService, useValue: {} },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        const fixture = TestBed.createComponent(OrganismoPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse con el formulario inicializado', () => {
        expect(component).toBeTruthy();
        expect(component.form).toBeDefined();
    });

    it('no debería emitir si los campos requeridos no son válidos', () => {
        spyOn(component.guardarEvento, 'emit');
        spyOn(component, 'cerrarPopup');
        component.guardar();
        expect(component.form.valid).toBeFalse();
        expect(component.guardarEvento.emit).not.toHaveBeenCalled();
        expect(component.cerrarPopup).not.toHaveBeenCalled();
    });

    it('debería emitir si los campos requeridos son válidos', () => {
        spyOn(component.guardarEvento, 'emit');
        spyOn(component, 'cerrarPopup');
        component.form
            .get('organismo')
            ?.setValue({
                idInciso: 1,
                idUnidadEjecutora: 1,
                idUnidadCompra: 1,
            });
        component.form.get('esEditor')?.setValue(true);
        component.guardar();
        expect(component.form.valid).toBeTrue();
        expect(component.guardarEvento.emit).toHaveBeenCalled();
        expect(component.cerrarPopup).toHaveBeenCalled();
    });
});
