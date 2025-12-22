import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { ActualizarService } from '../services/common/actualizar.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private readonly actualizar: ActualizarService) { }

    intercept(
        request: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap({
                error: (error: any) => {
                    const errorMessage: string | string[] =
                        ErrorInterceptor.procesarErrorMessage(error);
                    if (this.actualizar.capturarErrores === undefined || this.actualizar.capturarErrores) {
                        this.actualizar.mensajeError(errorMessage);
                    }
                }
            })
        );
    }

    public static procesarErrorMessage(error: any): string | string[] {
        let errorMessage: string | string[] = 'Error desconocido';
        if (error.status === 400) {
            errorMessage = 'Error en el envío de los datos';
        } else if (error.status === 401) {
            errorMessage = 'El usuario no inició sesión';
        } else if (error.status === 403) {
            errorMessage = 'El usuario no está autorizado';
        } else if (error.status === 409) {
            errorMessage = error.error.mensajes[0].descripcion;
        } else if (error.status === 412) {
            errorMessage = error.error.mensajes.map((e: any): string => {
                return e.descripcion;
            });
        } else if (error.status >= 500) {
            errorMessage = 'Error interno del servidor';
        } else if (error.status >= 400 || error.status === 0) {
            errorMessage = 'Error de comunicación con el servidor';
        }
        return errorMessage;
    }

    private static forzarRecargarPagina() { 
        setTimeout(() => {
           
                if (window.location.href.includes("?")) {
                    window.location.href += '&';
                } else {
                    window.location.href += '?';
                }
                if (window.location.href.includes('ts=')) {
                    window.location.href = window.location.href.replace(/ts=\d+/, 'ts=' + new Date().getTime());
                } else {
                    window.location.href += 'ts=' + new Date().getTime();
                }
                window.location.reload();
       
        }, 2000);   
    }
}
