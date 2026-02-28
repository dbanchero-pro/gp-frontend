import { Component } from "@angular/core";

import { UtilService } from "src/app/shared/services/common/util.service";
import packageJson from '../../../../../package.json';import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: "app-footer",
    templateUrl: "./footer.component.html",
    styleUrls: ["./footer.component.scss"],
  standalone: true,
  imports: [
    SharedModule,
  ],
})
export class FooterComponent {
    version: string = packageJson.version;
    versionBackend: string = "";

    constructor(utilService: UtilService) {
        utilService.version().subscribe((dto: any) => {
            this.versionBackend = dto.valor;
        });
    }
}


