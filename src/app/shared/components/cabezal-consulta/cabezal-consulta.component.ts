import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { IColumnaOrden } from '../../models/common/columna-orden.model';

@Component({
    selector: 'app-cabezal-consulta',
    templateUrl: './cabezal-consulta.component.html',
    styleUrls: ['./cabezal-consulta.component.scss'],
})
export class CabezalConsultaComponent implements OnChanges {
    @Input() titulo: string = '';
    @Input() columnaOrden: string = '';
    @Input() listaOrden: IColumnaOrden[] = [];
    @Input() orden: 'asc' | 'desc' = 'asc';
    @Input() textoBoton: string = '';
    @Input() mostrarBoton: boolean = false;
    @Input() routerLinkBtn: Array<any> = [''];
    @Input() totalItems = -1;
    @Output() orderChange = new EventEmitter();
    @Output() sortChange = new EventEmitter();

    subtitulo: string = '';

    constructor(public router: Router) { }
    ngOnChanges(changes: SimpleChanges): void {
        //Subtitulo
        if (this.totalItems === 0) {
            this.subtitulo = 'No se encontraron resultados.';
        } else if (this.totalItems === 1) {
            this.subtitulo = 'Se encontró 1 resultado.';
        } else if (this.totalItems > 1) {
            this.subtitulo = `Se encontraron ${this.totalItems} resultados.`;
        } else {
            this.subtitulo = '';
        }

        //Titulo (si no fue asignado un texto desde la invocación al control)
        if (this.totalItems >= 0 && this.titulo === "") {
            this.titulo = 'Resultado de la búsqueda';
        }
        else if (this.totalItems === -1 && this.titulo === 'Resultado de la búsqueda') {
            this.titulo = '';
        }
    }


    orderChanged() {
        this.orden = this.orden === 'asc' ? 'desc' : 'asc';
        this.orderChange.emit(this.orden);
    }

    sortChanged(event: any) {
        this.sortChange.emit(event.target.value);
    }

    navBtn() {
        this.router.navigate(this.routerLinkBtn);
    }
}


