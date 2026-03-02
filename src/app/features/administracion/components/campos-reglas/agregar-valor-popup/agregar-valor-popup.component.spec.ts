import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgregarValorPopupComponent } from './agregar-valor-popup.component';

describe('AgregarValorPopupComponent', () => {
    let component: AgregarValorPopupComponent;
    let fixture: ComponentFixture<AgregarValorPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AgregarValorPopupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(AgregarValorPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
