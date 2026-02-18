import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProcesoPliego } from '../../models/proceso-pliego.model';
import { EstadoProcesoPliego } from '../../enum/estado-proceso-pliego.enum';
import { CanComponentDeactivate } from '../../../../shared/utils/can-component-deactivate';
import { Observable } from 'rxjs';
import { ActualizarService } from '../../../../shared/services/common/actualizar.service';

interface Clausula {
  id: number;
  nombre: string;
  bloqueada: boolean;
  obligatoria: boolean;
  protegida: boolean;
}

interface Capitulo {
  nombre: string;
  expandido: boolean;
  clausulas: Clausula[];
}

interface Seccion {
  nombre: string;
  expandida: boolean;
  soloClausulas: boolean;
  capitulos: Capitulo[];
  clausulas: Clausula[];
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
export class ElaborarPliegoComponent implements OnInit, AfterViewInit, CanComponentDeactivate {
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
    { fecha: new Date('2024-01-15 10:30'), tarea: 'Creación', usuario: 'Juan Pérez' },
    { fecha: new Date('2024-02-16 14:20'), tarea: 'Asignación', usuario: 'María González' },
    { fecha: new Date('2024-03-16 14:20'), tarea: 'Iniciación', usuario: 'María González' },
    { fecha: new Date('2024-03-16 14:20'), tarea: 'En edición', usuario: 'María González' }
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
            { id: 1, nombre: 'Descripción del objeto', bloqueada: false, obligatoria: true, protegida:false  },
            { id: 2, nombre: 'Especificaciones técnicas', bloqueada: true, obligatoria: true, protegida:false  },
            { id: 3, nombre: 'Cantidad y unidades', bloqueada: false, obligatoria: true, protegida:false  }
          ]
        },
        {
          nombre: 'Capítulo II - Condiciones Generales',
          expandido: false,
          clausulas: [
            { id: 4, nombre: 'Plazo de entrega', bloqueada: false, obligatoria: true, protegida:false  },
            { id: 5, nombre: 'Lugar de entrega', bloqueada: false, obligatoria: true, protegida:false  },
            { id: 6, nombre: 'Garantías', bloqueada: false, obligatoria: false, protegida:false  }
          ]
        }
      ],
      clausulas: [],
      soloClausulas: false,
    },
    {
      nombre: 'Sección II - Requisitos de Participación',
      expandida: false,
      capitulos: [
        {
          nombre: 'Capítulo I - Requisitos Legales',
          expandido: false,
          clausulas: [
            { id: 7, nombre: 'Documentación legal', bloqueada: false, obligatoria: true, protegida:false },
            { id: 8, nombre: 'Certificados requeridos', bloqueada: false, obligatoria: true, protegida:false }
          ]
        },
        {
          nombre: 'Capítulo II - Requisitos Técnicos',
          expandido: false,
          clausulas: [
            { id: 9, nombre: 'Experiencia técnica', bloqueada: false, obligatoria: true, protegida:false  },
            { id: 10, nombre: 'Capacidad operativa', bloqueada: false, obligatoria: false, protegida:false  }
          ]
        }
      ],
      clausulas: [],
      soloClausulas: false
    },
    {
      nombre: 'Sección III - Evaluación y Adjudicación',
      expandida: false,
      capitulos: [
        {
          nombre: 'Capítulo I - Criterios de Evaluación',
          expandido: false,
          clausulas: [
            { id: 11, nombre: 'Criterio precio', bloqueada: false, obligatoria: true, protegida:false  },
            { id: 12, nombre: 'Criterios técnicos', bloqueada: false, obligatoria: true , protegida:false },
            { id: 13, nombre: 'Puntajes', bloqueada: false, obligatoria: true, protegida:false  }
          ]
        }
      ],
      clausulas: [],
      soloClausulas: false
    },
    {
      nombre: 'Sección IV - Con cláusulas',
      expandida: false,
      capitulos: [],
      clausulas: [
          { id: 11, nombre: 'Cláusula vacía', bloqueada: false, obligatoria: true, protegida:false  },
        ],
        soloClausulas: true
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private actualizarService: ActualizarService
  ) {}

  ngOnInit(): void {
    const pliegoId = this.route.snapshot.paramMap.get('id');
    if (pliegoId) {
      this.cargarPliego(parseInt(pliegoId, 10));
    }

    this.route.queryParams.subscribe(params => {
      const etiquetaCopiada = params['etiquetaCopiada'];
      const focusElement = params['focusElement'];
      const clausulaIdParam = params['clausulaId'];

      if (clausulaIdParam) {
        const clausulaId = parseInt(clausulaIdParam, 10);
        this.restaurarClausulaActiva(clausulaId);
      }

      if (etiquetaCopiada) {
        setTimeout(() => {
          this.actualizarService.mensajeCorrecto(`Campo copiado: [[${etiquetaCopiada}]]`);

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
    for (let seccionIndex = 0; seccionIndex < this.secciones.length; seccionIndex++) {
      const seccion = this.secciones[seccionIndex];

      if (seccion.soloClausulas) {
        const clausula = seccion.clausulas.find(c => c.id === clausulaId);
        if (clausula) {
          seccion.expandida = true;
          this.seleccionarClausula(clausula);
          return;
        }
      } else {
        for (let capituloIndex = 0; capituloIndex < seccion.capitulos.length; capituloIndex++) {
          const capitulo = seccion.capitulos[capituloIndex];
          const clausula = capitulo.clausulas.find(c => c.id === clausulaId);

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

  ngAfterViewInit(): void {
    // Implementado para cumplir con la interfaz AfterViewInit
  }

  private limpiarQueryParams(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.router.navigate(['/pliegos/bandeja-entrada/elaborar', id], {
        replaceUrl: true
      });
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
      this.panelEdicionContraido=false;
    } else {
      this.colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
      this.colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
      this.panelNavegacionContraido=false;
    }
  }

  togglePanelEdicion(): void {
    this.panelEdicionContraido = !this.panelEdicionContraido;

    if (this.panelEdicionContraido) {
      this.colEdicion = 'col-lg-1 ml-0 pl-0 mr-0 pr-0';
      this.colNavegacion = 'col-lg-11 ml-0 pl-0 mr-0 pr-0';
      this.panelNavegacionContraido=false;
    } else {
      this.colNavegacion = 'col-lg-3 ml-0 pl-0 mr-0 pr-0';
      this.colEdicion = 'col-lg-9 ml-0 pl-0 mr-0 pr-0';
      this.panelEdicionContraido=false;
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
      'campos': 'Campos variables'
    };
    this.tituloEdicion = titulos[seccion] || 'Edición';
  }

  seleccionarClausula(clausula: Clausula): void {
   
    this.seccionActiva = null;
    this.clausulaActiva = clausula.id;
    this.clausulaSeleccionada = clausula;
    this.tituloEdicion = "    Cláusula: " + clausula.nombre;
  }

  canDeactivate(): boolean | Observable<boolean> | Promise<boolean> {
    if (!this.cambiosSinGuardar) {
      return true;
    }

    return confirm('Tiene cambios sin guardar. ¿Desea salir sin guardar?');
  }

  volver() {
    this.router.navigate(
      ['/pliegos/bandeja-entrada'],
      { queryParams: { volver: '1' } }
    );
  }
}