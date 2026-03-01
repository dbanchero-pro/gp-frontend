import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { TipoMensajeEnum } from '../../enum/tipo-mensaje.enum';
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
    selector: 'app-mensaje',
    templateUrl: './mensaje.component.html',
    styleUrls: ['./mensaje.component.scss'],
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
export class MensajeComponent implements OnInit {
    @Input() showMsg: boolean = false;
    @Input() typeMsg: TipoMensajeEnum = TipoMensajeEnum.success;
    @Input() messages: string[] = [''];
    @Input() duration: number = 5000;
    constructor(
        private readonly actualizar: ActualizarService,
        private readonly router: Router,
    ) {
        const mensaje$ = this.actualizar?.mensaje$ as any;
        if (!mensaje$?.subscribe) {
            return;
        }
        mensaje$.subscribe((mensajes: any) => {
            if (mensajes.length === 2) {
                this.messages = mensajes[0];
                this.typeMsg = mensajes[1];
                this.showMsg = true;
                window.scrollTo(0, 0);
            } else {
                this.showMsg = false;
            }
        });
    }
    ngOnInit(): void {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd && this.showMsg) {
                this.showMsg = false;
            }
        });
    }

    onClose(): void {
        this.showMsg = false;
    }
}
