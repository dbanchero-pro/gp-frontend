import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ModificarUsuarioPopupComponent } from './modificar-usuario-popup.component';

describe('ModificarUsuarioPopupComponent', () => {
    let component: ModificarUsuarioPopupComponent;
    let fixture: ComponentFixture<ModificarUsuarioPopupComponent>;

    const bsModalServiceStub = {
        show: jasmine
            .createSpy('show')
            .and.returnValue({ content: {}, hide: jasmine.createSpy('hide') }),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [],
            imports: [ReactiveFormsModule, ModificarUsuarioPopupComponent],
            providers: [
                { provide: BsModalService, useValue: bsModalServiceStub },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        fixture = TestBed.createComponent(ModificarUsuarioPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });
});
