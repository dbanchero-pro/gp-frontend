import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuditoriaBaseComponent } from 'src/app/features/entregas/components/comun/auditoria-base/auditoria-base.component';
import { AuditoriaAjusteTipoOperacion } from 'src/app/features/entregas/enum/auditoria-ajuste-tipo-operacion.enum';
import { IAuditoriaAjusteDTO } from 'src/app/features/entregas/models/auditoria-ajuste.model';
import { IFiltroAuditoriaEntregaAjusteDTO } from 'src/app/features/entregas/models/filtros/filtro-auditoria-entrega-ajuste.model';
import { AuditoriaAjusteService } from 'src/app/features/entregas/services/auditoria-ajuste.service';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { PageableModel } from 'src/app/shared/models/common/page/pageable.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';


@Component({
    selector: 'app-auditoria-ajuste',
    templateUrl: './auditoria-ajuste.component.html',
    styleUrl: './auditoria-ajuste.component.scss',
    standalone: false,
})
export class AuditoriaAjusteComponent extends AuditoriaBaseComponent<IAuditoriaAjusteDTO,IFiltroAuditoriaEntregaAjusteDTO> implements OnInit {
  
    tiposOperacion = [
        { id: null, nombre: 'Todas' },
        { id: AuditoriaAjusteTipoOperacion.alta, nombre: 'Alta' },
        { id: AuditoriaAjusteTipoOperacion.baja, nombre: 'Baja' },
        { id: AuditoriaAjusteTipoOperacion.modificacion, nombre: 'Modificación' },
        { id: AuditoriaAjusteTipoOperacion.confirmacion, nombre: 'Confirmación' },
        { id: AuditoriaAjusteTipoOperacion.aprobacion, nombre: 'Aprobación' },
        { id: AuditoriaAjusteTipoOperacion.rechazo, nombre: 'Rechazo' },
        { id: AuditoriaAjusteTipoOperacion.agregar_descargo, nombre: 'Agregar descargo' }
    ];
    listaOrden: IColumnaOrden[] = [
        { id: 'fechaOperacion', nombre: 'Fecha operación', },
        { id: 'usuario', nombre: 'Usuario' },
        { id: 'tipoOperacion', nombre: 'Tipo operación' },
    ];

    ordenInicial: 'asc' | 'desc' = 'desc';
    columnaOrdenInicial: string = 'fechaOperacion';

    constructor(
        protected override readonly fb: FormBuilder,
        protected override readonly route: ActivatedRoute,
        protected override readonly ordenCompraService: OrdenCompraService,
        protected override readonly seguridad: SeguridadService,
        private readonly auditoriaService: AuditoriaAjusteService,
        protected override readonly actualizar: ActualizarService
    ) {
        super(fb, route, ordenCompraService, seguridad, actualizar);

    }

    override ngOnInit(): void {
        super.ngOnInit();
    }


    override buscar(): void {
        super.buscarInterno((pageable: PageableModel, filtro: Partial<IFiltroAuditoriaEntregaAjusteDTO>) =>
            this.auditoriaService.getPageable(pageable, filtro));
    }

    actualizarFiltrosYBuscar(): void {
        this.actualizarFiltrosYBuscarInterno((pageable: PageableModel, filtro: Partial<IFiltroAuditoriaEntregaAjusteDTO>) =>
            this.auditoriaService.getPageable(pageable, filtro));
    }
}
