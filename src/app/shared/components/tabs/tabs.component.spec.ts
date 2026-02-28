import { Component, QueryList } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AppTabDirective, TabsComponent } from './tabs.component';

@Component({
  standalone: true,
  imports: [TabsComponent, AppTabDirective],
  template: `
    <app-tabs [(selectedIndex)]="seleccionado">
      <ng-template appTab="Uno">Contenido 1</ng-template>
      <ng-template appTab="Dos" [deshabilitado]="true">Contenido 2</ng-template>
      <ng-template appTab="Tres">Contenido 3</ng-template>
    </app-tabs>
  `
})
class HostComponent {
  seleccionado = 0;
}

describe('TabsComponent', () => {
  let fixture: ComponentFixture<HostComponent>;
  let component: TabsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [],
      imports: [
        HostComponent,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    component = fixture.debugElement.query(By.directive(TabsComponent)).componentInstance;
  });

  it('debe excluir los tabs deshabilitados de enabledTabs', () => {
    expect(component.enabledTabs).toEqual([0, 2]);
  });

  it('cambiarTab actualiza el índice y emite evento', () => {
    spyOn(component.selectedIndexChange, 'emit');
    component.cambiarTab(2);
    expect(component.selectedIndex).toBe(2);
    expect(component.selectedIndexChange.emit).toHaveBeenCalledWith(2);
    expect(component.estaCargado(2)).toBeTrue();
  });

  it('cambiarTab ignora índices inválidos o deshabilitados', () => {
    component.cambiarTab(1);
    expect(component.selectedIndex).toBe(0);
    component.cambiarTab(99);
    expect(component.selectedIndex).toBe(0);
  });

  it('handleKeydown navega entre tabs con teclas de flecha', () => {
    const evento = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    component.handleKeydown(evento);
    expect(component.selectedIndex).toBe(2);
  });

  it('ngAfterContentInit corrige un índice inicial inválido', () => {
    component.selectedIndex = 10;
    (component as any).ensureValidSelection();
    expect(component.selectedIndex).toBe(0);
  });

  it('ensureValidSelection ajusta cuando no hay tabs', () => {
    const comp = new TabsComponent({} as any);
    (comp as any).tabs = new (QueryList as any)();
    comp.selectedIndex = 3;
    (comp as any).ensureValidSelection();
    expect(comp.selectedIndex).toBe(0);
  });

  it('estaCargado siempre es verdadero si lazy es falso', () => {
    component.lazy = false;
    expect(component.estaCargado(5)).toBeTrue();
  });

  it('handleKeydown permite navegar con Home y End y respeta teclas no soportadas', () => {
    component.selectedIndex = 2;
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(component.selectedIndex).toBe(0);
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'End' }));
    expect(component.selectedIndex).toBe(2);
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(component.selectedIndex).toBe(2);
  });

  it('handleKeydown con ArrowLeft desde el primero salta al último habilitado', () => {
    component.selectedIndex = 0;
    component.handleKeydown(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    expect(component.selectedIndex).toBe(2);
  });

  it('cambiarTab no emite si se elige el mismo índice', () => {
    spyOn(component.selectedIndexChange, 'emit');
    component.cambiarTab(0);
    expect(component.selectedIndexChange.emit).not.toHaveBeenCalled();
  });
});
