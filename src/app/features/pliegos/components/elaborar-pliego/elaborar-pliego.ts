import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SharedModule } from 'src/app/shared/shared.module';
import { ActualizarService } from '../../../../shared/services/common/actualizar.service';
import { CanComponentDeactivate } from '../../../../shared/utils/can-component-deactivate';
import { SiNoAmbasValor } from 'src/app/shared/enum/si-no-ambas-valor.enum';
import { EstadoPliego } from '../../enum/estado-pliego.enum';
import { ClausulaPliego } from '../../models/clausula-pliego.model';
import { PliegoDTO } from '../../models/pliego.model';
import { SeccionPliegoDTO } from '../../models/seccion-pliego.model';
import { TareaHistorialDTO } from '../../models/tarea-historial.model';
import { UsuarioAsignadoPliegoDTO } from '../../models/usuario-asignado-pliego.model';
import { ElaborarPliegoService } from '../../services/elaborar-pliego.service';

@Component({
    selector: 'app-elaborar-pliego',
    templateUrl: './elaborar-pliego.html',
    styleUrls: ['./elaborar-pliego.scss'],
    standalone: true,
    imports: [CommonModule, SharedModule],
})
export class ElaborarPliegoComponent implements OnInit, CanComponentDeactivate {
    pliego: PliegoDTO;
    EstadoProcesoPliego = EstadoPliego;

    aperturaElectronica: SiNoAmbasValor = SiNoAmbasValor.SI;
    modeloUsado: string = 'Modelo Estándar Licitación Pública Nacional';

    colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
    colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
    panelNavegacionContraido = false;
    panelEdicionContraido = false;

    seccionActiva: string | null = null;
    clausulaActiva: number | null = null;
    clausulaSeleccionada: ClausulaPliego | null = null;

    tituloEdicion: string = 'Edición';

    modeloCambio: boolean = false;
    esValidador: boolean = false;
    cambiosSinGuardar: boolean = false;

