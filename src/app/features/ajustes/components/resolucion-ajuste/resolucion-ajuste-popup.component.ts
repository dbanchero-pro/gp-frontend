import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AppConfig } from 'src/app/app.config';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { IOrdenCompraDTO } from 'src/app/features/entregas/models/orden-ompra.model';
import { ItemOrdenCompraService } from 'src/app/features/entregas/services/item-orden-compra.service';
import { PopupBaseComponent } from 'src/app/shared/components/popup-base/popup-base.component';
import { IAppConfig } from 'src/app/shared/models/common/app-config.model';
import { DocumentosUtilService } from 'src/app/shared/services/common/documentos-util.service';
import { IAjusteDTO } from '../../models/ajuste.model';
import { AjusteService } from '../../services/ajuste.service';


@Component({
    selector: 'app-resolucion-ajuste-popup',
    templateUrl: './resolucion-ajuste-popup.component.html',
    standalone: false
})
export class ResolucionAjustePopupComponent extends PopupBaseComponent implements OnInit {
    @Output() aprobarEvento = new EventEmitter<IAjusteDTO>();
    @Output() rechazarEvento = new EventEmitter<IAjusteDTO>();
    @Input() itemOrdenCompra?: IItemOrdenCompraDTO;
    @Input() ordenCompra!: IOrdenCompraDTO;
    @Input() ajuste!: IAjusteDTO;

    newDate = new Date();
    settings: IAppConfig = AppConfig.settings;


    constructor(
        private readonly fb: FormBuilder,
        protected readonly documentosUtilService: DocumentosUtilService,
        protected readonly itemOrdenCompraService: ItemOrdenCompraService,
        protected readonly ajusteService: AjusteService
    ) {
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this.settings = AppConfig.settings;

        this.form = this.fb.group({
            resolucion: [true, [Validators.required]],
            motivoResolucion: [''],
        });
        
    }

    seleccionarResolucion(acepta: boolean) {
     const motivoResolucion = this.form.get('motivoResolucion')!;
        if (!acepta) {
            motivoResolucion.setValidators([Validators.required]);
            motivoResolucion?.markAsTouched()
        } else {
            motivoResolucion.clearValidators();
        }

        motivoResolucion.updateValueAndValidity({ emitEvent: false });
    }

    guardar(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        const formValues = this.form.value;

        const ajuste: IAjusteDTO = {
            idAjuste: this.ajuste.idAjuste,
            motivoResolucion: formValues.motivoResolucion
        };
        if (formValues.resolucion) {
            this.ajusteService.aprobarAjuste(ajuste)
            .subscribe({
                next: (respuesta: IAjusteDTO) => {
                    this.actualizarService.capturarErrores = true;
                    this.showMsg = false;
                    ajuste.estado = respuesta.estado;
                    this.aprobarEvento.emit(ajuste);
                },
                error: (error) => {
                    this.procesarError(error, 'Error al aprobar el ajuste');
                },
            });
            
        } else { 
            this.ajusteService.rechazarAjuste(ajuste)
            .subscribe({
                next: (ajuste: IAjusteDTO) => {
                    this.actualizarService.capturarErrores = true;
                    this.showMsg = false;
                    this.rechazarEvento.emit(ajuste);
                },
                error: (error) => {
                    this.procesarError(error, 'Error al rechazar el ajuste');
                },
            });
        }
    }

    
}

