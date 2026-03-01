import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
} from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
    selector: 'app-paginado',
    templateUrl: './paginado.component.html',
    styleUrls: ['./paginado.component.scss'],
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
export class PaginadoComponent implements OnChanges, OnInit {
    @Input() totalItems = 10;
    @Input() itemsPorPagina = 5;
    @Input() paginaActual = 0;
    @Output() cambioPagina = new EventEmitter<number>();
    @Output() cambioItemsPorPagina = new EventEmitter<number>();
    perPages = [5, 10, 15, 20];
    showDirectionLinks = true;
    showBoundaryLinks = true;
    currentPage: FormControl = new FormControl(this.paginaActual);
    cambioItemPorPagina = false;
    ngOnInit() {
        // Asignar paginaActual a paginaActual cuando el componente se inicializa
        this.paginaActual ??= 0;
        this.currentPage.setValue(this.paginaActual);
    }

    ngOnChanges(changes: SimpleChanges) {
        // Asignar paginaActual a paginaActual cuando el input cambia
        if (
            changes['paginaActual'] &&
            !changes['paginaActual'].isFirstChange()
        ) {
            this.currentPage.setValue(this.paginaActual);
        }
    }
    paginaCambiada(event: any) {
        if (this.cambioItemPorPagina) {
            this.cambioItemPorPagina = false;
            return;
        }

        this.cambioPagina.emit(event.page - 1);
    }
    cambioPorPagina() {
        this.cambioItemPorPagina = this.currentPage.value !== 1;
        this.cambioItemsPorPagina.emit(this.itemsPorPagina);
        this.currentPage.setValue(1);
    }
}
