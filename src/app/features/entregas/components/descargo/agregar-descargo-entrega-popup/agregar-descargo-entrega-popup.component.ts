import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AgregarDescargoPopupBaseComponent } from 'src/app/shared/components/agregar-descargo-popup-base/agregar-descargo-popup-base.component';
import { IEntregaDTO } from '../../../models/entrega.model';
import { EntregaService } from '../../../services/entrega.service';

@Component({
    selector: 'app-agregar-descargo-entrega-popup',
    templateUrl: './agregar-descargo-entrega-popup.component.html',
    standalone: false
})
export class AgregarDescargoEntregaPopupComponent extends AgregarDescargoPopupBaseComponent implements OnInit {

    @Input() entrega!: IEntregaDTO;

    constructor(
        protected override readonly fb: FormBuilder,
        private readonly entregaService: EntregaService
    ) {
        super(fb);
    }

    override ngOnInit(): void {
        super.ngOnInit();

    }

    guardar(): void {
        super.guardarInterno((dto) => this.entregaService.agregarDescargo(dto), undefined, this.entrega.idEntrega);
    }

}
