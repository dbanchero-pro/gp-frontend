import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { DescargarArchivoDirective } from './descargar-archivo.directive';

describe('DescargarArchivoDirective', () => {
  let directive: DescargarArchivoDirective;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [DescargarArchivoDirective] });
    directive = TestBed.inject(DescargarArchivoDirective);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('realiza la descarga al hacer clic', fakeAsync(() => {
    directive.url = '/api/file';
    const anchor = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(anchor);
    spyOn(anchor, 'click');

    directive.onClick();
    const req = httpMock.expectOne('/api/file');
    req.flush({ contenido: new Blob(['data']), nombre: 'file.txt' });
    tick();

    expect(anchor.download).toBe('file.txt');
    expect(anchor.click).toHaveBeenCalled();
  }));

  it('usa el nombre por defecto y revoca la URL cuando la respuesta no trae nombre', fakeAsync(() => {
    directive.url = '/api/file';
    const anchor = document.createElement('a');
    spyOn(document, 'createElement').and.returnValue(anchor);
    spyOn(anchor, 'click');
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
    spyOn(URL, 'createObjectURL').and.returnValue('blob:fake');

    directive.onClick();
    const req = httpMock.expectOne('/api/file');
    req.flush({ contenido: new Blob(['data']) });
    tick();

    expect(anchor.download).toBe('file');
    expect(anchor.click).toHaveBeenCalled();
    expect(revokeSpy).toHaveBeenCalledWith('blob:fake');
  }));
});