    usuariosAsignados: UsuarioAsignadoPliegoDTO[] = [];
    historialTareas: TareaHistorialDTO[] = [];
    secciones: SeccionPliegoDTO[] = [];

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly actualizarService: ActualizarService,
        private readonly elaborarPliegoService: ElaborarPliegoService,
    ) {
        this.pliego = this.elaborarPliegoService.crearPliegoDemo(0);
        this.usuariosAsignados =
            this.elaborarPliegoService.obtenerUsuariosAsignadosMock();
        this.historialTareas =
            this.elaborarPliegoService.obtenerHistorialTareasMock();
        this.secciones = this.elaborarPliegoService.obtenerSeccionesMock();
    }

    ngOnInit(): void {
        const pliegoId = this.route.snapshot.paramMap.get('id');
        if (pliegoId) {
            this.cargarPliego(Number.parseInt(pliegoId, 10));
        }

        this.route.queryParams.subscribe((params) => {
            const etiquetaCopiada = params['etiquetaCopiada'];
            const focusElement = params['focusElement'];
            const clausulaIdParam = params['clausulaId'];

            if (clausulaIdParam) {
                const clausulaId = Number.parseInt(clausulaIdParam, 10);
                this.restaurarClausulaActiva(clausulaId);
            }

            if (etiquetaCopiada) {
                setTimeout(() => {
                    this.actualizarService.mensajeCorrecto(
                        `Campo copiado: [[${etiquetaCopiada}]]`,
                    );

                    if (focusElement) {
                        const elemento = document.getElementById(focusElement);
                        if (elemento) {
                            elemento.focus();
                        }
                    }

                    this.limpiarQueryParams();
                }, 300);
            } else if (focusElement && !etiquetaCopiada) {
                setTimeout(() => {
                    const elemento = document.getElementById(focusElement);
                    if (elemento) {
                        elemento.focus();
                    }

                    this.limpiarQueryParams();
                }, 300);
            }
        });
    }

    private restaurarClausulaActiva(clausulaId: number): void {
        for (const seccion of this.secciones) {
            if (seccion.soloClausulas) {
                const clausula = seccion.clausulas.find(
                    (c) => c.id === clausulaId,
                );
                if (clausula) {
                    seccion.expandida = true;
                    this.seleccionarClausula(clausula);
                    return;
                }
            } else {
                for (const capitulo of seccion.capitulos) {
                    const clausula = capitulo.clausulas.find(
                        (c) => c.id === clausulaId,
                    );

                    if (clausula) {
                        seccion.expandida = true;
                        capitulo.expandido = true;
                        this.seleccionarClausula(clausula);
                        return;
                    }
                }
            }
        }
    }

    private limpiarQueryParams(): void {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.router.navigate(['/pliegos/bandeja-entrada/elaborar', id], {
                replaceUrl: true,
            });
        }
    }

    cargarPliego(id: number): void {
        this.pliego = this.elaborarPliegoService.crearPliegoDemo(
            id,
            'Poder Ejecutivo',
            'Ministerio de Economia',
            'Licitacion Publica',
            'Nacional',
            1234,
            2024,
        );
    }

    obtenerTextoEstado(estado: EstadoPliego): string {
        const estados: { [key: string]: string } = {
            Pendiente: 'Pendiente',
            Asignado: 'Asignado',
            'En proceso': 'En Proceso',
            'Pendiente validación': 'Pendiente Validación',
            'Pendiente aprobación': 'Pendiente Aprobación',
            Aprobado: 'Aprobado',
            Cancelado: 'Cancelado',
            Publicado: 'Publicado',
        };
        return estados[estado] || estado;
    }

    toggleSeccion(index: number): void {
        this.secciones[index].expandida = !this.secciones[index].expandida;
    }

    toggleCapitulo(seccionIndex: number, capituloIndex: number): void {
        this.secciones[seccionIndex].capitulos[capituloIndex].expandido =
            !this.secciones[seccionIndex].capitulos[capituloIndex].expandido;
    }

    togglePanelNavegacion(): void {
        this.panelNavegacionContraido = !this.panelNavegacionContraido;

        if (this.panelNavegacionContraido) {
            this.colNavegacion = 'col-lg-1 ml-0 pl-0 mr-0 pr-0';
            this.colEdicion = 'col-lg-11 ml-0 pl-0 mr-0 pr-0';
            this.panelEdicionContraido = false;
        } else {
            this.colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
            this.colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
            this.panelNavegacionContraido = false;
        }
    }

    togglePanelEdicion(): void {
        this.panelEdicionContraido = !this.panelEdicionContraido;

        if (this.panelEdicionContraido) {
            this.colEdicion = 'col-lg-1 ml-0 pl-0 mr-0 pr-0';
            this.colNavegacion = 'col-lg-11 ml-0 pl-0 mr-0 pr-0';
            this.panelNavegacionContraido = false;
        } else {
            this.colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
            this.colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
            this.panelEdicionContraido = false;
        }
    }

    seleccionarSeccion(seccion: string): void {
        this.seccionActiva = seccion;
        this.clausulaActiva = null;
        this.clausulaSeleccionada = null;

        const titulos: { [key: string]: string } = {
            encabezado: 'Encabezado y pie de página',
            caratula: 'Carátula',
            notas: 'Notas',
            anexos: 'Anexos',
            campos: 'Campos variables',
            resolucion: 'Resolución',
        };
        this.tituloEdicion = titulos[seccion] || 'Edición';
    }

    seleccionarClausula(clausula: ClausulaPliego): void {
        this.seccionActiva = null;
        this.clausulaActiva = clausula.id;
        this.clausulaSeleccionada = clausula;
        this.tituloEdicion =
            '    Cláusula: ' +
            (clausula.nombre || clausula.clausula?.denominacion || '');
    }

    canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
        if (!this.cambiosSinGuardar) {
            return true;
        }

        return confirm('Tiene cambios sin guardar. ¿Desea salir sin guardar?');
    }

    volver() {
        this.router.navigate(['/pliegos/bandeja-entrada'], {
            queryParams: { volver: '1' },
        });
    }

    obtenerTextoOrganismoPliego(): string {
        return `${this.pliego.unidadEjecutora?.inciso?.descInciso ?? ''} | ${this.pliego.unidadEjecutora?.descUnidadEjecutora ?? ''}`;
    }

    obtenerTextoTipoCompraPliego(): string {
        return `${this.pliego.subtipoCompra?.descTipoCompra ?? ''} | ${this.pliego.subtipoCompra?.descSubtipoCompra ?? ''} N� ${this.pliego.numeroCompra}/${this.pliego.anioCompra}`;
    }
}
