import { TestBed } from '@angular/core/testing';
import { DocumentoRepositorioService } from './documento-repositorio.service';

describe('DocumentoRepositorioService', () => {
    let service: DocumentoRepositorioService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(DocumentoRepositorioService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
