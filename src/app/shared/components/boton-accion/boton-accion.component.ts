import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccionBoton } from '../../models/common/accion-boton.model';
import { SeguridadService } from '../../services/common/seguridad.service';
import { uuidv4 } from '../../utils/functions';import { CommonModule } from '@angular/common';import { FormsModule, ReactiveFormsModule } from '@angular/forms';import { AlertModule } from 'ngx-bootstrap/alert';import { BsDropdownModule } from 'ngx-bootstrap/dropdown';import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';import { ModalModule } from 'ngx-bootstrap/modal';import { PaginationModule } from 'ngx-bootstrap/pagination';import { TabsModule } from 'ngx-bootstrap/tabs';import { TooltipModule } from 'ngx-bootstrap/tooltip';import { TypeaheadModule } from 'ngx-bootstrap/typeahead';import { NgxDaterangepickerBootstrapModule } from 'ngx-daterangepicker-bootstrap';import { NgxEditorModule } from 'ngx-editor';import { NgxDatatableModule } from '@swimlane/ngx-datatable';














@Component({
    selector: 'app-boton-accion',
    templateUrl: './boton-accion.component.html',
    styleUrls: ['./boton-accion.component.scss'],
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
    NgxDatatableModule
  ],
})

export class BotonAccionComponent implements OnChanges, OnInit {
    @Input() acciones: AccionBoton[] = [];
    @Input() ariaLabelMasOpciones!: string;

    accionPrincipal?: AccionBoton;
    opcionesMenu: AccionBoton[] = [];

    @ViewChild('buttonSplit')
    buttonSplit!: any;

    @Output() accionEjecutada = new EventEmitter<AccionBoton>();

    uuid = uuidv4();

    constructor(private readonly seguridad: SeguridadService, private readonly router: Router) { }
    ngOnChanges(changes: SimpleChanges): void {
        this.inicializarAcciones();
    }


    ngOnInit() {
        this.inicializarAcciones();
    }

    inicializarAcciones() {

        const accionesPermitidas = this.filtrarAccionesPorPermiso(this.acciones);

        //La primera opcion es la principal, el resto es el menu
        if (accionesPermitidas.length > 0) {
            this.accionPrincipal = accionesPermitidas[0];
            this.opcionesMenu = accionesPermitidas.slice(1);
        } else {
            this.accionPrincipal = undefined;
            this.opcionesMenu = [];
        }
    }

    ejecutarAccion(accion: AccionBoton, event: Event) {
        event.stopPropagation();
        if (accion.accion) {
            accion.accion();
        }
        if (accion.url) {
            this.router.navigate(accion.url);
        }
        this.accionEjecutada.emit(accion);
    }

    filtrarAccionesPorPermiso(acciones: AccionBoton[]): AccionBoton[] {
        return acciones.filter(accion => this.tienePermisoParaAccion(accion));
    }

    tienePermisoParaAccion(accion: AccionBoton): boolean {
        // Si no hay permisos se permite la acción
        if (!accion.permisos || accion.permisos.length === 0) {
            return !accion.acciones || accion.acciones.length === 0 ? true : this.filtrarAccionesPorPermiso(accion.acciones).length > 0;

        }

        return accion.permisos.some(permiso => this.seguridad.tienePermiso(permiso));
    }

    tieneOpcionesMenu(): boolean {
        return this.opcionesMenu && this.opcionesMenu.length > 0;
    }
}

export { AccionBoton };



