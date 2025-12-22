import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProveedorDTO } from 'src/app/shared/models/proveedor/proveedor.model';
import { RestService } from 'src/app/shared/services/common/rest.service';

@Injectable({
    providedIn: 'root',
})
export class ProveedorService {
    url = '/api/gestion-contratos/v1/proveedores';

    constructor(private readonly gcRestService: RestService) {}

    obtenerProveedor(idProveedor: number): Observable<ProveedorDTO> {
        return this.gcRestService.get(`${this.url}/${idProveedor}`);
    }

    actualizarPlazoEntrega(idProveedor: number, cantidadDias: number): Observable<boolean> {
        return this.gcRestService.patch(`${this.url}/${idProveedor}/plazo-entrega?cantidadDiasPlazoEntrega=${cantidadDias}`);
    }

    obtenerProveedoresRupe(): Observable<ProveedorDTO[]> {
        return this.gcRestService.get(`${this.url}/all-rupe`);
    }

}
