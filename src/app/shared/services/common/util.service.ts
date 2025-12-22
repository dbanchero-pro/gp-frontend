import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { IUsuarioInfoDTO } from "../../models/usuario/usuario-info.model";
import { RestService } from "./rest.service";

@Injectable({
    providedIn: "root"
})
export class UtilService {

    urlRestBase: string = "/api/util/v1";

    constructor(private readonly gcRestServ: RestService) { }

    ping(): Observable<any> {
        return this.gcRestServ.get(this.urlRestBase + "/ping");
    }

    usuarioInfo(): Observable<IUsuarioInfoDTO> {
        return this.gcRestServ.get(this.urlRestBase + "/usuario-info");
    }

    version(): Observable<any> {
        return this.gcRestServ.get(this.urlRestBase + "/version");
    }
}
