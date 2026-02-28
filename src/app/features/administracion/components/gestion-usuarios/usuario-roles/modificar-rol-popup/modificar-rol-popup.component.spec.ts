import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { FormatoCiPipe } from 'src/app/shared/pipes/formato-ci.pipe';
import { ModificarRolPopupComponent } from './modificar-rol-popup.component';

describe('ModificarRolPopupComponent', () => {
    let component: ModificarRolPopupComponent;
    let fixture: ComponentFixture<ModificarRolPopupComponent>;

    const bsModalServiceStub = {
        show: jasmine.createSpy('show').and.returnValue({ content: {}, hide: jasmine.createSpy('hide') })
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [
              ReactiveFormsModule,
              ModificarRolPopupComponent,
              FormatoCiPipe,
            ],
            providers: [
                FormBuilder,
                { provide: BsModalService, useValue: bsModalServiceStub }
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }).compileComponents();

        fixture = TestBed.createComponent(ModificarRolPopupComponent);
        component = fixture.componentInstance;
        component.permiso = { id: 1, nombre: 'Permiso', esEditor: false };
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
