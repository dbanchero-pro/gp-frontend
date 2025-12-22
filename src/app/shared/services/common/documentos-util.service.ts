import { Injectable } from '@angular/core';
import { EntregaService } from 'src/app/features/entregas/services/entrega.service';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { Logger } from '../../utils/logger';
import { ArchivoService } from './archivo.service';

@Injectable({
    providedIn: 'root'
})
export class DocumentosUtilService {

    constructor(
        private readonly archivoService: ArchivoService,
        private readonly entregaService: EntregaService
    ) { }

    descargarDocumento(documento: ArchivoDTO, idEntrega?: number): void {
        if (documento.modificado === true) {
            this.archivoService.descargar(documento);
        } else if (documento.id && documento.id > 0 && idEntrega) {
            this.entregaService.descargarDocumento(idEntrega, documento.id).subscribe({
            next: (archivo: ArchivoDTO) => {
                if (archivo) {
                    this.archivoService.descargar(archivo);
                }
            },
            error: (error) => {
                Logger.logError('Error al descargar el documento:', error);
            }
        });
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