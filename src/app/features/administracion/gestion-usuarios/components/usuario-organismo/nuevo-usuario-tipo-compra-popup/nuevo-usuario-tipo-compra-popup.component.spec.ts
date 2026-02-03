import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NuevoUsuarioTipoCompraPopupComponent } from './nuevo-usuario-tipo-compra-popup.component';

describe('NuevoUsuarioTipoCompraPopupComponent', () => {
    let component: NuevoUsuarioTipoCompraPopupComponent;
    let fixture: ComponentFixture<NuevoUsuarioTipoCompraPopupComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NuevoUsuarioTipoCompraPopupComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(NuevoUsuarioTipoCompraPopupComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
