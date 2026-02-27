import { A11yModule } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AlertComponent, AlertConfig, AlertModule } from 'ngx-bootstrap/alert';
import { defineLocale } from 'ngx-bootstrap/chronos';
import { BsDatepickerConfig, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownConfig, BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { FocusTrapModule } from 'ngx-bootstrap/focus-trap';
import { esLocale } from 'ngx-bootstrap/locale';
import { BsModalService, ModalModule } from 'ngx-bootstrap/modal';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { NgxDaterangepickerBootstrapModule, NgxDaterangepickerLocaleService } from 'ngx-daterangepicker-bootstrap';
import { NgxEditorModule } from 'ngx-editor';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { DocumentoProveedorPipe } from 'src/app/shared/pipes/documento-proveedor.pipe';import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { BotonAccionComponent } from './components/boton-accion/boton-accion.component';
import { CabezalConsultaComponent } from './components/cabezal-consulta/cabezal-consulta.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { DoubleScrollComponent } from './components/double-scroll/double-scroll.component';
import { FiltroItemsArticulosComponent } from './components/filtro-items-articulos/filtro-items-articulos.component';
import { FiltroOrganismoComponent } from './components/filtro-organismo/filtro-organismo.component';
import { FiltroComponent } from './components/filtro/filtro.component';
import { GrupoColapsableComponent, GrupoColapsableContenidoComponent, GrupoColapsableTituloComponent } from './components/grupo-colapsable/grupo-colapsable.component';
import { InputDocumentoComponent } from './components/input-documento/input-documento.component';
import { MensajeComponent } from './components/mensaje/mensaje.component';
import { OrganismoPopupComponent } from './components/organismo-popup/organismo-popup.component';
import { PaginadoComponent } from './components/paginado/paginado.component';
import { RangoFechasComponent } from './components/rango-fechas/rango-fechas.component';
import { RegistroUsuario } from './components/registro-usuario/registro-usuario.component';
import { AppTabDirective, TabsComponent } from './components/tabs/tabs.component';
import { TextEditorComponent } from './components/text-editor/text-editor.component';
import { SoloNumerosDirective } from './directives/solo-numeros.directive';
import { ErrorInterceptor } from './interceptors/error.interceptor';
import { LoadingInterceptor } from './interceptors/loading.interceptor';
import { CapitalizarPrimerLetraPipe } from './pipes/capitalizar-primer-letra.pipe';
import { CompraResumenPipe } from './pipes/compra-resumen.pipe';
import { FechaHoraPipe } from './pipes/fecha-hora.pipe';
import { FechaPipe } from './pipes/fecha.pipe';
import { FormatoCiPipe } from './pipes/formato-ci.pipe';
import { HtmlSeguroPipe } from './pipes/html-seguro.pipe';
import { IdProveedorPipe } from './pipes/id-proveedor.pipe';
import { IdUsuarioPipe } from './pipes/id-usuario.pipe';
import { ItemResumenPipe } from './pipes/item-resumen.pipe';
import { ProveedorPipe } from './pipes/proveedor.pipe';
import { SiNoValorPipe } from './pipes/si-no-valor.pipe';
import { UnidadCompraResumenPipe } from './pipes/unidad-compra-resumen.pipe';
import { UtilService } from './services/common/util.service';
import { NumeroCompraPipe } from './pipes/nro-compra-pipe';

defineLocale('es', esLocale);
const configEditor = {
    locals: {
        // menu
        bold: 'Bold',
        italic: 'Italic',
        code: 'Code',
        blockquote: 'Blockquote',
        underline: 'Underline',
        strike: 'Strike',
        bullet_list: 'Bullet List',
        ordered_list: 'Ordered List',
        heading: 'Tamaño de Fuente',
        h1: 'H1',
        h2: 'H2',
        h3: 'H3',
        h4: 'H4',
        h5: 'H5',
        h6: 'H6',
        align_left: 'Left Align',
        align_center: 'Center Align',
        align_right: 'Right Align',
        align_justify: 'Justify',
        text_color: 'Text Color',
        background_color: 'Background Color',

        // popups, forms, others...
        url: 'URL',
        text: 'Text',
        openInNewTab: 'Open in new tab',
        insert: 'Insert',
        altText: 'Alt Text',
        title: 'Title',
        remove: 'Remove',
    },
};
// @ts-ignore
@NgModule({
    declarations: [
        RegistroUsuario,
        FiltroItemsArticulosComponent,
        MensajeComponent,
        FiltroOrganismoComponent,
        FiltroComponent,
        AlertDialogComponent,
        ConfirmDialogComponent,
        TextEditorComponent,
        PaginadoComponent,
        BotonAccionComponent,
        CabezalConsultaComponent,
        FechaPipe,
        FechaHoraPipe,
        HtmlSeguroPipe,
        CapitalizarPrimerLetraPipe,
        DoubleScrollComponent,
        RangoFechasComponent,
        OrganismoPopupComponent,
        FormatoCiPipe,
        CompraResumenPipe,
        ItemResumenPipe,
        SoloNumerosDirective,
        UnidadCompraResumenPipe,
        IdUsuarioPipe,
        NumeroCompraPipe,
        IdProveedorPipe,
        InputDocumentoComponent,
        DocumentoProveedorPipe,
        SiNoValorPipe,
        ProveedorPipe,
        GrupoColapsableComponent,
        GrupoColapsableTituloComponent,
        GrupoColapsableContenidoComponent,
        TabsComponent,
        AppTabDirective,
    ],
    exports: [
        FormatoCiPipe,
        UnidadCompraResumenPipe,
        CompraResumenPipe,
        ItemResumenPipe,
        RegistroUsuario,
        FiltroItemsArticulosComponent,
        FormsModule,
        FiltroOrganismoComponent,
        ReactiveFormsModule,
        BsDropdownModule,
        TypeaheadModule,
        TabsModule,
        BsDatepickerModule,
        BotonAccionComponent,
        ModalModule,
        MensajeComponent,
        FiltroComponent,
        AlertComponent,
        ConfirmDialogComponent,
        AlertDialogComponent,
        PaginationModule,
        NgxDatatableModule,
        TooltipModule,
        NgxDaterangepickerBootstrapModule,
        TextEditorComponent,
        PaginadoComponent,
        CabezalConsultaComponent,
        RangoFechasComponent,
        FechaHoraPipe,
        FechaPipe,
        NumeroCompraPipe,
        HtmlSeguroPipe,
        CapitalizarPrimerLetraPipe,
        DoubleScrollComponent,
        OrganismoPopupComponent,
        SoloNumerosDirective,
        IdUsuarioPipe,
        IdProveedorPipe,
        InputDocumentoComponent,
        DocumentoProveedorPipe,
        SiNoValorPipe,
        ProveedorPipe,
        GrupoColapsableComponent,
        GrupoColapsableTituloComponent,
        GrupoColapsableContenidoComponent,
        TabsComponent,
        AppTabDirective,
    ],
    imports: [CommonModule,
        CommonModule,
        MatDialogModule,
        BsDropdownModule.forRoot(),
        TypeaheadModule.forRoot(),
        TabsModule.forRoot(),
        A11yModule,
        BsDatepickerModule.forRoot(),
        ModalModule.forRoot(),
        FocusTrapModule,
        AlertModule.forRoot(),
        PaginationModule.forRoot(),
        FormsModule,
        NgxDatatableModule,
        ReactiveFormsModule,
        NgxMaskDirective,
        RouterModule.forChild([]),
        TooltipModule.forRoot(),
        NgxDaterangepickerBootstrapModule.forRoot({
            customRangeLabel: 'Custom range12',
            separator: ' - ',
        }),
        NgxEditorModule.forRoot(configEditor)], providers: [
            UtilService,
            AlertConfig,
            BsDatepickerConfig,
            BsDropdownConfig,
            BsModalService,
            FechaPipe,
            FechaHoraPipe,
            {
                provide: HTTP_INTERCEPTORS,
                useClass: ErrorInterceptor,
                multi: true,
            },
            {
                provide: HTTP_INTERCEPTORS,
                useClass: LoadingInterceptor,
                multi: true,
            },
            NgxDaterangepickerLocaleService,
            provideHttpClient(withInterceptorsFromDi()),
            provideNgxMask()
        ]
})
export class SharedModule { }
