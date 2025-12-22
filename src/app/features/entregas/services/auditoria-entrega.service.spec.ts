import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AuditoriaTipoABMEnum } from "src/app/shared/enum/auditoria-tipo-abm.enum";
import { TipoUsuario } from "src/app/shared/enum/tipo-usuario.enum";
import { RestService } from "src/app/shared/services/common/rest.service";
import { IFiltroAuditoriaEntregaAjusteDTO } from "../models/filtros/filtro-auditoria-entrega-ajuste.model";
import { AuditoriaEntregaService } from "./auditoria-entrega.service";

describe("AuditoriaEntregaService", () => {
    let auditoriaService: AuditoriaEntregaService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                AuditoriaEntregaService,
                RestService
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        auditoriaService = TestBed.inject(AuditoriaEntregaService);
    });

    it('getPageable() debería solicitar la página de auditorías', () => {

        const pageable: any = {
            pageNumber: 1,
            pageSize: 10,
            sort: "i",
            order: "asc",

        };


        let filtro: Partial<IFiltroAuditoriaEntregaAjusteDTO> = {
            tipoOperacion: AuditoriaTipoABMEnum.alta,

            fechaDesde: new Date("2024-01-01"),
            fechaHasta: new Date("2024-01-31")
        };

        let sdaRestService: RestService = TestBed.inject(RestService);
        let spy: any = spyOn(sdaRestService, "get");

        auditoriaService.getPageable(pageable, filtro);

        expect(spy).toHaveBeenCalled();
    });


    it('obtenerParametros agrega todos los filtros', () => {
        const filtro: Partial<IFiltroAuditoriaEntregaAjusteDTO> = {
            tipoOperacion: AuditoriaTipoABMEnum.alta,
            fechaDesde: new Date('2024-06-01'),
            fechaHasta: '2024-06-30',
            idIncisoCompra: 1,
            idUECompra: 2,
            idUCCompra: 3,
            nroOC: 23,
            nroItem: 123
        };

        const params = auditoriaService.obtenerParametros( filtro);

        expect(params.get('tipoOperacion')).toBe('ALTA');
        expect(params.get('fechaDesde')).toBe('2024-06-01');
        expect(params.get('fechaHasta')).toBe('2024-06-30');
        expect(params.get('idIncisoCompra')).toBe('1');
        expect(params.get('idUECompra')).toBe('2');
        expect(params.get('idUCCompra')).toBe('3');
    });

    it('obtenerParametros maneja valores nulos', () => {
        const params = auditoriaService.obtenerParametros( {
            tipoOperacion: 'null'
        });

        expect(params.get('tipoOperacion')).toBe('');
        expect(params.get('idEntidad')).toBeNull();
        expect(params.get('valorOriginal')).toBeNull();
        expect(params.get('nombre')).toBeNull();
    });

    it('obtenerParametros incluye filtros de compra y artículo', () => {
        const filtro: Partial<IFiltroAuditoriaEntregaAjusteDTO> = {
            tipoUsuario: TipoUsuario.PROVEEDOR,
            fechaDesde: '2024-01-01',
            fechaHasta: '2024-01-31',
            descArticulo: '10',
            idEntidad: 20,
            idIncisoCompra: 1,
            idUECompra: 2,
            idUCCompra: 3,
            anioCompra: 2024,
            numCompra: 5
        };

        const params = auditoriaService.obtenerParametros(filtro);

        expect(params.get('tipoUsuario')).toBe('Proveedor');
        expect(params.get('fechaDesde')).toBe('2024-01-01');
        expect(params.get('fechaHasta')).toBe('2024-01-31');
        expect(params.get('descArticulo')).toBe('10');
        expect(params.get('idEntidad')).toBe('20');
        expect(params.get('idIncisoCompra')).toBe('1');
        expect(params.get('idUECompra')).toBe('2');
        expect(params.get('idUCCompra')).toBe('3');
        expect(params.get('anioCompra')).toBe('2024');
        expect(params.get('numCompra')).toBe('5');
    });
});