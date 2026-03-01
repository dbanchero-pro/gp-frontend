import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { PageModel } from '../../models/common/page/page.model';
import { IPaisDTO } from '../../models/common/pais.model';
import { RestService } from '../common/rest.service';

@Injectable({
    providedIn: 'root',
})
export class PaisService {
    private readonly baseUrl = '/api/gestion-contratos/v1/paises';

    constructor(private readonly gcRestService: RestService) {}

    obtenerPaises(
        page: number = 0,
        size: number = 20,
        sort: string = 'id,asc',
    ): Observable<PageModel<IPaisDTO>> {
        const params = new HttpParams()
            .set('page', page)
            .set('size', size)
            .set('sort', sort);

        return this.gcRestService.get<PageModel<IPaisDTO>>(
            `${this.baseUrl}/all`,
            params,
        );
    }

    obtenerTodos(): Observable<IPaisDTO[]> {
        const params = new HttpParams()
            .set('page', 0)
            .set('size', 1000)
            .set('sort', 'descripcion,asc');

        return this.gcRestService
            .get<PageModel<IPaisDTO>>(`${this.baseUrl}/all`, params)
            .pipe(map((res) => res.content));
    }
}
