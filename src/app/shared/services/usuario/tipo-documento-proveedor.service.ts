import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PageModel } from '../../models/common/page/page.model';
import { ITipoDocumentoProveedorDTO } from '../../models/proveedor/tipo-documento-proveedor.model';
import { RestService } from '../common/rest.service';

@Injectable({
    providedIn: 'root',
})
export class TipoDocumentoProveedorService {
    private readonly baseUrl =
        '/api/gestion-contratos/v1/tipos-documento-proveedor';

    constructor(private readonly gcRestService: RestService) {}

    obtenerTiposDocumentoProveedor(
        page: number = 0,
        size: number = 20,
        sort: string = 'id,asc',
        idPais?: string,
        idTipoDocumento?: string,
    ): Observable<PageModel<ITipoDocumentoProveedorDTO>> {
        let params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('sort', sort);

        if (idTipoDocumento) {
            params = params.set('idTipoDocumento', idTipoDocumento);
        }

        return this.gcRestService.get<PageModel<ITipoDocumentoProveedorDTO>>(
            `${this.baseUrl}/all`,
            params,
        );
    }

    obtenerTodos(): Observable<ITipoDocumentoProveedorDTO[]> {
        const params = new HttpParams()
            .set('page', 0)
            .set('size', 1000)
            .set('sort', 'id,asc');

        return this.gcRestService
            .get<
                PageModel<ITipoDocumentoProveedorDTO>
            >(`${this.baseUrl}/all`, params)
            .pipe(map((res) => res.content));
    }
}
