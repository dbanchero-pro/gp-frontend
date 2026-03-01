import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { IColumnaOrden } from '../../models/common/columna-orden.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AlertModule } from 'ngx-bootstrap/alert';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

@Component({
    selector: 'app-cabezal-consulta',
    templateUrl: './cabezal-consulta.component.html',
    styleUrls: ['./cabezal-consulta.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RouterModule,
        AlertModule,
        BsDropdownModule,
        BsDatepickerModule,
        ModalModule,
        PaginationModule,
        TabsModule,
        TooltipModule,
        TypeaheadModule,
        NgxDaterangepickerBootstrapModule,
        NgxEditorModule,
        NgxDatatableModule,
    ],
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

    constructor(public router: Router) {}
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
        if (this.totalItems >= 0 && this.titulo === '') {
            this.titulo = 'Resultado de la búsqueda';
        } else if (
            this.totalItems === -1 &&
            this.titulo === 'Resultado de la búsqueda'
        ) {
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
