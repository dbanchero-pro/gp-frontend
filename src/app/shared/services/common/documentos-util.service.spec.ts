import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { EntregaService } from 'src/app/features/entregas/services/entrega.service';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { ArchivoService } from './archivo.service';
import { DocumentosUtilService } from './documentos-util.service';

describe('DocumentosUtilService', () => {
  let service: DocumentosUtilService;
  let archivoService: any;
  let entregaService: any;

  beforeEach(() => {
    archivoService = { descargar: jasmine.createSpy('descargar') };
    entregaService = { descargarDocumento: jasmine.createSpy('descargarDocumento').and.returnValue(of({})) };

    TestBed.configureTestingModule({
      providers: [
        DocumentosUtilService,
        { provide: ArchivoService, useValue: archivoService },
        { provide: EntregaService, useValue: entregaService }
      ]
    });

    service = TestBed.inject(DocumentosUtilService);
  });

  it('descargarDocumento descarga archivo modificado', () => {
    const doc = { id: -1, modificado: true } as ArchivoDTO;
    service.descargarDocumento(doc);
    expect(archivoService.descargar).toHaveBeenCalledWith(doc);
  });

  it('descargarDocumento obtiene y descarga archivo existente', () => {
    const doc = { id: 3 } as ArchivoDTO;
    service.descargarDocumento(doc, 5);
    expect(entregaService.descargarDocumento).toHaveBeenCalledWith(5, 3);
    expect(archivoService.descargar).toHaveBeenCalled();
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