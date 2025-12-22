import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RegistroUsuario } from './registro-usuario.component';

describe('RegistroUsuario', () => {
  let component: RegistroUsuario;
  let fixture: ComponentFixture<RegistroUsuario>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegistroUsuario],
    }).compileComponents();

    fixture = TestBed.createComponent(RegistroUsuario);
    component = fixture.componentInstance;
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('debería mostrar el documento si `documento` es true', () => {
    component.usuario = {
      nombre: 'Ana Gómez',
      correo: 'ana@correo.com',
      id: 'UY-CI-12345678', // 🔧 usa `id`, como en el template
    };
    component.documento = true;
    fixture.detectChanges();

    const cardText = fixture.nativeElement.textContent;
    expect(cardText).toContain('Documento');
    expect(cardText).toContain('UY CI 12345678');
  });

  it('no debería mostrar el documento si `documento` es false', () => {
    component.usuario = {
      nombre: 'Ana Gómez',
      correo: 'ana@correo.com',
      id: 'UY-CI-12345678',
    };
    component.documento = false;
    fixture.detectChanges();

    const cardText = fixture.nativeElement.textContent;
    expect(cardText).not.toContain('12345678');
  });

  it('debería mostrar el correo si `correo` es true', () => {
    component.usuario = {
      nombre: 'Ana Gómez',
      correo: 'ana@correo.com',
      id: 'UY-CI-12345678',
    };
    component.correo = true;
    fixture.detectChanges();

    const cardText = fixture.nativeElement.textContent;
    expect(cardText).toContain('Correo electrónico');
    expect(cardText).toContain('ana@correo.com');
  });

  it('no debería mostrar el correo si `correo` es false', () => {
    component.usuario = {
      nombre: 'Ana Gómez',
      correo: 'ana@correo.com',
      id: 'UY-CI-12345678',
    };
    component.correo = false;
    fixture.detectChanges();

    const cardText = fixture.nativeElement.textContent;
    expect(cardText).not.toContain('ana@correo.com');
  });

  it('debería ejecutar `accionEliminar` al hacer click en el botón Eliminar', () => {
    const spyEliminar = jasmine.createSpy('accionEliminar');
    component.usuario = { nombre: 'Ana', correo: '', id: '123' };
    component.accionEliminar = spyEliminar;
    fixture.detectChanges();

    const btn = fixture.debugElement.query(By.css('button'));
    btn.nativeElement.click();

    expect(spyEliminar).toHaveBeenCalled();
  });

  it('formatearDocumento devuelve vacío si no hay dato', () => {
    expect(component.formatearDocumento('')).toBe('');
  });

  it('formatearDocumento formatea correctamente', () => {
    expect(component.formatearDocumento('uy-ci-123')).toBe('UY CI 123');
  });

  it('formatearDocumento devuelve en mayúsculas sin guiones', () => {
    expect(component.formatearDocumento('abc')).toBe('ABC');
  });
});
