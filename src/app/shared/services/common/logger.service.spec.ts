import { LoggerService, LoggingLevel } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerService;

  beforeEach(() => {
    service = new LoggerService();
  });

  it('determinarLoggingLevel convierte correctamente las cadenas', () => {
    expect(service.determinarLoggingLevel('none')).toBe(LoggingLevel.None);
    expect(service.determinarLoggingLevel('error')).toBe(LoggingLevel.Error);
    expect(service.determinarLoggingLevel('warning')).toBe(LoggingLevel.Warning);
    expect(service.determinarLoggingLevel('info')).toBe(LoggingLevel.Info);
    expect(service.determinarLoggingLevel('debug')).toBe(LoggingLevel.Debug);
    expect(service.determinarLoggingLevel('verbose')).toBe(LoggingLevel.Verbose);
    expect(service.determinarLoggingLevel(undefined as any)).toBe(LoggingLevel.None);
  });

  it('debería respetar el nivel de log al decidir registrar', () => {
    service.init(LoggingLevel.Error);
    // @ts-ignore: accessing private method
    expect(service.debeLoguear(LoggingLevel.Error)).toBeTrue();
    // @ts-ignore
    expect(service.debeLoguear(LoggingLevel.Warning)).toBeFalse();

    service.init(LoggingLevel.Warning);
    // @ts-ignore
    expect(service.debeLoguear(LoggingLevel.Warning)).toBeTrue();
    // @ts-ignore
    expect(service.debeLoguear(LoggingLevel.Info)).toBeFalse();

    service.init(LoggingLevel.Info);
    // @ts-ignore
    expect(service.debeLoguear(LoggingLevel.Info)).toBeTrue();
    // @ts-ignore
    expect(service.debeLoguear(LoggingLevel.Verbose)).toBeFalse();

    service.init(LoggingLevel.Verbose);
    // @ts-ignore
    expect(service.debeLoguear(LoggingLevel.Debug)).toBeTrue();
  });

  it('debería llamar a los métodos de consola según el nivel de log', () => {
    spyOn(console, 'error');
    spyOn(console, 'warn');
    spyOn(console, 'info');
    spyOn(console, 'debug');

    service.init(LoggingLevel.Debug);

    service.logError('e');
    expect(console.error).toHaveBeenCalled();

    service.logWarning('w');
    expect(console.warn).toHaveBeenCalled();

    service.logInfo('i');
    expect(console.info).toHaveBeenCalled();

    service.logDebug('d');
    expect(console.debug).toHaveBeenCalled();
    expect(service.determinarLoggingLevel('whatever')).toBe(LoggingLevel.Verbose);
  });

  it('debeLoguear evalúa según el nivel', () => {
    service.init('warning');
    const instance: any = service as any;
    expect(instance.debeLoguear(LoggingLevel.Error)).toBeTrue();
    expect(instance.debeLoguear(LoggingLevel.Info)).toBeFalse();
  });

  it('log usa los métodos de consola según el nivel', () => {
    service.init(LoggingLevel.Debug);
    spyOn(console, 'warn');
    spyOn(console, 'error');
    service.log('e', LoggingLevel.Error);
    service.log('w', LoggingLevel.Warning);
    expect(console.error).toHaveBeenCalledWith('e', [] as any[]);
    expect(console.warn).toHaveBeenCalledWith('w', [] as any[]);
  });

  it('debería registrar cuando el nivel lo permite', () => {
    spyOn(console, 'info');
    service.init('Info');
    service.logInfo('hola');
    expect(console.info).toHaveBeenCalled();
  });

  it('no debería registrar si el nivel es muy bajo', () => {
    spyOn(console, 'info');
    service.init('Error');
    service.logInfo('hola');
    expect(console.info).not.toHaveBeenCalled();
  });
});
