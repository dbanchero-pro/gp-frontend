// src/app/services/auth-raw.service.ts

import { Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular'; //NOSONAR
import { KeycloakLoginOptions, KeycloakProfile } from 'keycloak-js';

@Injectable({ providedIn: 'root' })
export class AuthRawService {

    constructor(private readonly keycloakService: KeycloakService) { //NOSONAR

    }

    clearToken(): any {
        return this.keycloakService.clearToken();
    }

    login(options?: KeycloakLoginOptions): Promise<void> {
        return this.keycloakService.login(options);
    }

    logout(redirectUrl?: string): Promise<void> {
        return this.keycloakService.logout(redirectUrl); //NOSONAR
    }

    getToken(): Promise<string> {
        return this.keycloakService.getToken();
    }

    isLoggedIn(): boolean {
        return !!this.keycloakService.isLoggedIn();
    }

    updateToken(minValidity = 30): Promise<boolean> {
        return this.keycloakService.updateToken(minValidity);
    }

    loadUserProfile(): Promise<KeycloakProfile> {
        return this.keycloakService.loadUserProfile();
    }
}
