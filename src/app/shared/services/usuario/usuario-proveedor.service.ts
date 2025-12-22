import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ArchivoDTO, IArchivoDTO } from '../../models/common/archivo.model';
import { PageModel } from '../../models/common/page/page.model';
import { UsuarioProveedorDTO } from '../../models/usuario/usuario-proveedor.model';
import { ArchivoService } from '../common/archivo.service';
import { RestService } from '../common/rest.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioProveedorService {
  private readonly baseUrlProveedor = '/api/gestion-contratos/v1/usuarios-proveedor';
  constructor(private readonly gcRestService: RestService,
    private readonly archivoService: ArchivoService
  ) { }

  private crearParams(
    filtro: { idPais?: string; idTipoDocumento?: string; nroDocumento?: string },
    page: number,
    size: number,
    sort: string
  ): HttpParams {
    let params = new HttpParams()
      .set('page', page)
      .set('size', size)
      .set('sort', sort);

    if (filtro?.idPais) params = params.set('idPais', filtro.idPais);
    if (filtro?.idTipoDocumento) params = params.set('idTipoDocumento', filtro.idTipoDocumento);
    if (filtro?.nroDocumento) params = params.set('nroDocumento', filtro.nroDocumento);

    return params;
  }

  private exportarExcel(filtro: { idPais?: string; idTipoDocumento?: string; nroDocumento?: string },
    endpoint: string): void {
    const params: any = { ...filtro };
    if (!params.idPais) delete params.idPais;
    if (!params.idTipoDocumento) delete params.idTipoDocumento;
    if (!params.nroDocumento) delete params.nroDocumento;

    this.gcRestService.post<IArchivoDTO, any>(`${this.baseUrlProveedor}/${endpoint}`, params)
      .subscribe((res: ArchivoDTO) => this.archivoService.descargar(res));
  }

  obtenerTodosUsuariosProveedores(
    filtro: {
      idPais?: string,
      idTipoDocumento?: string,
      nroDocumento?: string
    },
    page: number = 0,
    size: number = 20,
    sort: string = 'id.idUsuario,asc',

  ): Observable<PageModel<UsuarioProveedorDTO>> {
    const params = this.crearParams(filtro, page, size, sort);
    return this.gcRestService.get<PageModel<UsuarioProveedorDTO>>(`${this.baseUrlProveedor}/all`, params);
  }

   obtenerTodosUsuariosProveedoresUsuarioOrganismos(
    filtro: {
      idPais?: string,
      idTipoDocumento?: string,
      nroDocumento?: string
    },

    page: number = 0,
    size: number = 20,
    sort: string = 'id.idUsuario,asc',

  ): Observable<PageModel<UsuarioProveedorDTO>> {
    const params = this.crearParams(filtro, page, size, sort);
    return this.gcRestService.get<PageModel<UsuarioProveedorDTO>>(`${this.baseUrlProveedor}/all-organismo`, params);
  }


  guardarUsuarioProveedor(dto: UsuarioProveedorDTO): Observable<UsuarioProveedorDTO> {
    return this.gcRestService.post(this.baseUrlProveedor, dto);
  }

  eliminarUsuarioProveedor(idUsuario: string, paisDocumentoProveedor: string, tipoDocumentoProveedor: string, nroDocumentoProveedor: string): Observable<boolean> {
    const url = `${this.baseUrlProveedor}/${idUsuario}/${paisDocumentoProveedor}/${tipoDocumentoProveedor}/${nroDocumentoProveedor}`;
    return this.gcRestService.delete<boolean>(url);
  }

  exportarExcelUsuariosProveedor(filtro: { idPais?: string, idTipoDocumento?: string, nroDocumento?: string }
   ): void {
    this.exportarExcel(filtro, 'excel');
  }
 exportarExcelUsuariosProveedorUsuarioOrganismo(filtro: { idPais?: string, idTipoDocumento?: string, nroDocumento?: string }
   ): void {
    this.exportarExcel(filtro, 'excel-organismo');
  }
  actualizarUsuarioProveedor(
    idUsuario: string,
    paisDocumentoProveedor: string,
    tipoDocumentoProveedor: string,
    nroDocumentoProveedor: string,
    dto: UsuarioProveedorDTO
  ): Observable<UsuarioProveedorDTO> {
    const url = `${this.baseUrlProveedor}/${idUsuario}/${paisDocumentoProveedor}/${tipoDocumentoProveedor}/${nroDocumentoProveedor}`;
    return this.gcRestService.put<UsuarioProveedorDTO, UsuarioProveedorDTO>(url, dto);
  }

}

