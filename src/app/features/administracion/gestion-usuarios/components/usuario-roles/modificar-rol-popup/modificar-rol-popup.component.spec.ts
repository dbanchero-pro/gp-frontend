import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { ModificarRolPopupComponent } from './modificar-rol-popup.component';

describe('ModificarRolPopupComponent', () => {
    let component: ModificarRolPopupComponent;
    let fixture: ComponentFixture<ModificarRolPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ModificarRolPopupComponent],
            providers: [FormBuilder]
        }).compileComponents();

        fixture = TestBed.createComponent(ModificarRolPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
