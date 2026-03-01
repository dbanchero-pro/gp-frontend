import { Injectable } from '@angular/core';
import {
    ActivatedRouteSnapshot,
    CanDeactivate,
    RouterStateSnapshot,
    UrlTree,
} from '@angular/router';

import { Observable } from 'rxjs';
import { ActualizarService } from '../services/common/actualizar.service';
import { CanComponentDeactivate } from '../utils/can-component-deactivate';

@Injectable({
    providedIn: 'root',
})
export class DeactivateGuard implements CanDeactivate<CanComponentDeactivate> {
    constructor(private readonly actualizar: ActualizarService) {}

    canDeactivate(
        component: CanComponentDeactivate,
        currentRoute: ActivatedRouteSnapshot,
        currentState: RouterStateSnapshot,
        nextState?: RouterStateSnapshot,
    ):
        | boolean
        | UrlTree
        | Observable<boolean | UrlTree>
        | Promise<boolean | UrlTree> {
        if (!component || typeof component.canDeactivate !== 'function') {
            return true;
        }

        const result = component.canDeactivate();
        if (typeof result !== 'boolean') {
            return result;
        }

        if (result) {
            return true;
        }

        return new Promise<boolean>((resolve) => {
            this.actualizar.confirmar(
                '¿Desea salir sin guardar los cambios?',
                () => {
                    resolve(true);
                },
                () => {
                    resolve(false);
                },
            );
        });
    }
}
