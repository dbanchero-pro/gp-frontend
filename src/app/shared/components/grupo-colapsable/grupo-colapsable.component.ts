import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-grupo-colapsable',
    templateUrl: './grupo-colapsable.component.html',
    styleUrls: ['./grupo-colapsable.component.scss'],
    standalone: false
})
export class GrupoColapsableComponent {
    @Input() titulo: string | undefined;
    @Input() ariaLabel: string | undefined;
    @Input() colapsado: boolean = false;
    @Input() class: string | undefined;
    @Input() classContenido: string | undefined = 'mr-2 pr-2 pb-2';
  @Input() classTitulo: string | undefined;

    
    constructor() { }

}

@Component({
  selector: 'titulo',
  standalone: false,
  template: `<ng-content></ng-content>`
})
export class GrupoColapsableTituloComponent { }

@Component({
  selector: 'contenido',
  standalone: false,
  template: `<ng-content></ng-content>`
})
export class GrupoColapsableContenidoComponent {}

