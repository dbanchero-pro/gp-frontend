import { Injectable } from '@angular/core';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { Logger } from '../../utils/logger';
import { ArchivoService } from './archivo.service';

@Injectable({
    providedIn: 'root'
})
export class DocumentosUtilService {

    constructor(
        private readonly archivoService: ArchivoService,
    ) { }

    descargarDocumento(documento: ArchivoDTO, idPliego?: number): void {
        if (documento.modificado === true) {
            this.archivoService.descargar(documento);
        } 
    }

    eliminarDocumento(documentos: ArchivoDTO[], documento: ArchivoDTO): ArchivoDTO[] {
        if (documento) {
            if (documento.id && documento.id < 0) {
                return documentos.filter(d => d.id !== documento.id);
            } else {
                documento.modificado = true;
                documento.eliminado = true;
                return [...documentos];
            }
        }
        return documentos;
    }

    obtenerDocumentosAMostrar(documentos: ArchivoDTO[]): ArchivoDTO[] {
        return documentos.filter(d => d.eliminado !== true);
    }

    getDocumentDate(documentos: ArchivoDTO[], index: number): Date {
        const doc = documentos[index];
        if (doc?.fecha) {
            return new Date(doc.fecha);
        }
        return new Date();
    }
}