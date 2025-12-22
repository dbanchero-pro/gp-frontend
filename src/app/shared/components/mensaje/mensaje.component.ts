import { Component, Input, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { ActualizarService } from "src/app/shared/services/common/actualizar.service";
import { TipoMensajeEnum } from "../../enum/tipo-mensaje.enum";

@Component({
    selector: "app-mensaje",
    templateUrl: "./mensaje.component.html",
    styleUrls: ["./mensaje.component.scss"],
    standalone: false
})

export class MensajeComponent implements OnInit {
    @Input() showMsg: boolean = false;
    @Input() typeMsg: TipoMensajeEnum = TipoMensajeEnum.success;
    @Input() messages: string[] = [""];
    @Input() duration: number = 5000;
    constructor(private readonly actualizar: ActualizarService, private readonly router: Router) {
        this.actualizar.mensaje$.subscribe((mensajes: any) => {
            if (mensajes.length === 2) {
                this.messages = mensajes[0];
                this.typeMsg = mensajes[1];
                this.showMsg = true;
                window.scrollTo(0, 0);
            } else {
                this.showMsg = false;
            }
        });
    }
    ngOnInit(): void {
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd && this.showMsg) {
                this.showMsg = false;
            }
        });
    }

    onClose(): void {
        this.showMsg = false;
    }
}
