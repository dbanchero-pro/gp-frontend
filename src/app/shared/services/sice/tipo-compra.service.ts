import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PageModel } from '../../models/common/page/page.model';
import { TipoCompraDTO } from '../../models/sice/tipo-compra.model';
import { RestService } from '../common/rest.service';

@Injectable({
    providedIn: 'root',
})
export class TipoCompraService {

    constructor(private readonly gcRestService: RestService) { }


    obtenerTiposCompraSinPaginado(): Observable<TipoCompraDTO[]> {
        return this.gcRestService.get<TipoCompraDTO[]>(
            '/api/gestion-contratos/v1/tipos-compra/all'
        );
    }

    obtenerTiposCompraPaginado(): Observable<PageModel<TipoCompraDTO>> {
        return this.gcRestService.get<PageModel<TipoCompraDTO>>(
            '/api/gestion-contratos/v1/tipos-compra'
        );
    }

}
