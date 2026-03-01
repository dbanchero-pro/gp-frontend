import { LoggingLevel } from '../../services/common/logger.service';

export interface IAppConfig {
    apiCargaMasivaUrl: string;
    apiUrl: string;
    keycloak: {
        url: string;
        realm: string;
        clientId: string;
    };
    extensionesPermitidas: string;
    urlBaseFrontEnd: string;
    loggingLevel: LoggingLevel;
    archivosTamanoMaxBytes: number;
    archivosCantidadMax: number;
    contenidoInicio: string;
}
