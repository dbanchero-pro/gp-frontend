import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    ArchivoDTO,
    IArchivoDTO,
} from 'src/app/shared/models/common/archivo.model';
import { RestService } from './rest.service';
@Injectable({
    providedIn: 'root',
})
export class ArchivoService {
    public descargar(archivo: IArchivoDTO): void {
        const contenido: string | undefined = archivo.contenido;
        if (contenido) {
            const byteCharacters: any = atob(contenido);
            const byteArray = new Uint8Array(
                [...byteCharacters].map((c) => c.charCodeAt(0)),
            );
            let blob: any = new Blob([byteArray], { type: archivo.mimeType });
            const url: any = window.URL.createObjectURL(blob);
            const anchor: HTMLAnchorElement = document.createElement('a');
            const nombre: string | undefined = archivo.nombre;
            if (nombre) {
                anchor.download = nombre;
                anchor.href = url;
                anchor.click();
            }
        }
    }

    constructor(private readonly gcRestServ: RestService) {}

    obtener(id: number): Observable<ArchivoDTO> {
        return this.gcRestServ.get<IArchivoDTO>('/api/v1/archivos/' + id);
    }
}
