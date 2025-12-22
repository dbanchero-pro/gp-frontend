import { Injectable } from "@angular/core";
import { ILogger, LoggerService } from "../services/common/logger.service";
import { InjectorHolder } from "./injector-holder";

@Injectable({
    providedIn: 'root'
})
export class Logger {
    static get instance(): ILogger {
        const logger = InjectorHolder.get<LoggerService>(LoggerService);
        if (logger)
            return logger;
        else
            return {
                logError: (message: any, ...optionalParams: any[]): void => { },
                logWarning: (message: any, ...optionalParams: any[]): void => { },
                logInfo: (message: any, ...optionalParams: any[]): void => { },
                logDebug: (message: any, ...optionalParams: any[]): void => { },
                logVerbose: (message: any, ...optionalParams: any[]): void => { },
            };
    }


    static logError(message: any, ...optionalParams: any[]) {
        if (Logger.instance?.logError) {
            Logger.instance.logError(message, ...optionalParams);
        }
    }

    static logWarning(message: any, ...optionalParams: any[]) {
        if (Logger.instance?.logWarning) {
            Logger.instance.logWarning(message, ...optionalParams);
        }
    }

    static logInfo(message: any, ...optionalParams: any[]) {
        if (Logger.instance?.logInfo) {
            Logger.instance.logInfo(message, ...optionalParams);
        }
    }

    static logDebug(message: any, ...optionalParams: any[]) {
        if (Logger.instance?.logDebug) {
            Logger.instance.logDebug(message, ...optionalParams);
        }
    }

    static logVerbose(message: any, ...optionalParams: any[]) {
        if (Logger.instance?.logVerbose) {
            Logger.instance.logVerbose(message, ...optionalParams);
        }
    }
}
