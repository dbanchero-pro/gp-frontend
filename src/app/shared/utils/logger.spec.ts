import { LoggerService } from '../services/common/logger.service';
import { InjectorHolder } from './injector-holder';
import { Logger } from './logger';

describe('Logger', () => {
  let loggerServiceSpy: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    loggerServiceSpy = jasmine.createSpyObj<LoggerService>('LoggerService', [
      'logError',
      'logWarning',
      'logInfo',
      'logDebug',
      'logVerbose'
    ]);
  });

  afterEach(() => {
    InjectorHolder.setInjector({ get: () => undefined } as any);
  });

  it('debe delegar todas las llamadas al LoggerService disponible', () => {
    InjectorHolder.setInjector({ get: () => loggerServiceSpy } as any);

    Logger.logError('error', 'detalle');
    Logger.logWarning('warning');
    Logger.logInfo('info');
    Logger.logDebug('debug');
    Logger.logVerbose('verbose');

    expect(loggerServiceSpy.logError).toHaveBeenCalledWith('error', 'detalle');
    expect(loggerServiceSpy.logWarning).toHaveBeenCalledWith('warning');
    expect(loggerServiceSpy.logInfo).toHaveBeenCalledWith('info');
    expect(loggerServiceSpy.logDebug).toHaveBeenCalledWith('debug');
    expect(loggerServiceSpy.logVerbose).toHaveBeenCalledWith('verbose');
  });

  it('proporciona un stub sin operaciones cuando no existe LoggerService', () => {
    InjectorHolder.setInjector({ get: () => undefined } as any);

    const instance = Logger.instance;

    expect(typeof instance.logError).toBe('function');
    expect(typeof instance.logWarning).toBe('function');
    expect(typeof instance.logInfo).toBe('function');
    expect(typeof instance.logDebug).toBe('function');
    expect(typeof instance.logVerbose).toBe('function');

    expect(() => {
      Logger.logError('mensaje');
      Logger.logWarning('mensaje');
      Logger.logInfo('mensaje');
      Logger.logDebug('mensaje');
      Logger.logVerbose('mensaje');
    }).not.toThrow();
  });

  it('no falla cuando el injector devuelve null', () => {
    InjectorHolder.setInjector({ get: () => null } as any);

    expect(() => Logger.logInfo('mensaje')).not.toThrow();
  });
});
