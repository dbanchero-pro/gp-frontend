import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcesoPliego } from '../../models/proceso-pliego.model';
import { EstadoProcesoPliego } from '../../enum/estado-proceso-pliego.enum';
import { CanComponentDeactivate } from '../../../../shared/utils/can-component-deactivate';
import { Observable } from 'rxjs';

interface Clausula {
  id: number;
  nombre: string;
  bloqueada: boolean;
  obligatoria: boolean;
}

interface Capitulo {
  nombre: string;
  expandido: boolean;
  clausulas: Clausula[];
}

interface Seccion {
  nombre: string;
  expandida: boolean;
  capitulos: Capitulo[];
}

interface UsuarioAsignado {
  rol: string;
  nombre: string;
}

interface TareaHistorial {
  fecha: Date;
  tarea: string;
  usuario: string;
}

@Component({
  selector: 'app-elaborar-pliego',
  templateUrl: './elaborar-pliego.html',
  styleUrls: ['./elaborar-pliego.scss'],
  standalone: false
})
export class ElaborarPliegoComponent implements OnInit, CanComponentDeactivate {
  pliego: ProcesoPliego = {
    id: 0,
    estado: EstadoProcesoPliego.EN_PROCESO,
    incisoDescripcion: '',
    unidadEjecutoraDescripcion: '',
    unidadCompraDescripcion: '',
    tipoCompraDescripcion: '',
    subtipoCompraDescripcion: '',
    numeroCompra: 0,
    anioCompra: 0
  };

  aperturaElectronica: string = 'Sí';
  modeloUsado: string = 'Modelo Estándar Licitación Pública Nacional';

  colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
  colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
  panelNavegacionContraido = false;
  panelEdicionContraido = false;

  seccionActiva: string | null = null;
  clausulaActiva: number | null = null;
  clausulaSeleccionada: Clausula | null = null;

  tituloEdicion: string = 'Edición';

  modeloCambio: boolean = false;
  esValidador: boolean = false;
  cambiosSinGuardar: boolean = false;

  usuariosAsignados: UsuarioAsignado[] = [
    { rol: 'Editor Principal', nombre: 'Juan Pérez' },
    { rol: 'Editor', nombre: 'María González' },
    { rol: 'Validador', nombre: 'Carlos Rodríguez' }
  ];

  historialTareas: TareaHistorial[] = [
    { fecha: new Date('2024-01-15 10:30'), tarea: 'Inicio de elaboración', usuario: 'Juan Pérez' },
    { fecha: new Date('2024-01-16 14:20'), tarea: 'Modificación de cláusula', usuario: 'María González' }
  ];

  secciones: Seccion[] = [
    {
      nombre: 'Sección I - Información General',
      expandida: true,
      capitulos: [
        {
          nombre: 'Capítulo I - Objeto de la Compra',
          expandido: true,
          clausulas: [
            { id: 1, nombre: 'Cláusula 1 - Descripción del objeto', bloqueada: false, obligatoria: true },
            { id: 2, nombre: 'Cláusula 2 - Especificaciones técnicas', bloqueada: true, obligatoria: true },
            { id: 3, nombre: 'Cláusula 3 - Cantidad y unidades', bloqueada: false, obligatoria: true }
          ]
        },
        {
          nombre: 'Capítulo II - Condiciones Generales',
          expandido: false,
          clausulas: [
            { id: 4, nombre: 'Cláusula 4 - Plazo de entrega', bloqueada: false, obligatoria: true },
            { id: 5, nombre: 'Cláusula 5 - Lugar de entrega', bloqueada: false, obligatoria: true },
            { id: 6, nombre: 'Cláusula 6 - Garantías', bloqueada: false, obligatoria: false }
          ]
        }
      ]
    },
    {
      nombre: 'Sección II - Requisitos de Participación',
      expandida: false,
      capitulos: [
        {
          nombre: 'Capítulo I - Requisitos Legales',
          expandido: false,
          clausulas: [
            { id: 7, nombre: 'Cláusula 7 - Documentación legal', bloqueada: false, obligatoria: true },
            { id: 8, nombre: 'Cláusula 8 - Certificados requeridos', bloqueada: false, obligatoria: true }
          ]
        },
        {
          nombre: 'Capítulo II - Requisitos Técnicos',
          expandido: false,
          clausulas: [
            { id: 9, nombre: 'Cláusula 9 - Experiencia técnica', bloqueada: false, obligatoria: true },
            { id: 10, nombre: 'Cláusula 10 - Capacidad operativa', bloqueada: false, obligatoria: false }
          ]
        }
      ]
    },
    {
      nombre: 'Sección III - Evaluación y Adjudicación',
      expandida: false,
      capitulos: [
        {
          nombre: 'Capítulo I - Criterios de Evaluación',
          expandido: false,
          clausulas: [
            { id: 11, nombre: 'Cláusula 11 - Criterio precio', bloqueada: false, obligatoria: true },
            { id: 12, nombre: 'Cláusula 12 - Criterios técnicos', bloqueada: false, obligatoria: true },
            { id: 13, nombre: 'Cláusula 13 - Puntajes', bloqueada: false, obligatoria: true }
          ]
        }
      ]
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const pliegoId = this.route.snapshot.paramMap.get('id');
    if (pliegoId) {
      this.cargarPliego(parseInt(pliegoId, 10));
    }
  }

  cargarPliego(id: number): void {
    this.pliego = {
      id: id,
      estado: EstadoProcesoPliego.EN_PROCESO,
      incisoDescripcion: 'Poder Ejecutivo',
      unidadEjecutoraDescripcion: 'Ministerio de Economía',
      unidadCompraDescripcion: 'Unidad de Compras Centralizadas',
      tipoCompraDescripcion: 'Licitación Pública',
      subtipoCompraDescripcion: 'Nacional',
      numeroCompra: 1234,
      anioCompra: 2024
    };
  }

  obtenerTextoEstado(estado: EstadoProcesoPliego): string {
    const estados: { [key: string]: string } = {
      'Pendiente': 'Pendiente',
      'Asignado': 'Asignado',
      'En proceso': 'En Proceso',
      'Pendiente validación': 'Pendiente Validación',
      'Pendiente aprobación': 'Pendiente Aprobación',
      'Aprobado': 'Aprobado',
      'Cancelado': 'Cancelado',
      'Publicado': 'Publicado'
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
    } else {
      this.colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
      this.colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
    }
  }

  togglePanelEdicion(): void {
    this.panelEdicionContraido = !this.panelEdicionContraido;

    if (this.panelEdicionContraido) {
      this.colEdicion = 'col-lg-1 ml-0 pl-0 mr-0 pr-0';
      this.colNavegacion = 'col-lg-11 ml-0 pl-0 mr-0 pr-0';
    } else {
      this.colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
      this.colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
    }
  }

  seleccionarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
    this.clausulaActiva = null;
    this.clausulaSeleccionada = null;

    const titulos: { [key: string]: string } = {
      'caratula': 'Carátula',
      'notas': 'Notas',
      'anexos': 'Anexos',
      'campos': 'Campos Variables'
    };
    this.tituloEdicion = titulos[seccion] || 'Edición';
  }

  seleccionarClausula(clausula: Clausula): void {
    if (clausula.bloqueada) {
      return;
    }

    this.seccionActiva = null;
    this.clausulaActiva = clausula.id;
    this.clausulaSeleccionada = clausula;
    this.tituloEdicion = clausula.nombre;
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (!this.cambiosSinGuardar) {
      return true;
    }

    return confirm('Tiene cambios sin guardar. ¿Desea salir sin guardar?');
  }
}
