import { Directive, OnInit } from "@angular/core";
import { AppConfig } from "src/app/app.config";
import { formatearBytes } from "../../utils/functions";
import { PopupBaseComponent } from "../popup-base/popup-base.component";

@Directive()
export abstract class ArchivoPopupBaseComponent extends PopupBaseComponent implements OnInit {
 
    mimeType: string = '';
    base64: string = '';

    extensionesPermitidas = '';
    errorMaxSize = '';
    mostrarErrorMaxSize = false;
    today = new Date().toISOString().split('T')[0];
    constructor() { 
        super();
    }

    override ngOnInit(): void {
        super.ngOnInit();
        if (!this.extensionesPermitidas || this.extensionesPermitidas === '') {
            this.extensionesPermitidas = AppConfig.settings.extensionesPermitidas;
        }
        
    }

    
    actualizarTextoErrorSize(bytes: number) {
        const maximo = formatearBytes(AppConfig.settings.archivosTamanoMaxBytes);
        const actual = formatearBytes(bytes);
        this.errorMaxSize = `El tamaño del archivo es de ${actual} y el máximo permitido es de ${maximo}.`;
    }

    onArchivoSeleccionadoInterno(event: any, accion: (nombre: string)=>void): void {
        if (event?.target?.files && event?.target?.files.length > 0) {
            const file = event?.target?.files[0];
            this.mostrarErrorMaxSize = file.size > AppConfig.settings.archivosTamanoMaxBytes;
            this.actualizarTextoErrorSize(file.size);
            accion(file.name);
           
            this.mimeType = file.type;
            const reader = new FileReader();
            reader.onload = () => {
                this.base64 = (reader.result as string).split(',')[1];
            };

            reader.readAsDataURL(file);
        }
    }

    
    cancelar(): void {
        this.cerrarPopup();
    }

    cerrar(): void {
        this.cerrarPopup();
    }

}