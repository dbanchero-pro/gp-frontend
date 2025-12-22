import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RestApiService {
    constructor(private readonly http: HttpClient) {}

    get<T>(url: string, params: HttpParams = new HttpParams()): Observable<T> {
        return this.http.get<T>(`${url}`, {
            headers: this.headers,
            params,
        });
    }

    post<T, D>(
        url: string,
        data: D,
        params: HttpParams = new HttpParams()
    ): Observable<T> {
        return this.http.post<T>(`${url}`, JSON.stringify(data), {
            params,
            headers: this.headers,
        });
    }

    put<T, D>(url: string, data: D): Observable<T> {
        return this.http.put<T>(`${url}`, JSON.stringify(data), {
            headers: this.headers,
        });
    }

    patch<T>(url: string): Observable<T> {
        return this.http.patch<T>(`${url}`, {
            headers: this.headers,
        });
    }

    delete<T>(url: string): Observable<T> {
        return this.http.delete<T>(`${url}`, {
            headers: this.headers,
        });
    }

    get headers(): HttpHeaders {
        const headersConfig: any = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        return new HttpHeaders(headersConfig);
    }
}
