import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConsultaUsuariosRolesItemsComponent } from './consulta-usuarios-roles-items.component';

describe('ConsultaUsuariosRolesItemsComponent', () => {
    let component: ConsultaUsuariosRolesItemsComponent;
    let fixture: ComponentFixture<ConsultaUsuariosRolesItemsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ConsultaUsuariosRolesItemsComponent]
        })
            .compileComponents();

        fixture = TestBed.createComponent(ConsultaUsuariosRolesItemsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
