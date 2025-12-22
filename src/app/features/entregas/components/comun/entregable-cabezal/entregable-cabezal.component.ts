import { Component, Input } from '@angular/core';
import { FechaStringNulo } from 'src/app/shared/types/fecha-string-nulo.type';
import { NumeroStringNulo } from 'src/app/shared/types/numero-string-nulo.type';
import { TipoUnidad } from '../../../enum/tipo-unidad.enum';
import { IEntregableDTO } from '../../../models/entregable.model';
import { EntregableService } from '../../../services/entregable.service';

@Component({
    selector: 'app-entregable-cabezal',
    templateUrl: './entregable-cabezal.component.html',
    standalone: false
})
export class EntregableCabezalComponent {
    @Input() entregable: IEntregableDTO | null = null;
    @Input() fechaLabel: string = 'Fecha última entrega:';
    @Input() fecha?: FechaStringNulo;
    @Input() cantidadLabel: string = 'Cantidad:';
    @Input() cantidadTexto?: NumeroStringNulo;
    @Input() cantidadSufijo?: string | null;
    @Input() pendienteLabel: string = 'Cantidad pendiente de asignar a entrega:';
    @Input() pendienteTexto?: NumeroStringNulo;
    @Input() containerClass: string = '';
    
    constructor(private readonly entregableService: EntregableService) {
        
    }

    private obtenerPendientePorDefecto(): string {
        if (!this.entregable) {
            return '';
        }

        const textoBase = this.entregableService.obtenerCantidadEntregable(this.entregable)?.trim();
        if (!textoBase) {
            return '';
        }

        return this.formatearTextoPendiente(textoBase);
    }

    private formatearTextoPendiente(texto: string): string {
        const partes = texto.split(' de ');
        const pendiente = partes[0]?.trim();
        const total = partes[1]?.trim();

        if (!pendiente) {
            return '';
        }

        const pendienteFormateado = this.formatearSiEsNumero(pendiente);
        const totalFormateado = total ? this.formatearSiEsNumero(total) : '';

        const unidad = this.obtenerUnidadParaMostrar();

        return this.construirTextoPendiente(pendienteFormateado, totalFormateado, unidad);
    }

    private obtenerUnidadParaMostrar(): string {
        if (!this.entregable) {
            return '';
        }

        return 'entregas';
    }

    private construirTextoPendiente(pendiente: string, total: string, unidad: string): string {
        const partes = [pendiente];

        if (total) {
            partes.push('de', total);
        }

        if (unidad) {
            partes.push(unidad);
        }

        return partes.join(' ');
    }

    private formatearSiEsNumero(texto: string): string {
        if (!texto) {
            return '';
        }

        const numeroLimpio = texto.replace(/\./g, '').replace(',', '.');
        const numero = Number(numeroLimpio);

        if (isNaN(numero)) {
            return texto;
        }

        return this.formatearNumero(numero);
    }


    private obtenerTexto(valor?: NumeroStringNulo): string {
        if (valor === undefined || valor === null) {
            return '';
        }
        const texto = String(valor).trim();
        return texto;
    }

    private formatearNumero(valor: number): string {
        return valor.toLocaleString('de-DE', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        });
    }

    get fechaMostrada(): FechaStringNulo {
        if (this.fecha !== undefined) {
            return this.fecha ?? null;
        }
        return this.entregable?.fechaComprometida ?? null;
    }

    get cantidadMostrada(): string {
        const customTexto = this.obtenerTexto(this.cantidadTexto);
        if (customTexto) {
            return customTexto;
        }
        if (!this.entregable) {
            return '';
        }
        return this.formatearNumero(this.entregable.cantidad ?? 0);
    }

    get pendienteMostrada(): string {
        const customTexto = this.obtenerTexto(this.pendienteTexto);
        if (customTexto) {
            return customTexto;
        }
        return this.obtenerPendientePorDefecto();
    }

    get mostrarPendiente(): boolean {
        if (!this.pendienteLabel) {
            return false;
        }
        const texto = this.obtenerTexto(this.pendienteTexto) ?? this.obtenerPendientePorDefecto();
        return texto.trim().length > 0;
    }

    get sufijoMostrado(): string {
        if (this.cantidadSufijo !== undefined && this.cantidadSufijo !== null) {
            return String(this.cantidadSufijo).trim();
        }
        if (!this.entregable) {
            return '';
        }
       
        const unidad = this.entregableService.obtenerUnidades(this.entregable, this.entregable.itemOrdenCompra!)?.trim();
        return unidad ?? '';
    }

    private get tipoUnidadActual(): TipoUnidad | null {
        return this.entregable?.tipoUnidad ?? this.entregable?.tipoUnidadEntregas ?? null;
    }
}





