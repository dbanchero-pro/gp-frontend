import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuditoriaSeguimientoEntregaTipoOperacion as AuditoriaEntregaTipoOperacion } from 'src/app/features/entregas/enum/auditoria-seguimiento-entrega-tipo-operacion.enum';
import { IColumnaOrden } from 'src/app/shared/models/common/columna-orden.model';
import { PageableModel } from 'src/app/shared/models/common/page/pageable.model';
import { ActualizarService } from 'src/app/shared/services/common/actualizar.service';
import { SeguridadService } from 'src/app/shared/services/common/seguridad.service';
import { OrdenCompraService } from 'src/app/shared/services/orden-compra.service';
import { IAuditoriaEntregaDTO } from '../../../models/auditoria-entrega.model';
import { IFiltroAuditoriaEntregaAjusteDTO } from '../../../models/filtros/filtro-auditoria-entrega-ajuste.model';
import { AuditoriaEntregaService } from '../../../services/auditoria-entrega.service';
import { AuditoriaBaseComponent } from '../../comun/auditoria-base/auditoria-base.component';

@Component({
    selector: 'app-auditoria-entrega',
    templateUrl: './auditoria-entrega.component.html',
    styleUrl: './auditoria-entrega.component.scss',
    standalone: false,
})
export class AuditoriaEntregaComponent extends AuditoriaBaseComponent<IAuditoriaEntregaDTO,IFiltroAuditoriaEntregaAjusteDTO> implements OnInit {
    
    tiposOperacion = [
        { id: null, nombre: 'Todas' },
        { id: AuditoriaEntregaTipoOperacion.entrega_alta, nombre: 'Entrega - Alta' },
        { id: AuditoriaEntregaTipoOperacion.entrega_baja, nombre: 'Entrega - Baja' },
        { id: AuditoriaEntregaTipoOperacion.entrega_modificacion, nombre: 'Entrega - Modificación' },
        { id: AuditoriaEntregaTipoOperacion.recepcion_alta, nombre: 'Recepción - Alta' },
        { id: AuditoriaEntregaTipoOperacion.recepcion_baja, nombre: 'Recepción - Baja' },
        { id: AuditoriaEntregaTipoOperacion.recepcion_modificacion, nombre: 'Recepción - Modificación' },
        { id: AuditoriaEntregaTipoOperacion.conformidad_alta, nombre: 'Conformidad - Alta' },
        { id: AuditoriaEntregaTipoOperacion.conformidad_baja, nombre: 'Conformidad - Baja' },
        { id: AuditoriaEntregaTipoOperacion.conformidad_modificacion, nombre: 'Conformidad - Modificación' },
        { id: AuditoriaEntregaTipoOperacion.descargo_alta, nombre: 'Descargo - Alta' }
    ];
    listaOrden: IColumnaOrden[] = [
        { id: 'fechaOperacion', nombre: 'Fecha operación', },
        { id: 'usuario', nombre: 'Usuario' },
        { id: 'fechaEntrega', nombre: 'Fecha entrega propuesta' },
        { id: 'tipoOperacion', nombre: 'Tipo operación' },
    ];


    ordenInicial: 'asc' | 'desc' = 'desc';
    columnaOrdenInicial: string = 'fechaOperacion';
    
    constructor(
        protected override readonly fb: FormBuilder,
        protected override readonly route: ActivatedRoute,
        protected override readonly ordenCompraService: OrdenCompraService,
        protected override readonly seguridad: SeguridadService,
        private readonly auditoriaService: AuditoriaEntregaService,
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
