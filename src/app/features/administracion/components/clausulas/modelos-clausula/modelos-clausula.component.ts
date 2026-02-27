import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';
import { IColumnaOrden } from '../../../../../shared/models/common/columna-orden.model';
import { ModeloDTO } from 'src/app/shared/models/pliego/modelo/modelo.model';
import { ClausulaService } from '../../../services/clausula.service';

@Component({
  selector: 'app-modelos-clausula',
  templateUrl: './modelos-clausula.component.html',
  styleUrls: ['./modelos-clausula.component.scss'],
  standalone: false
})
export class ModelosClausulaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private clausulaService = inject(ClausulaService);
  private fechaPipe = inject(FechaPipe);

  clausulaId: number | null = null;
  denominacionClausula = '';
  modelos: ModeloDTO[] = [];
  modelosFiltrados: ModeloDTO[] = [];
  cargando = false;

  total = 0;
  parametros = {
    pagina: 0,
    tamanoPagina: 10,
    sort: 'denominacion',
    order: 'asc' as 'asc' | 'desc'
  };

  listaOrden: IColumnaOrden[] = [
    { id: 'denominacion', nombre: 'Denominación' },
  ];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.clausulaId = Number(idParam);
      this.cargarDatos();
    }
  }

  cargarDatos(): void {
    if (!this.clausulaId) {
      return;
    }

    this.cargando = true;

    this.clausulaService.obtenerClausula(this.clausulaId).subscribe({
      next: (clausula) => {
        if (clausula) {
          this.denominacionClausula = clausula.denominacion;
        }
      }
    });

    this.clausulaService.obtenerModelosPorClausula(this.clausulaId).subscribe({
      next: (modelos) => {
        this.modelos = modelos;
        this.aplicarOrdenYPaginacion();
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  aplicarOrdenYPaginacion(): void {
    let modelosOrdenados = [...this.modelos];

    modelosOrdenados.sort((a, b) => {
      let valorA: any = (a as any)[this.parametros.sort];
      let valorB: any = (b as any)[this.parametros.sort];

      if (valorA === null || valorA === undefined) valorA = '';
      if (valorB === null || valorB === undefined) valorB = '';

      if (typeof valorA === 'string') {
        valorA = valorA.toLowerCase();
        valorB = valorB.toLowerCase();
      }

      let comparacion = 0;
      if (valorA < valorB) {
        comparacion = -1;
      } else if (valorA > valorB) {
        comparacion = 1;
      }

      return this.parametros.order === 'asc' ? comparacion : -comparacion;
    });

    this.total = modelosOrdenados.length;

    const inicio = this.parametros.pagina * this.parametros.tamanoPagina;
    const fin = inicio + this.parametros.tamanoPagina;
    this.modelosFiltrados = modelosOrdenados.slice(inicio, fin);
  }

  cambioPagina(pagina: number): void {
    this.parametros.pagina = pagina - 1;
    this.aplicarOrdenYPaginacion();
  }

  cambioPorPagina(tamanoPagina: number): void {
    this.parametros.tamanoPagina = tamanoPagina;
    this.parametros.pagina = 0;
    this.aplicarOrdenYPaginacion();
  }

  cambioOrden(orden: 'asc' | 'desc'): void {
    this.parametros.order = orden;
    this.aplicarOrdenYPaginacion();
  }

  cambioColumnaOrden(columna: string): void {
    this.parametros.sort = columna;
    this.aplicarOrdenYPaginacion();
  }

  volver(): void {
    this.router.navigate(['/administracion/clausulas'], {
      queryParams: { volver: '1' }
    });
  }

  obtenerTextoVigencia(modelo: ModeloDTO): string {
    const desde = modelo.fechaVigenciaDesde
      ? this.fechaPipe.transform(modelo.fechaVigenciaDesde)
      : '';
    const hasta = modelo.fechaVigenciaHasta
      ? this.fechaPipe.transform(modelo.fechaVigenciaHasta)
      : '';
    return `${desde} - ${hasta}`;
  }

  obtenerEstadoVigencia(modelo: ModeloDTO): string {
    if (modelo.estado === 'BORRADOR') {
      return 'BORRADOR';
    }

    const hoy = new Date();
    const desde = modelo.fechaVigenciaDesde ? new Date(modelo.fechaVigenciaDesde) : null;
    const hasta = modelo.fechaVigenciaHasta ? new Date(modelo.fechaVigenciaHasta) : null;

    if (desde && hoy < desde) {
      return 'NO_VIGENTE';
    }
    if (hasta && hoy > hasta) {
      return 'NO_VIGENTE';
    }
    return 'VIGENTE';
  }

  obtenerTextoEstadoVigencia(modelo: ModeloDTO): string {
    const estado = this.obtenerEstadoVigencia(modelo);
    if (estado === 'VIGENTE') {
      return 'Vigente';
    }
    if (estado === 'BORRADOR') {
      return 'Borrador';
    }
    return 'No vigente';
  }

  esBorrador(modelo: ModeloDTO): boolean {
    return modelo.estado === 'BORRADOR';
  }
}
