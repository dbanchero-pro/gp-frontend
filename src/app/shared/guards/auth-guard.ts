import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { KeycloakAuthGuard, KeycloakService } from "keycloak-angular"; //NOSONAR
import { AppConfig } from "src/app/app.config";

import { Logger } from 'src/app/shared/utils/logger';
import { AuthRawService } from "../services/common/auth-raw-service";
import { MenuService } from "../services/common/menu.service";
import { SeguridadService } from "../services/common/seguridad.service";

@Injectable({
    providedIn: "root",
})


export class AuthGuard extends KeycloakAuthGuard { //NOSONAR
    constructor(
        override  readonly router: Router,
        protected readonly keycloak: KeycloakService, //NOSONAR
        protected readonly authRaw: AuthRawService,
        protected readonly menu: MenuService,
        protected seguridad: SeguridadService
    ) {
        super(router, keycloak);
    }

    public async isAccessAllowed(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean | UrlTree> {
        let token: string = await this.obtenerToken();
        if (!token || token === "") {
            await this.sleep(1000);
            token = await this.obtenerToken();
            if (!token || token === "") {
                if (!this.authenticated) {
                    this.authRaw.login({
                        redirectUri: window.location.origin + AppConfig.settings.urlBaseFrontEnd + state.url,
                    });
                }
            }
        }
        await this.seguridad.cargarPermisos();
        if (this.menu.tienePermisoUrl(state.url, this.seguridad.obtenerTipoUsuario())) {
            return true;
        } else {
            return this.router.parseUrl('/403');
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async obtenerToken(): Promise<string> {
        try {
            return await this.authRaw.getToken().then((token) => {
                return token;
            });
        } catch (ex) {
            Logger.logError("Fallo al obtener el token de autenticación", ex);
            return "";
        }
    }
}
