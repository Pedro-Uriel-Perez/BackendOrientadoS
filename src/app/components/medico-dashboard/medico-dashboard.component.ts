import { Component, OnInit, AfterViewInit } from '@angular/core';
import { DatesService } from '../../services/dates.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-medico-dashboard',
  templateUrl: './medico-dashboard.component.html',
  styleUrls: ['./medico-dashboard.component.css']
})
export class MedicoDashboardComponent implements OnInit, AfterViewInit {
  citas: any[] = [];
  citasFiltradas: any[] = [];
  citaSeleccionada: any = null;
  historialMedico: any = {
    diagnostico: '',
    tratamiento: '',
    observaciones: ''
  };
  fechaInicio: string = '';
  fechaFin: string = '';
  nombreMedico: string = '';

  constructor(private datesService: DatesService, private router: Router) { }

  ngOnInit() {
    this.cargarCitas();
    this.cargarDatosMedico();
  }

  ngAfterViewInit() {
    this.setupTextareaAutoResize();
  }

  cargarDatosMedico() {
    const nombre = localStorage.getItem('medicoNombre') || '';
    const apellido = localStorage.getItem('medicoApellido') || '';
    this.nombreMedico = `${nombre} ${apellido}`.trim();
  }

  cargarCitas() {
    const medicoId = localStorage.getItem('medicoId');
    if (medicoId) {
      this.datesService.getCitasByMedico(medicoId).subscribe(
        (citas) => {
          this.citas = citas.map(cita => ({
            ...cita,
            nombreCompleto: cita.nombrePaciente || cita.paciente.nombre || 'No especificado',
            edad: cita.paciente.edad,
            genero: cita.paciente.genero,
            tipoSangre: cita.paciente.tipoSangre
          }));
          this.citasFiltradas = [...this.citas];
          console.log('Citas procesadas:', this.citas);
        },
        (error) => console.error('Error al cargar citas:', error)
      );
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  confirmarCita(idCita: number) {
    this.datesService.confirmarCita(idCita).subscribe(
      () => {
        this.cargarCitas();
      },
      (error) => console.error('Error al confirmar cita:', error)
    );
  }

  seleccionarCita(cita: any) {
    this.citaSeleccionada = cita;
    this.historialMedico = {
      diagnostico: '',
      tratamiento: '',
      observaciones: ''
    };
    setTimeout(() => this.setupTextareaAutoResize(), 0);
  }

  finalizarCita() {
    if (this.citaSeleccionada) {
      const historialMedico = {
        diagnostico: this.historialMedico.diagnostico || '',
        tratamiento: this.historialMedico.tratamiento || '',
        observaciones: this.historialMedico.observaciones || ''
      };

      this.datesService.finalizarCita(this.citaSeleccionada.idcita, historialMedico).subscribe(
        () => {
          this.cargarCitas();
          this.cerrarModal();
        },
        (error) => console.error('Error al finalizar cita:', error)
      );
    }
  }

  filtrarPorFechas() {
    if (this.fechaInicio && this.fechaFin) {
      const fechaInicio = new Date(this.fechaInicio);
      const fechaFin = new Date(this.fechaFin);

      if (!isNaN(fechaInicio.getTime()) && !isNaN(fechaFin.getTime())) {
        this.citasFiltradas = this.citas.filter(cita => {
          const fechaCita = new Date(cita.fecha);
          return fechaCita >= fechaInicio && fechaCita <= fechaFin;
        });
      }
    } else {
      this.citasFiltradas = [...this.citas];
    }
  }

  cerrarModal() {
    this.citaSeleccionada = null;
  }

  verHistorialMedico(cita: any) {
    console.log('Viendo historial médico para paciente:', cita.paciente);
    this.router.navigate(['/historial-medico'], { 
      state: { 
        pacienteId: cita.idPaciente,
        pacienteNombre: cita.nombrePaciente
      } 
    });
  }

  setupTextareaAutoResize() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(textarea => {
      textarea.addEventListener('input', this.autoResize);
      this.autoResize({ target: textarea } as any);
    });
  }

  autoResize(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }
}