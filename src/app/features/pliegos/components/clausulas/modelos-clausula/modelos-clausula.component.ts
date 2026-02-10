import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { Modelo } from '../../../models/modelo.model';
import { ClausulaService } from '../../../services/clausula.service';
import { FechaPipe } from '../../../../../shared/pipes/fecha.pipe';

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
  modelos: Modelo[] = [];
  cargando = false;

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
        this.cargando = false;
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/pliegos/clausulas'], {
      queryParams: { volver: '1' }
    });
  }

  obtenerTextoVigencia(modelo: Modelo): string {
    const desde = modelo.fechaVigenciaDesde
      ? this.fechaPipe.transform(modelo.fechaVigenciaDesde)
      : '';
    const hasta = modelo.fechaVigenciaHasta
      ? this.fechaPipe.transform(modelo.fechaVigenciaHasta)
      : '';
    return `${desde} - ${hasta}`;
  }

  obtenerEstadoVigencia(modelo: Modelo): string {
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

  obtenerTextoEstadoVigencia(modelo: Modelo): string {
    const estado = this.obtenerEstadoVigencia(modelo);
    if (estado === 'VIGENTE') {
      return 'Vigente';
    }
    if (estado === 'BORRADOR') {
      return 'Borrador';
    }
    return 'No vigente';
  }

  esBorrador(modelo: Modelo): boolean {
    return modelo.estado === 'BORRADOR';
  }
}
