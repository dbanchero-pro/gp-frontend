import { Component, TemplateRef, ViewChild } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ActualizarService } from "src/app/shared/services/common/actualizar.service";

@Component({
    selector: "app-alert-dialog",
    templateUrl: "./alert-dialog.component.html",
    styleUrls: ["./alert-dialog.component.scss"],
})
export class AlertDialogComponent {
    modalRef!: BsModalRef;

    @ViewChild("template", { read: TemplateRef })
    modalMensaje!: TemplateRef<any>;
    titulo: string = "Alerta";
    mensajeInicial: string = "";
    textoAdicional: string = "";
    mostrarTextoAdicional: boolean = false;
    constructor(private readonly modalService: BsModalService, private readonly actualizar: ActualizarService) {
        this.actualizar.alerta$.subscribe((data: any[]) => {
            if (data.length === 1) {
                this.mensajeInicial = data[0];
                this.openModal(this.modalMensaje);
            } else if (data.length === 2) {
                this.titulo = data[0];
                this.mensajeInicial = data[1];
                this.openModal(this.modalMensaje);
            } else if (data.length === 3) {
                this.titulo = data[0];
                this.mensajeInicial = data[1];
                this.textoAdicional = data[2];
                this.mostrarTextoAdicional = true;
                this.openModal(this.modalMensaje);
            }
        });
    }

    openModal(template: TemplateRef<any>): void {
        this.modalService.onShown.subscribe(() => {
            (document.querySelector(" button[autofocus='true']") as HTMLElement).focus();
        });
        this.modalRef = this.modalService.show(template,
            {
                class: "modal-dialog-centered"
            });
    }
}



