import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { ActualizarService } from "../services/common/actualizar.service";
declare let $: any;

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

    activeRequests = 0;

    constructor(private readonly actualizar: ActualizarService) {
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (this.activeRequests === 0) {
            this.actualizar.cargando(true);
        }

        this.activeRequests++;
        return next.handle(request).pipe(
            finalize(() => {
                this.activeRequests--;
                if (this.activeRequests === 0) {
                    this.actualizar.cargando(false);
                }
            })
        );
    }
}
