import { HttpClientTestingModule } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { RestService } from "src/app/shared/services/common/rest.service";
import { AuditoriaAjusteTipoOperacion } from "../enum/auditoria-ajuste-tipo-operacion.enum";
import { IFiltroAuditoriaEntregaAjusteDTO } from "../models/filtros/filtro-auditoria-entrega-ajuste.model";
import { AuditoriaAjusteService } from "./auditoria-ajuste.service";
import { AuditoriaEntregaService } from "./auditoria-entrega.service";

describe("AuditoriaAjusteService", () => {
    let auditoriaService: AuditoriaAjusteService;

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
        auditoriaService = TestBed.inject(AuditoriaAjusteService);
    });

    it('getPageable() debería solicitar la página de auditorías', () => {

        const pageable: any = {
            pageNumber: 1,
            pageSize: 10,
            sort: "i",
            order: "asc",

        };


        let filtro: Partial<IFiltroAuditoriaEntregaAjusteDTO> = {
            tipoOperacion: AuditoriaAjusteTipoOperacion.alta,

            fechaDesde: new Date("2024-01-01"),
            fechaHasta: new Date("2024-01-31"),
            idIncisoCompra: 1
        };

        let sdaRestService: RestService = TestBed.inject(RestService);
        let spy: any = spyOn(sdaRestService, "get");

        auditoriaService.getPageable(pageable, filtro);

        expect(spy).toHaveBeenCalled();
    });

});