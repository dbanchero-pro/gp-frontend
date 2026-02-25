import { Component } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { IMenuItem } from "src/app/shared/models/common/menu-item.model";
import { ActualizarService } from "src/app/shared/services/common/actualizar.service";
import { MenuService } from "../../../shared/services/common/menu.service";
@Component({
    selector: "app-breadcrumbs",
    templateUrl: "./breadcrumbs.component.html",
    styleUrls: ["./breadcrumbs.component.scss"],
    standalone: false
})
export class BreadcrumbsComponent {
    item: IMenuItem | undefined;
    superItem: IMenuItem | undefined;
    superItem2: IMenuItem | undefined;
    superItem3: IMenuItem | undefined;
    constructor(private readonly menu: MenuService, 
        private readonly router: Router,
        private readonly actualizar: ActualizarService) {
       
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.actualizarMigaPan();
            }
        });
        
    }

    private actualizarMigaPan() {
        this.item = this.menu.obtenerItemMasAbajo(this.router.url);
        this.superItem = this.obtenerPadre(this.item);
        this.superItem2 = this.obtenerPadre(this.superItem);
        this.superItem3 = this.obtenerPadre(this.superItem2);
    }

    obtenerPadre(item?: IMenuItem | undefined): IMenuItem | undefined {
        let padre: IMenuItem | undefined = undefined;
        if (this.item?.padre?.nombre) {
            padre = item?.padre;
        }

        return padre;
    }
    ir(url: string | undefined) {
        this.router.navigate([url], { queryParams: { volver: 1 } });
    }

}