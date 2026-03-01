import { Component, OnInit } from '@angular/core';
import { AppConfig } from 'src/app/app.config';
import { ActualizarService } from '../../../shared/services/common/actualizar.service';
import { SharedModule } from 'src/app/shared/shared.module';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: [],
    standalone: true,
    imports: [SharedModule],
})
export class HomeComponent implements OnInit {
    contenido: string = '';

    constructor(private actualizarServ: ActualizarService) {
        this.contenido = AppConfig.settings.contenidoInicio;
    }
    confirmar(): void {
        this.actualizarServ.confirmar('está seguro?', () =>
            this.actualizarServ.alerta('registro borrado'),
        );
    }

    ngOnInit(): void {
        this.actualizarServ.subTitulo('');
    }
}
