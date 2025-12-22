import { Injectable } from "@angular/core";
import { AppConfig } from "src/app/app.config";

export class LoggingLevel {
    public static readonly None = 'None';
    public static readonly Verbose = 'Verbose';
    public static readonly Info = 'Info';
    public static readonly Warning = 'Warning';
    public static readonly Error = 'Error';
    public static readonly Debug = 'Debug';
}

export interface ILogger {
    logError(message: any, ...optionalParams: any[]): void;
    logWarning(message: any, ...optionalParams: any[]): void;
    logInfo(message: any, ...optionalParams: any[]): void;
    logDebug(message: any, ...optionalParams: any[]): void;
    logVerbose(message: any, ...optionalParams: any[]): void;
}

@Injectable({
    providedIn: 'root'
})
export class LoggerService implements ILogger {

    private _level: LoggingLevel = LoggingLevel.None;
    public _name?: any;
    constructor() {
        if (AppConfig.settings?.loggingLevel) {
            this._level = this.determinarLoggingLevel(AppConfig.settings.loggingLevel);
        }
    }

    init(loggingLevel: any) {
        this._level = this.determinarLoggingLevel(loggingLevel);
    }

    determinarLoggingLevel(loggingLevel: string | LoggingLevel) {

        if (loggingLevel === undefined || loggingLevel === null) {
            return LoggingLevel.None;
        }
        if (loggingLevel instanceof LoggingLevel) {
            return loggingLevel;
        }
        if (loggingLevel.toLowerCase() === LoggingLevel.None.toLowerCase()) {
            return LoggingLevel.None;
        } else if (loggingLevel.toLowerCase() === LoggingLevel.Error.toLowerCase()) {
            return LoggingLevel.Error;
        } else if (loggingLevel.toLowerCase() === LoggingLevel.Warning.toLowerCase()) {
            return LoggingLevel.Warning;
        } else if (loggingLevel.toLowerCase() === LoggingLevel.Info.toLowerCase()) {
            return LoggingLevel.Info;
        } else if (loggingLevel.toLowerCase() === LoggingLevel.Debug.toLowerCase()) {
            return LoggingLevel.Debug;
        } else {
            return LoggingLevel.Verbose;
        }
    }
    log(message: any, level = LoggingLevel.Warning, ...optionalParams: any[]) {
        if (this.debeLoguear(level)) {
            switch (level) {
                case LoggingLevel.Error:
                    console.error(message, optionalParams);
                    break;
                case LoggingLevel.Warning:
                    console.warn(message, optionalParams);
                    break;
                case LoggingLevel.Info:
                    console.info(message, optionalParams);
                    break;
                default:
                    console.debug(message, optionalParams);
            }
        }
    }

    private debeLoguear(level: LoggingLevel) {
        if (this._level === LoggingLevel.None) {
            return false;
        } else if (this._level === LoggingLevel.Error) {
            return level === LoggingLevel.Error || this._level === LoggingLevel.Debug;
        } else if (this._level === LoggingLevel.Warning) {
            return level === LoggingLevel.Error || level === LoggingLevel.Warning || this._level === LoggingLevel.Debug;
        } else if (this._level === LoggingLevel.Info) {
            return level === LoggingLevel.Error || level === LoggingLevel.Warning || level === LoggingLevel.Info || this._level === LoggingLevel.Debug;
        } else {
            return true;
        }
    }

    logError(message: any, ...optionalParams: any[]) {
        this.log(message, LoggingLevel.Error, optionalParams);
    }

    logWarning(message: any, ...optionalParams: any[]) {
        this.log(message, LoggingLevel.Warning, optionalParams);
    }

    logInfo(message: any, ...optionalParams: any[]) {
        this.log(message, LoggingLevel.Info, optionalParams);
    }

    logDebug(message: any, ...optionalParams: any[]) {
        this.log(message, LoggingLevel.Debug, optionalParams);
    }

    logVerbose(message: any, ...optionalParams: any[]) {
        this.log(message, LoggingLevel.Verbose, optionalParams);
    }
}
