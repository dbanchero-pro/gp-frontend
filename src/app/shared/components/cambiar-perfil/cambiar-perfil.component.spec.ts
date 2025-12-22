import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TipoUsuario } from '../../enum/tipo-usuario.enum';
import { SeguridadService } from '../../services/common/seguridad.service';
import { CambiarPerfilComponent } from './cambiar-perfil.component';


describe('UcProveedorDialogComponent', () => {
    let component: CambiarPerfilComponent;
    let fixture: ComponentFixture<CambiarPerfilComponent>;
    let seguridadServiceMock = {
        obtenerTipoUsuario(): TipoUsuario {
            return TipoUsuario.ORGANISMO; // Valor por defecto para las pruebas
        },
        cambiarTipoUsuario(tipo: TipoUsuario): void {}
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [CambiarPerfilComponent],
            imports: [MatDialogModule, ReactiveFormsModule],
            providers: [
                { provide: SeguridadService, useValue: seguridadServiceMock},    
                {
                    provide: MatDialogRef,
                    useValue: { close: jasmine.createSpy('close') },
                },
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        });

        fixture = TestBed.createComponent(CambiarPerfilComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('debería crearse', () => {
        expect(component).toBeTruthy();
    });

    it('debería cerrar el modal con el tipo seleccionado al aceptar', () => {
        component.tipoUsuario.setValue(TipoUsuario.ORGANISMO);
        component.aceptar();
        expect(component.dialogRef.close).toHaveBeenCalledWith({
            tipo: TipoUsuario.ORGANISMO,
        });
    });

    it('debería cerrar el modal al cancelar', () => {
        component.onCancel();
        expect(component.dialogRef.close).toHaveBeenCalled();
    });
});
