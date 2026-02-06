import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EliminarClausulaPopupComponent } from './eliminar-clausula-popup.component';

describe('EliminarClausulaPopupComponent', () => {
  let component: EliminarClausulaPopupComponent;
  let fixture: ComponentFixture<EliminarClausulaPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EliminarClausulaPopupComponent],
      providers: [
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close') } },
        { provide: MAT_DIALOG_DATA, useValue: { denominacion: 'Test', tieneVersionEditable: false } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EliminarClausulaPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
