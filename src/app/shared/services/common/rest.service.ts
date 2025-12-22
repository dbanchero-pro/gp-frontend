import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from 'src/app/app.config';

import { RestApiService } from './rest-api.service';

@Injectable({
    providedIn: 'root',
})
export class RestService {
    constructor(private readonly apiService: RestApiService) { }

    get<T>(url: string, params: HttpParams = new HttpParams()): Observable<T> {
        return this.apiService.get<T>(
            `${AppConfig.settings?.apiUrl}${url}`,
            params
        );
    }

    post<T, D>(
        url: string,
        data: D,
        params: HttpParams = new HttpParams()
    ): Observable<T> {
        return this.apiService.post(
            AppConfig.settings.apiUrl + url,
            data,
            params
        );
    }

    put<T, D>(url: string, data: D): Observable<T> {
        return this.apiService.put(`${AppConfig.settings.apiUrl}${url}`, data);
    }

    patch<T>(url: string): Observable<T> {
        return this.apiService.patch<T>(`${AppConfig.settings.apiUrl}${url}`);
    }

    delete<T>(url: string): Observable<T> {
        return this.apiService.delete<T>(`${AppConfig.settings.apiUrl}${url}`);
    }
}
