import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaUsuariosRolesComponent } from './consulta-usuarios-roles.component';

describe('ConsultaUsuariosRolesComponent', () => {
    let component: ConsultaUsuariosRolesComponent;
    let fixture: ComponentFixture<ConsultaUsuariosRolesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConsultaUsuariosRolesComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ConsultaUsuariosRolesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
