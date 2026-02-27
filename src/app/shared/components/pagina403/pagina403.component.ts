import { Component, OnInit } from "@angular/core";
import { ActualizarService } from "../../services/common/actualizar.service";


@Component({
    selector: "app-pagina-403",
    templateUrl: "./pagina403.component.html",
    styleUrls: ["./pagina403.component.scss"],

    standalone: false
})
export class Pagina403Component implements OnInit {

    constructor(private readonly actualizarServ: ActualizarService) {

    }

    ngOnInit() {
        this.actualizarServ.subTitulo("");
    }

}


