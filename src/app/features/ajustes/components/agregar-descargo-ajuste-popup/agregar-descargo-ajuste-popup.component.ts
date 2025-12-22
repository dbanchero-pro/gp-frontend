import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { AgregarDescargoPopupBaseComponent } from 'src/app/shared/components/agregar-descargo-popup-base/agregar-descargo-popup-base.component';
import { IAjusteDTO } from '../../models/ajuste.model';
import { AjusteService } from '../../services/ajuste.service';

@Component({
    selector: 'app-agregar-descargo-ajuste-popup',
    templateUrl: './agregar-descargo-ajuste-popup.component.html',
    standalone: false
})
export class AgregarDescargoAjustePopupComponent extends AgregarDescargoPopupBaseComponent implements OnInit {

    @Input() ajuste!: IAjusteDTO;

    constructor(
        protected override readonly fb: FormBuilder,
        private readonly ajusteService: AjusteService
    ) {
        super(fb);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    guardar(): void {
        super.guardarInterno((dto) => this.ajusteService.agregarDescargo(dto), this.ajuste.idAjuste);
    }

}
