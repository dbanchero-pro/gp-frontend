import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IPuntoRecepcionDTO } from 'src/app/features/administracion/puntos-recepcion/models/punto-recepcion.model';
import { IDescargoDTO } from 'src/app/features/entregas/models/descargo.model';
import { IItemOrdenCompraDTO } from 'src/app/features/entregas/models/item-orden-compra.model';
import { ItemOrdenCompraService } from 'src/app/features/entregas/services/item-orden-compra.service';
import { TipoUsuario } from 'src/app/shared/enum/tipo-usuario.enum';
import { ArchivoDTO } from 'src/app/shared/models/common/archivo.model';
import { ArchivoService } from 'src/app/shared/services/common/archivo.service';
import { FechaStringNulo } from 'src/app/shared/types/fecha-string-nulo.type';
import { uuidv4 } from 'src/app/shared/utils/functions';
import { Logger } from 'src/app/shared/utils/logger';
import { IAjusteDTO } from '../../models/ajuste.model';
import { AjusteService } from '../../services/ajuste.service';


@Component({
    selector: 'app-ajuste-detalle',
    templateUrl: './ajuste-detalle.component.html',
    standalone: false
})

export class AjusteDetalleComponent {
    @Input() ajuste!: IAjusteDTO;

    decimalPipe = new DecimalPipe('es');

    guid: String = uuidv4();

    constructor(
        private readonly archivoService: ArchivoService,
        private readonly itemOrdenCompraService: ItemOrdenCompraService,
        private readonly ajusteService: AjusteService
    ) { }


    descargarDescargo(descargo: IDescargoDTO): void {
        const archivo = descargo?.archivo;
        if (!archivo) {
            return;
        }

        if (archivo.contenido) {
            this.archivoService.descargar(archivo);
            return;
        }

        if (archivo.id) {
            this.ajusteService.descargarDescargo(descargo.idAjuste!, descargo.archivo?.id!).subscribe({
                next: (archivoObtenido) => {
                    if (archivoObtenido) {
                        const archivoDescarga = {
                            ...archivoObtenido,
                            nombre: archivo.nombre ?? archivoObtenido.nombre
                        };
                        this.archivoService.descargar(archivoDescarga);
                    }
                },
                error: (error) => {
                    Logger.logError('Error al descargar documento de descargo', error);
                }
            });
        }
    }


    tieneDescargos(ajuste: IAjusteDTO | undefined): boolean {
        return !!ajuste?.descargos && ajuste.descargos.length > 0;
    }


    descargarDocumento(documento: ArchivoDTO): void {
        if (!documento) {
            return;
        }

        const idAjuste = this.ajuste?.idAjuste;
        const idArchivo = documento.id;
        if (idAjuste == null || idArchivo == null) {
            Logger.logError('Error al descargar documento de ajuste: identificador de ajuste o archivo inválido');
            return;
        }

        this.ajusteService.descargarDocumento(idAjuste, idArchivo).subscribe({
            next: (archivoDescargado) => {
                this.archivoService.descargar(archivoDescargado);
            },
            error: (error) => Logger.logError('Error al descargar documento de ajuste', error),
        });
    }

    protected origenSolicitud(tipoSolicitante: TipoUsuario | undefined): string {
        switch (tipoSolicitante?.valueOf()) {
            case 'PROVEEDOR':
                return 'Proveedor';
            case 'ORGANISMO':
                return 'Organismo';
            default:
                return 'Organismo';
        }
    }

    debeMostrarValores(ajuste: IAjusteDTO | undefined): boolean {
        if (!ajuste?.tipoAjuste) {
            return false;
        }

        return this.esAjusteFecha(ajuste) || this.esAjusteCantidad(ajuste) || this.esAjustePunto(ajuste);
    }

