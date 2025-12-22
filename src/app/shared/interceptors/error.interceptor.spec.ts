import { HttpHandler, HttpRequest } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { ErrorInterceptor } from './error.interceptor';

class ActualizarMock {
  mensajeError = jasmine.createSpy('mensajeError');
  cargando() {
    // Implementación de cargando
  }
}

describe('ErrorInterceptor', () => {
  let interceptor: ErrorInterceptor;
  let actualizar: ActualizarMock;

  beforeEach(() => {
    actualizar = new ActualizarMock();
    interceptor = new ErrorInterceptor(actualizar as any);
  });

  it('debe reenviar las respuestas exitosas', (done) => {
    const handler: HttpHandler = {
      handle: () => of('ok') as any
    };
    interceptor.intercept(new HttpRequest('GET', '/'), handler).subscribe(result => {
      expect(result as any).toBe('ok');
      done();
    });
  });

  it('debe procesar el mensaje de error y notificar al servicio', (done) => {
    const handler: HttpHandler = {
      handle: () => throwError(() => ({ status: 400 }))
    } as any;
    interceptor.intercept(new HttpRequest('GET', '/'), handler).subscribe({
      next: () => {},
      error: () => {
        expect(actualizar.mensajeError).toHaveBeenCalledWith('Error en el envío de los datos');
        done();
      }
    });
  });

  it('procesarErrorMessage cubre todas las ramas', () => {
    expect(ErrorInterceptor.procesarErrorMessage({status:401})).toBe('El usuario no inició sesión');
    expect(ErrorInterceptor.procesarErrorMessage({status:403})).toBe('El usuario no está autorizado');
    expect(ErrorInterceptor.procesarErrorMessage({status:409,error:{mensajes:[{descripcion:'x'}]}})).toBe('x');
    expect(Array.isArray(ErrorInterceptor.procesarErrorMessage({status:412,error:{mensajes:[{descripcion:'x'}]}}))).toBeTrue();
    expect(ErrorInterceptor.procesarErrorMessage({status:500})).toBe('Error interno del servidor');
    expect(ErrorInterceptor.procesarErrorMessage({status:0})).toBe('Error de comunicación con el servidor');
  });
});
