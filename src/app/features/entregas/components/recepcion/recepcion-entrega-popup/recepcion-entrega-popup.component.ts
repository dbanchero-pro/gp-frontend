import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from 'src/app/app.config';
import { IAppConfig } from 'src/app/shared/models/common/app-config.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregaDTO } from '../../../models/entrega.model';
import { IEntregableDTO } from '../../../models/entregable.model';
import { IItemOrdenCompraDTO } from '../../../models/item-orden-compra.model';
import { IOrdenCompraDTO } from '../../../models/orden-ompra.model';
import { EntregableService } from '../../../services/entregable.service';
import { ItemOrdenCompraService } from '../../../services/item-orden-compra.service';
import { RecepcionConformidadBaseComponent } from '../../comun/recepcion-conformidad-base/recepcion-conformidad-base.component';


@Component({
    selector: 'app-recepcion-entrega-popup',
    templateUrl: './recepcion-entrega-popup.component.html',
    standalone: false
})
export class RecepcionEntregaPopupComponent extends RecepcionConformidadBaseComponent implements OnInit {
    @Output() guardarEvento = new EventEmitter<IEntregaDTO>();
    @Input() esModificacion: boolean = false;
    @Input() override itemOrdenCompra!: IItemOrdenCompraDTO;
    @Input() override ordenCompra!: IOrdenCompraDTO;
    @Input() override entrega!: IEntregaDTO;
    @Input() override entregable!: IEntregableDTO;

    newDate = new Date();
    TipoUnidad = TipoUnidad;
    settings: IAppConfig = AppConfig.settings;

    titulo: string = '';

    constructor(
        private readonly fb: FormBuilder,
        protected override readonly documentosUtilService: DocumentosUtilService,
        protected override readonly itemOrdenCompraService: ItemOrdenCompraService,
        protected override readonly entregableService: EntregableService
    ) {
        super(documentosUtilService, itemOrdenCompraService, entregableService);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.settings = AppConfig.settings;
        this.obtenerItemOrdenCompra();
        this.obtenerEntregable();

        this.form = this.fb.group({
            fechaRecepcion: ['', [Validators.required, this.fechaRangoValidatorRecepcion()]],
            cantidadAceptada: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/), this.validarCantidadAceptada(), this.validarFormatoDecimal(this.esPorcentaje)]],
            cantidadRechazada: ['', [Validators.required, Validators.min(0), Validators.pattern(/^\d+(\.\d{1,2})?$/), this.validarCantidadRechazada(), this.validarFormatoDecimal(this.esPorcentaje)]],
            cantidadPendiente: [''],
            motivo: ['', [this.motivoRequeridoSiRechazo()]],
        });

        this.cargarDatosEntrega();
        this.configurarRecalculoAutomatico();
        
        //Valores por defecto
        if (this.entrega && this.entrega?.cantidadRecepcionAceptada == null) {
            this.form.get('cantidadAceptada')?.setValue(this.entrega.cantidad ?? 0);
            this.form.get('cantidadRechazada')?.setValue(0);
        }
    }


    protected override obtenerCantidadTotal(): number {
        return this.entrega?.cantidad ?? 0;
    }

    private cargarDatosEntrega(): void {
        if (this.entrega) {
            this.form.patchValue({
                fechaComprometida: this.entrega.fechaComprometida ?? '',
                personasResponsables: this.entrega.responsable,
                cantidadPorcentaje: {
                    tipo: this.entrega.tipoUnidad,
                    valor: this.entrega.cantidad
                },
                fechaRecepcion: new Date().toISOString().split('T')[0],
                cantidadAceptada: this.entrega.cantidadRecepcionAceptada,
                cantidadRechazada: this.entrega.cantidadRecepcionRechazada,
                motivo: this.entrega.motivoRecepcionRechazada ?? ''
            });
            this.documentos = this.entrega.documentosRecepcion ?? [];
            this.titulo = this.esModificacion ? 'Modificar Recepción Entrega: ' : 'Recepcionar Entrega: ';
        } else {
            this.form.patchValue({
                fechaRecepcion: new Date().toISOString().split('T')[0],
                cantidadAceptada: 0,
                cantidadRechazada: 0,
                cantidadPendiente: this.obtenerCantidadTotal()
            });
        }
    }


    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;

        const cantidadAceptada = Number(formValues.cantidadAceptada);
        const cantidadRechazada = Number(formValues.cantidadRechazada);

        const entrega: IEntregaDTO = {
            idEntrega: this.entrega?.idEntrega,
            fechaComprometida: formValues.fechaComprometida,
            cantidad: this.entrega?.cantidad ?? 0,
            tipoUnidad: this.entrega?.tipoUnidad,
            estado: this.entrega?.estado,
            responsable: formValues.personasResponsables,
            documentosRecepcion: this.documentos.filter(d => d.eliminado === true || d.modificado === true),
            itemOrdenCompra: this.itemOrdenCompra ?? undefined,
            entregable: this.entregable ?? undefined,
            cantidadRecepcionAceptada: cantidadAceptada,
            cantidadRecepcionRechazada: cantidadRechazada,
            fechaRecepcion: formValues.fechaRecepcion,
            motivoRecepcionRechazada: formValues.motivo
        };

        this.guardarEvento.emit(entrega);
    }
}

