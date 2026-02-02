import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaUsuariosRolesCompraComponent } from './consulta-usuarios-roles-compra.component';

describe('ConsultaUsuariosRolesCompraComponent', () => {
    let component: ConsultaUsuariosRolesCompraComponent;
    let fixture: ComponentFixture<ConsultaUsuariosRolesCompraComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConsultaUsuariosRolesCompraComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ConsultaUsuariosRolesCompraComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
