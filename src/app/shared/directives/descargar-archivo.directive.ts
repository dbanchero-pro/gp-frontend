import { HttpClient } from "@angular/common/http";
import { Directive, HostListener, Input } from "@angular/core";
import { firstValueFrom } from "rxjs";


@Directive({
    selector: "[descargarArchivo]"
})
export class DescargarArchivoDirective {
    constructor(private readonly httpClient: HttpClient) { }

    private downloadUrl: string = "";

    @Input("descargarArchivo")
    public set url(url: string) {
        this.downloadUrl = url;
    }

    @HostListener("click")
    public async onClick(): Promise<void> {

        const response: any = firstValueFrom(this.httpClient.get(
            this.downloadUrl
        ));

        // create a URL for the blob
        const url: string = URL.createObjectURL((await response).contenido);

        // create an anchor element to "point" to it
        const anchor: HTMLAnchorElement = document.createElement("a");
        anchor.href = url;

        // get the suggested filename for the file from the response headers
        anchor.download = (await response).nombre ?? "file";

        // simulate a click on our anchor element
        anchor.click();

        // discard the object data
        URL.revokeObjectURL(url);
    }
}