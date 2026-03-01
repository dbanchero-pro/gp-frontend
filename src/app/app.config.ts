import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@env/gc/environment';

import { firstValueFrom } from 'rxjs';
import { IAppConfig } from './shared/models/common/app-config.model';

@Injectable()
export class AppConfig {
    private static _settings: IAppConfig;
    public static get settings(): IAppConfig {
        return this._settings;
    }
    public static set settings(value: IAppConfig) {
        this._settings = value;
    }
    constructor(private readonly http: HttpClient) {}
    load(): Promise<void> {
        let jsonFile: string = './assets/config.json';
        if (
            environment.nombre !== undefined &&
            environment.nombre !== null &&
            environment.nombre !== ''
        ) {
            jsonFile = './assets/config-' + environment.nombre + '.json';
        }
        return new Promise<void>((resolve, reject) => {
            firstValueFrom(this.http.get(jsonFile))
                .then((response: any) => {
                    AppConfig._settings = response as IAppConfig;
                    resolve();
                })
                .catch((response: any) => {
                    reject(
                        new Error(
                            'No se pudo cargar el archivo ' +
                                jsonFile +
                                ':' +
                                JSON.stringify(response),
                        ),
                    );
                });
        });
    }
}
