import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from "@angular/router";

import { Observable } from "rxjs";
import { ActualizarService } from "../services/common/actualizar.service";
import { CanComponentDeactivate } from "../utils/can-component-deactivate";

@Injectable({
    providedIn: "root",
})


export class DeactivateGuard implements CanDeactivate<CanComponentDeactivate> {

    constructor(private readonly actualizar: ActualizarService) { }
    
    canDeactivate(
      component: CanComponentDeactivate,
      currentRoute: ActivatedRouteSnapshot,
      currentState: RouterStateSnapshot,
      nextState?: RouterStateSnapshot
    ): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        const result = !component.canDeactivate();
        return new Promise<boolean>((resolve) => {
            if (typeof result === 'boolean' && result) {
                this.actualizar.confirmar('¿Desea salir sin guardar los cambios?', () => {
                    resolve(true);
                }, () => {
                    resolve(false);
                });
            } else 
            {
                resolve(true);
            }
        });
    }
  }