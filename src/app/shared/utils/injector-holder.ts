// src/app/injector-holder.ts
import { Injector } from '@angular/core';

export class InjectorHolder {
    private static _injector: Injector;

    /** Guarda la instancia del Injector de Angular */
    static setInjector(injector: Injector): void {
        InjectorHolder._injector = injector;
    }

    /** Recupera cualquier servicio inyectable por su token (clase o InjectionToken) */
    static get<T>(token: any): T {
        return InjectorHolder._injector?.get<T>(token);
    }
}