import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Pais } from "src/app/shared/enum/pais.enum";
import { TipoDocumentoUsuario } from "src/app/shared/enum/tipo-documento-usuario.enum";
import { TipoUsuario } from "src/app/shared/enum/tipo-usuario.enum";
import { RestService } from "src/app/shared/services/common/rest.service";
import { IFiltroAuditoriaUsuarioProveedorDTO } from "../models/filtro-auditoria-usuario-proveedor.model";
import { AuditoriaUsuarioProveedorService } from "./auditoria-usuario-proveedor.service";

describe("AuditoriaUsuarioProveedorService", () => {
    let auditoriaService: AuditoriaUsuarioProveedorService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [AuditoriaUsuarioProveedorService, RestService]
        }).compileComponents();
    });

    beforeEach(() => {
        auditoriaService = TestBed.inject(AuditoriaUsuarioProveedorService);
    });

    it('getPageable() debería llamar al servicio', () => {
        const pageable: any = { pageNumber: 0, pageSize: 10, sort: 'id', order: 'asc' };
        const filtro: Partial<IFiltroAuditoriaUsuarioProveedorDTO> = { tipoOperacion: 'ALTA' };
        const restService = TestBed.inject(RestService);
        const spy = spyOn(restService, 'get');
        auditoriaService.getPageable(pageable, undefined, filtro);
        expect(spy).toHaveBeenCalled();
    });

    it('obtenerParametros agrega todos los filtros', () => {
        const filtro: Partial<IFiltroAuditoriaUsuarioProveedorDTO> = {
            tipoOperacion: 'ALTA',
            fechaDesde: new Date('2024-06-01'),
            fechaHasta: '2024-06-30',
            tipoUsuario: TipoUsuario.PROVEEDOR,
            paisDocumentoUsuario: Pais.URUGUAY,
            tipoDocumentoUsuario: TipoDocumentoUsuario.CEDULA_IDENTIDAD,
            nroDocumentoUsuario: '1',
            paisDocumentoGestionado: 'AR',
            tipoDocumentoGestionado: 'DNI',
            nroDocumentoGestionado: '2',
            paisDocumentoProveedor: 'BR',
            tipoDocumentoProveedor: 'RUT',
            nroDocumentoProveedor: '3',
        };
        const params = auditoriaService.obtenerParametros('10', filtro);
        expect(params.get('tipoOperacion')).toBe('ALTA');
        expect(params.get('idEntidad')).toBe('10');
        expect(params.get('fechaDesde')).toBe('2024-06-01');
        expect(params.get('fechaHasta')).toBe('2024-06-30');
        expect(params.get('tipoUsuario')).toBe(TipoUsuario.PROVEEDOR);
        expect(params.get('paisDocumentoUsuario')).toBe(Pais.URUGUAY);
        expect(params.get('tipoDocumentoUsuario')).toBe(TipoDocumentoUsuario.CEDULA_IDENTIDAD);
        expect(params.get('nroDocumentoUsuario')).toBe('1');
        expect(params.get('paisDocumentoGestionado')).toBe('AR');
        expect(params.get('tipoDocumentoGestionado')).toBe('DNI');
        expect(params.get('nroDocumentoGestionado')).toBe('2');
        expect(params.get('paisDocumentoProveedor')).toBe('BR');
        expect(params.get('tipoDocumentoProveedor')).toBe('RUT');
        expect(params.get('nroDocumentoProveedor')).toBe('3');
    });

    it('obtenerParametros maneja valores nulos', () => {
        const params = auditoriaService.obtenerParametros(undefined, { tipoOperacion: 'null' });
        expect(params.get('tipoOperacion')).toBe('');
        expect(params.get('idEntidad')).toBeNull();
    });
});
