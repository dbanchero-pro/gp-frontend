import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-filtro',
    templateUrl: './filtro.component.html',
    styleUrls: ['./filtro.component.scss'],
    standalone: false
})
export class FiltroComponent {
    @Output() evFilter = new EventEmitter<any>();
    @Output() evDownload = new EventEmitter<any>();
    @Output() evCollapse = new EventEmitter<any>();
    @Input() title = 'Búsqueda';
    @Input() titleBtn = 'Aplicar filtros';
    @Input() iconTitle: string = 'fa fa-search';
    @Input() activarCollapse = true;
    @Input() mostrarFiltros = true;
    @Input() mostrarBtnFilter = true;
    @Input() claseCabezal = "";

    public collapsed = false;

    constructor() { 
        this.collapsed = false;
    }

    download(): void {
        this.evDownload.emit();
    }

    filter(): void {
        this.evFilter.emit();
    }

    toggleCollapse(): boolean {
        this.collapsed = !this.collapsed;
        this.evCollapse.emit();
        return this.collapsed;
    }

}
