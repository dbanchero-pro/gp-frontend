import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { AuditoriaTipoABMEnum } from "src/app/shared/enum/auditoria-tipo-abm.enum";
import { RestService } from "src/app/shared/services/common/rest.service";
import { IFiltroAuditoriaPuntoRecepcionDTO } from "../models/filtro-auditoria-punto-recepcion.model";
import { AuditoriaPuntoRecepcionService } from "./auditoria-punto-recepcion.service";

describe("AuditoriaPuntoRecepcionService", () => {
    let auditoriaService: AuditoriaPuntoRecepcionService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
            ],
            providers: [
                AuditoriaPuntoRecepcionService,
                RestService
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        auditoriaService = TestBed.inject(AuditoriaPuntoRecepcionService);
    });

    it('getPageable() debería solicitar la página de auditorías', () => {

        const pageable: any = {
            pageNumber: 1,
            pageSize: 10,
            sort: "i",
            order: "asc",

        };


        let filtro: Partial<IFiltroAuditoriaPuntoRecepcionDTO> = {
            tipoOperacion: AuditoriaTipoABMEnum.alta,

            fechaDesde: new Date("2024-01-01"),
            fechaHasta: new Date("2024-01-31"),
            idInciso: 1
        };

        let sdaRestService: RestService = TestBed.inject(RestService);
        let spy: any = spyOn(sdaRestService, "get");

        auditoriaService.getPageable(pageable, undefined, filtro);

        expect(spy).toHaveBeenCalled();
    });

    it('obtenerParametros agrega todos los filtros', () => {
        const filtro: Partial<IFiltroAuditoriaPuntoRecepcionDTO> = {
            valorOriginal: 'orig',
            tipoOperacion: AuditoriaTipoABMEnum.alta,
            fechaDesde: new Date('2024-06-01'),
            fechaHasta: '2024-06-30',
            idInciso: 1,
            idUE: 2,
            idUC: 3,
            nombre: 'nom',
            usuario: 'usr'
        };

        const params = auditoriaService.obtenerParametros('10', filtro);

        expect(params.get('tipoOperacion')).toBe('ALTA');
        expect(params.get('idEntidad')).toBe('10');
        expect(params.get('valorOriginal')).toBe('orig');
        expect(params.get('fechaDesde')).toBe('2024-06-01');
        expect(params.get('fechaHasta')).toBe('2024-06-30');
        expect(params.get('idInciso')).toBe('1');
        expect(params.get('idUE')).toBe('2');
        expect(params.get('idUC')).toBe('3');
        expect(params.get('nombre')).toBe('nom');
        expect(params.get('usuario')).toBe('usr');
    });

    it('obtenerParametros maneja valores nulos', () => {
        const params = auditoriaService.obtenerParametros(undefined, {
            tipoOperacion: 'null'
        });

        expect(params.get('tipoOperacion')).toBe('');
        expect(params.get('idEntidad')).toBeNull();
        expect(params.get('valorOriginal')).toBeNull();
        expect(params.get('nombre')).toBeNull();
    });
});