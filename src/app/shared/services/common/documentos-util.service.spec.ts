import { TestBed } from '@angular/core/testing';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { ArchivoService } from './archivo.service';
import { DocumentosUtilService } from './documentos-util.service';

describe('DocumentosUtilService', () => {
  let service: DocumentosUtilService;
  let archivoService: any;

  beforeEach(() => {
    archivoService = { descargar: jasmine.createSpy('descargar') };

    TestBed.configureTestingModule({
      providers: [
        DocumentosUtilService,
        { provide: ArchivoService, useValue: archivoService },
      ]
    });

    service = TestBed.inject(DocumentosUtilService);
  });

  it('descargarDocumento descarga archivo modificado', () => {
    const doc = { id: -1, modificado: true } as ArchivoDTO;
    service.descargarDocumento(doc);
    expect(archivoService.descargar).toHaveBeenCalledWith(doc);
  });

  it('descargarDocumento no descarga si el archivo no estÃ¡ modificado', () => {
    const doc = { id: 3 } as ArchivoDTO;
    service.descargarDocumento(doc, 5);
    expect(archivoService.descargar).not.toHaveBeenCalled();
  });

  it('eliminarDocumento quita documentos nuevos y marca existentes', () => {
    const nuevo = { id: -1 } as ArchivoDTO;
    const existente = { id: 2 } as any;
    let docs: ArchivoDTO[] = [nuevo, existente];
    docs = service.eliminarDocumento(docs, nuevo);
    expect(docs.length).toBe(1);
    docs = service.eliminarDocumento(docs, existente);
    expect(docs[0].eliminado).toBeTrue();
    expect(docs[0].modificado).toBeTrue();
  });

  it('obtenerDocumentosAMostrar filtra eliminados', () => {
    const docs = [{ id: 1 }, { id: 2, eliminado: true }] as any;
    const res = service.obtenerDocumentosAMostrar(docs);
    expect(res.length).toBe(1);
  });

  it('getDocumentDate retorna fecha del documento o actual', () => {
    const docs = [{ fecha: '2020-02-01' }, {}] as any;
    expect(service.getDocumentDate(docs, 0).getFullYear()).toBe(2020);
    const now = new Date().getFullYear();
    expect(service.getDocumentDate(docs, 1).getFullYear()).toBe(now);
  });
});
