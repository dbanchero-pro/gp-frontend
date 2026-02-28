import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Injector, LOCALE_ID, NgModule, inject, provideAppInitializer } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular'; //NOSONAR

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AppConfig } from './app.config';
import { LoggerService } from './shared/services/common/logger.service';
import { SeguridadService } from './shared/services/common/seguridad.service';
import { SharedModule } from './shared/shared.module';
import { InjectorHolder } from './shared/utils/injector-holder';
import { BreadcrumbsComponent } from './template/components/breadcrumbs/breadcrumbs.component';
import { FooterComponent } from './template/components/footer/footer.component';
import { HeaderComponent } from './template/components/header/header.component';
import { HomeComponent } from './template/components/home/home.component';
import { MenuComponent } from './template/components/menu/menu.component';
import { PageComponent } from './template/layout/page/page.component';

registerLocaleData(localeEs);

function initializeKeycloak(
    appConfig: AppConfig,
    keycloak: KeycloakService, //NOSONAR
    logger: LoggerService,
    seguridad: SeguridadService,
): () => Promise<any> {
    return () =>
        new Promise(async (resolve, reject) => { //NOSONAR
            await appConfig.load();
            logger.init(AppConfig.settings.loggingLevel);
            keycloak
                .init({
                    config: {
                        url: AppConfig.settings.keycloak.url,
                        realm: AppConfig.settings.keycloak.realm,
                        clientId: AppConfig.settings.keycloak.clientId,
                    },
                    initOptions: {
                        onLoad: 'login-required',
                        checkLoginIframe: false,
                        // onLoad: "check-sso",
                        // silentCheckSsoRedirectUri: window.location.origin+AppConfig.settings.urlBaseFrontEnd+ "/assets/silent-check-sso.html",
                        // checkLoginIframe: false,
                    },
                    enableBearerInterceptor: true,
                })
                .then(() => {
                    seguridad.cargarContexto().then(() => resolve(true)); //NOSONAR
                })
                .catch((error) => {
                    reject(new Error(error));
                });
        });
}

@NgModule({
    declarations: [],
    imports: [
      BrowserModule,
      BrowserAnimationsModule,
      SharedModule,
      AppRoutingModule,
      KeycloakAngularModule,
      AppComponent,
      HeaderComponent,
      FooterComponent,
      MenuComponent,
      BreadcrumbsComponent,
      PageComponent,
      HomeComponent,
    ],

    providers: [
        AppConfig,
        provideAppInitializer(() => {
            const initializerFn = (initializeKeycloak)(inject(AppConfig), inject(KeycloakService), inject(LoggerService), inject(SeguridadService)); //NOSONAR
            return initializerFn();
        }),
        { provide: LOCALE_ID, useValue: 'es' },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(injector: Injector) {
        InjectorHolder.setInjector(injector);
    }
}