    valorNuevoDescripcion(ajuste: IAjusteDTO): string {
        if (!ajuste) {
            return '-';
        }

        if (this.esAjusteFecha(ajuste)) {
            return this.formatearFecha(ajuste.fechaNueva);
        }

        if (this.esAjusteCantidad(ajuste)) {
            return this.formatearCantidad(ajuste.cantidadNueva, ajuste.itemOrdenCompra);
        }

        if (this.esAjustePunto(ajuste)) {
            return this.formatearPuntoRecepcion(ajuste.puntoRecepcionNuevo);
        }

        return '-';
    }

    valorAnteriorDescripcion(ajuste: IAjusteDTO): string {
        if (!ajuste) {
            return '-';
        }

        if (this.esAjusteFecha(ajuste)) {
            return this.formatearFecha(this.obtenerFechaAnterior(ajuste));
        }

        if (this.esAjusteCantidad(ajuste)) {
            return this.formatearCantidad(this.obtenerCantidadAnterior(ajuste), ajuste.itemOrdenCompra);
        }

        if (this.esAjustePunto(ajuste)) {
            return this.formatearPuntoRecepcion(this.obtenerPuntoRecepcionAnterior(ajuste));
        }

        return '-';
    }

    private esAjusteFecha(ajuste: IAjusteDTO | undefined): boolean {
        return this.tipoAjusteIncluye(ajuste, 'fecha');
    }

    private esAjusteCantidad(ajuste: IAjusteDTO | undefined): boolean {
        return this.tipoAjusteIncluye(ajuste, 'cantidad');
    }

    private esAjustePunto(ajuste: IAjusteDTO | undefined): boolean {
        return this.tipoAjusteIncluye(ajuste, 'pr');
    }

    private tipoAjusteIncluye(ajuste: IAjusteDTO | undefined, texto: string): boolean {
        return !!ajuste?.tipoAjuste && ajuste.tipoAjuste.toLowerCase().includes(texto.toLowerCase());
    }

    private obtenerFechaAnterior(ajuste: IAjusteDTO): FechaStringNulo {
        return ajuste.fechaOriginal ?? null;
    }

    private obtenerCantidadAnterior(ajuste: IAjusteDTO): number | null {
        return ajuste.cantidadOriginal ?? null;
    }

    private obtenerPuntoRecepcionAnterior(ajuste: IAjusteDTO): IPuntoRecepcionDTO | null {
        return ajuste.puntoRecepcionOriginal ?? null;
    }

    private formatearFecha(fecha?: FechaStringNulo): string {
        if (!fecha) {
            return '-';
        }

        const construir = (anio: string, mes: string, dia: string): string =>
            `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${anio}`;

        if (fecha instanceof Date) {
            try {
                const iso = fecha.toISOString().split('T')[0] ?? '';
                const [anioIso, mesIso, diaIso] = iso.split('-');
                if (anioIso && mesIso && diaIso) {
                    return construir(anioIso, mesIso, diaIso);
                }
            } catch (error) {
                Logger.logError('No fue posible formatear la fecha del ajuste', error);
            }

            const diaLocal = String(fecha.getDate());
            const mesLocal = String(fecha.getMonth() + 1);
            return construir(String(fecha.getFullYear()), mesLocal, diaLocal);
        }

        const fechaNormalizada = fecha.split('T')[0] ?? '';
        const [anio, mes, dia] = fechaNormalizada.split('-');
        if (!anio || !mes || !dia) {
            return '-';
        }

        return construir(anio, mes, dia);
    }

    private formatearCantidad(valor?: number | null, item?: IItemOrdenCompraDTO | null): string {
        if (valor === null || valor === undefined) {
            return '-';
        }

        const cantidadFormateada = this.decimalPipe.transform(valor, '1.0-2') ?? `${valor}`;
        const unidad = item ? this.itemOrdenCompraService.obtenerUnidades(item) : '';

        if (!unidad) {
            return cantidadFormateada;
        }

        return `${cantidadFormateada} ${unidad}`;
    }

    private formatearPuntoRecepcion(punto?: IPuntoRecepcionDTO | null): string {
        if (!punto) {
            return '-';
        }

        return punto.nombre ?? '-';
    }

}
