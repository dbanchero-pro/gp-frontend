import { Directive, OnInit } from '@angular/core';
import { IColumnaOrden } from '../../models/common/columna-orden.model';
import { FormularioBaseComponent } from '../base/formulario-base.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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

@Directive()
export abstract class PaginaBusquedaComponent<T>
    extends FormularioBaseComponent
    implements OnInit
{
    subTituloCantidadDatos = 'No se encontraron resultados.';

    colFiltro: string = 'col-lg-3';
    colTabla: string = 'col-lg-9';

    abstract get columnaOrdenInicial(): string;
    abstract get ordenInicial(): 'asc' | 'desc';

    parametros: any = {
        filtro: {} as Partial<T>,
        pagina: 0,
        tamanoPagina: 10,
        sort: '',
        order: 'asc',
    };
    public total: number = -1;

    ngOnInit(): void {
        this.parametros.sort = this.columnaOrdenInicial;
        this.parametros.order = this.ordenInicial;
    }

    abstract get listaOrden(): IColumnaOrden[];

    abstract buscar(): void;

    protected nuevaConsulta(): void {
        throw new Error('Función no implementada');
    }

    protected descargarExcel(): void {
        throw new Error('Función no implementada');
    }

    cambioPagina(pagina: number) {
        this.parametros.pagina = pagina;
        this.buscar();
    }

    cambioPorPagina(tamanoPagina: number) {
        this.parametros.tamanoPagina = tamanoPagina;
        this.parametros.pagina = 0;
        this.buscar();
    }

    cambioOrden(orden: 'asc' | 'desc') {
        this.parametros.order = orden;
        this.parametros.pagina = 0;
        this.buscar();
    }

    cambioColumnaOrden(columna: string) {
        this.parametros.sort = columna;
        this.buscar();
    }

    filtrando() {
        this.form.markAllAsTouched();
        if (this.form.valid) {
            this.buscar();
        }
    }

    aplicarColapso() {
        if (this.colFiltro === 'col-lg-3') {
            this.colFiltro = 'col-lg-1';
            this.colTabla = 'col-lg-11';
        } else {
            this.colFiltro = 'col-lg-3';
            this.colTabla = 'col-lg-9';
        }
    }
}
