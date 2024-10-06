import { AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';
import { Citas } from '../../models/Citas';
import * as L from 'leaflet';
import { Medico } from 'src/app/models/Medico';


@Component({
  selector: 'app-citas',
  templateUrl: './citas.component.html',
  styleUrls: ['./citas.component.css']
})
export class CitasComponent implements OnInit, AfterViewInit  {



  @ViewChild('mapContainer', { static: false }) mapContainer: ElementRef | undefined;

  modalAbierto = false;
  fechaSeleccionada: string = '';
  horaSeleccionada: string = '';
  medicoSeleccionado: any = {};
  idPaciente: string = '';
  nombrePaciente: string = '';
  errorMessage: string = '';
  welcomeMessage: string = '';
  citaGenerada: boolean = false;
  historialCitas: Citas[] = [];
  mostrarHistorial: boolean = false;
  userId: string | null = null;
  userName: string | null = null;

  

  map: L.Map | undefined;
  mapInitialized: boolean = false;

  private customIcon = L.icon({
    iconUrl: 'assets/custom-marker-icon.png',  //  imagen esta e n carpeta assets
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34]
  });


  medicos = [
    { id: 1, nombre: 'Dr. Juan Pérez', hospital: 'Hospital Del Ángel', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Cardiología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorJuanPerez.jpg',latitud: 21.15789733348977,longitud:-100.9184991597011 },
      
    { id: 2, nombre: 'Dra. María García', hospital: 'Hospital MAC', ciudad: 'San Miguel de Allende',
       especialidad: 'Pediatría', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraMariaGarcia.jpg',latitud: 20.90038775092955,longitud:-100.72953443712234  },

    { id: 3, nombre: 'Dr. Carlos López', hospital: 'Hospital General SDLP', ciudad: 'San Luis de la paz', 
      especialidad: 'Neurología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorCarlosLopez.jpg',latitud: 21.279606204774485,longitud: -100.49606761123135  },

    { id: 4, nombre: 'Dra. Ana Martínez', hospital: 'Hospital General Dolores Hidalgo', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Dermatología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraAnaMartinez.jpg',latitud: 21.1355310118905,longitud: -100.93347581956743 },

    { id: 5, nombre: 'Dra. Sandra Martínez', hospital: 'Hospital H+ Querétaro', ciudad: 'Queretaro',
       especialidad: 'Neurología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraSandraMartinez.jpg',latitud: 20.5847024995157,longitud: -100.40021725839604 },

    { id: 6, nombre: 'Dr. Pedro Esparza', hospital: 'Hospital Angeles Pedregal', ciudad: 'CDMX', 
      especialidad: 'Cardiología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorPedroEsparza.jpg',latitud: 19.312516319110998,longitud: -99.22116559045386 },

    { id: 7, nombre: 'Dr. Antonio Gomez', hospital: 'Hospital General Tijuana', ciudad: 'Tijuana', 
      especialidad: 'Ginecologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorAntonioGomez.jpg',latitud: 32.5256293927447,longitud: -117.00948121144893 },

    { id: 8, nombre: 'Dra. Paulina Delgado', hospital: 'Hospital General de Queretaro', ciudad: 'Queretaro', 
      especialidad: 'Psicologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraPaulinaDelgado.jpg',latitud: 20.579954108345174,longitud: -100.4059652249689 },

    { id: 9, nombre: 'Dr. Xavie Sinue', hospital: 'Hospital General La Villa', ciudad: 'CDMX',   
      especialidad: 'Dermatología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorXavierSinue.jpg',latitud: 19.482133373225736 ,longitud: -99.10335737316684 },

    { id: 10, nombre: 'Dr. Calos Carrillo', hospital: 'Hospital Star Médica Querétaro', ciudad: 'Queretaro', 
      especialidad: 'Cirujano', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorCarlosCarrillo.jpg',latitud: 20.6175496295999,longitud: -100.40740511349595 },

    { id: 11, nombre: 'Dr. Jesus Hernandez', hospital: 'Hospital de la Mujer', ciudad: 'CDMX', 
      especialidad: 'Anestesiólogo', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorJesusHernandez.jpg',latitud: 19.452945160210596,longitud: -99.17067337980909 },

    { id: 12, nombre: 'Dr. José Martínez', hospital: 'Hospital San José de Querétaro', ciudad: 'Queretaro',
      especialidad: 'Psicologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorJoseMartinez.jpg',latitud: 20.564966426437575,longitud: -100.41278866280385 },

    { id: 13, nombre: 'Dr. Diego Cruz', hospital: 'Clínica de Especialidades Santa Fe', ciudad: 'Dolores Hidalgo',  
      especialidad: 'Dermatología', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorDiegoCruz.jpg',latitud: 21.15420719311542,longitud:  -100.91945145887419 },

    { id: 14, nombre: 'Dr. María Cruz', hospital: 'Clínica Santa María', ciudad: 'San Luis de la paz', 
      especialidad: 'Cirujano', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctoraMariaCruz.jpg',latitud: 21.290033949075724,longitud: -100.51391295396476 },

    { id: 15, nombre: 'Dr. Miguel García', hospital: 'Sanatorio de Especialidades Guadalupe', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Psicologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorMiguelGarcia.jpg',latitud:21.159526913342553,longitud: -100.93471951360526 },

    { id: 16, nombre: 'Dr. Pedro Gómez', hospital: 'Hospital General SDLP', ciudad: 'San Luis de la paz', 
      especialidad: 'Cirujano', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorPedroGomez.jpg',latitud: 21.28003523489967,longitud: -100.49622332787783 },

    { id: 17, nombre: 'Dr. Hernan Martínez', hospital: 'Hospital Del Ángel', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Cirujano', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorHernanMartinez.jpg',latitud: 21.15868645012911,longitud: -100.91858334428885 },

    { id: 18, nombre: 'Dr. Diego Gómez', hospital: 'Hospital Del Ángel', ciudad: 'Dolores Hidalgo', 
      especialidad: 'Psicologia', disponibilidad: 'Disponible', imagen: 'assets/Doctores/doctorDiegoGomez.jpg',latitud: 21.15868645012911,longitud: -100.91858334428885 },
  ];



  
  citas: Citas[] | undefined;

  medicosFiltrados: any[] = [];

  searchNombre: string = '';
  searchEspecialidad: string = '';
  searchHospital: string = '';
  searchCiudad: string = '';

  especialidades: string[] = [];
  hospitales: string[] = [];
  ciudades: string[] = [];

  constructor(
    private datesService: DatesService,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone 

  ) { }



  //para cerrar sesion de git

  logout(): void {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      this.datesService.logout();
      this.router.navigate(['/home']); // Redirige al usuario a la página de login
    }
  }


  //para la geolocalizacion
  

  abrirMapaEnNuevaPestana(latitud: number, longitud: number) {
    const url = `/geolocalizacion?lat=${latitud}&lng=${longitud}`;
    window.open(url, '_blank');
  }
  
  toggleUbicacion(medico: any) {
    medico.ubicacionVisible = !medico.ubicacionVisible;
  }
  
  obtenerCoordenadasMedicos(): void {
    this.medicos.forEach(medico => {
      if (medico.latitud === 0 && medico.longitud === 0) {
        // Usa el servicio DatesService para obtener las coordenadas de Positionstack
        const direccion = `${medico.hospital}, ${medico.ciudad}`;
        this.datesService.geocodeAddress(direccion).subscribe(
          (response: any) => {
            if (response && response.data && response.data.length > 0) {
              const coordenadas = response.data[0];
              medico.latitud = coordenadas.latitude;
              medico.longitud = coordenadas.longitude;
              console.log(`Coordenadas obtenidas para ${medico.nombre}: ${medico.latitud}, ${medico.longitud}`);
              
              this.agregarMarcador(medico);
            }
          },
          (error) => {
            console.error(`Error al obtener coordenadas para ${medico.nombre}:`, error);
          }
        );
      } else {
        this.agregarMarcador(medico);
      }
    });
  }

  
  ngAfterViewInit(): void {
    this.inicializarMapa();
  }

  inicializarMapa(): void {
    if (this.mapContainer && !this.mapInitialized) {
      this.map = L.map(this.mapContainer.nativeElement).setView([20.0, -100.0], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(this.map);

      this.mapInitialized = true;
    }
  }
  

  agregarMarcador(medico: any): void {
    if (this.map) {
      const marker = L.marker([medico.latitud, medico.longitud]).addTo(this.map)
        .bindPopup(`<b>${medico.nombre}</b><br>${medico.hospital}<br>${medico.especialidad}`);
      marker.on('click', () => {
        console.log(`Marcador clickeado para el médico: ${medico.nombre}`);
      });
    }
  }
  


  verUbicacionMedico(latitud: number, longitud: number): void {
    if (this.map && this.mapInitialized) {
      const nuevaUbicacion = L.latLng(latitud, longitud);
      this.map.setView(nuevaUbicacion, 15); // Ajustar zoom y centrar en la ubicacion
    } else {
      alert('Mapa no está inicializado o la ubicación no está disponible.');
    }
  }

  
  

  
  ///hata aqui termina geolocalizacion


  
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.idPaciente = params['userId'] || '';
      this.nombrePaciente = params['userName'] || '';
    });
  
    this.route.queryParams.subscribe(queryParams => {
      const token = queryParams['token'];
      if (token) {
        // Guardar el token en localStorage o en un servicio de autenticación
        localStorage.setItem('auth_token', token);
        // Podrías también decodificar el token JWT aquí para obtener más información del usuario
      }
    });
  
    // Intentar obtener el ID y nombre del usuario del localStorage si no están en los parámetros
    if (!this.idPaciente || !this.nombrePaciente) {
      this.idPaciente = localStorage.getItem('userId') || '';
      this.nombrePaciente = localStorage.getItem('userName') || '';
    }
  
    if (this.idPaciente && this.nombrePaciente) {
      // Guardar o actualizar la información en localStorage
      localStorage.setItem('userId', this.idPaciente);
      localStorage.setItem('userName', this.nombrePaciente);
      
      this.welcomeMessage = `Bienvenido, ${this.nombrePaciente}!`;
      this.medicosFiltrados = this.medicos;
      this.inicializarFiltros();
      this.cargarHistorialCitas();
      this.cargarCitas();
      this.obtenerCoordenadasMedicos();
    } else {
      console.error('No se encontró ID o nombre de paciente');
      this.router.navigate(['/login']);
    }
  }
  

  irAVerCitas(): void {
    this.router.navigate(['/ver-citas', this.idPaciente, this.nombrePaciente]);
  }

  irAHistorialPaciente(): void {
    this.router.navigate(['/historial-paciente', this.idPaciente, this.nombrePaciente]);
  }


  cargarCitas() {
    this.datesService.getCitasByPaciente(this.idPaciente).subscribe(
      (citas: Citas[]) => {
        this.citas = citas.map(cita => ({
          ...cita,
          especialidad: cita.especialidad || 'No especificada',
          hospital: cita.hospital || 'No especificada',
          duracionEstimada: '30 minutos',
          telefonoMedico: cita.telefonoMedico || 'No disponible',
          correoMedico: cita.correoMedico || 'No disponible',
          imagenMedico: cita.imagenMedico || 'assets/default-doctor-image.jpg' 
        }));
        console.log('Citas cargadas:', this.citas);
      },
      error => console.error('Error al cargar citas:', error)
    );
  }

  

  abrirModal(medico: any): void {
    this.medicoSeleccionado = medico;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.fechaSeleccionada = '';
    this.horaSeleccionada = '';
    this.medicoSeleccionado = {};
    this.citaGenerada = false;
  }

  onFechaChange(event: any): void {
    this.fechaSeleccionada = event.target.value;
  }

  onHoraChange(event: any): void {
    this.horaSeleccionada = event.target.value;
  }

  generarCita(): void {
    if (!this.fechaSeleccionada || !this.horaSeleccionada || !this.medicoSeleccionado.id) {
      alert('Por favor, complete todos los campos');
      return;
    }
    

    const nuevaCita: Citas = {
      idcita: 0,
      IdMedico: this.medicoSeleccionado.id,
      idPaciente: this.idPaciente,
      nombrePaciente: this.nombrePaciente,
      descripcion: `Consulta con ${this.medicoSeleccionado.nombre} - ${this.medicoSeleccionado.especialidad}`,
      fecha: this.fechaSeleccionada,
      hora: this.horaSeleccionada,
      nombreMedico: this.medicoSeleccionado.nombre,
      especialidad: this.medicoSeleccionado.especialidad,
      hospital: this.medicoSeleccionado.hospital,
      telefonoMedico: this.medicoSeleccionado.telefono,
      correoMedico: this.medicoSeleccionado.correo,
      duracionEstimada: undefined,
      estado: 'pendiente' // borrar si es nesesacrio 
    };

    console.log('Generando cita:', nuevaCita);

    this.datesService.saveCita(nuevaCita).subscribe(
      (resp: any) => {
        console.log('Cita guardada con éxito', resp);
        this.citaGenerada = true;
        alert('Cita generada con éxito');
        
        const citaConFormato = {
          ...nuevaCita,
          fechaFormateada: this.formatearFecha(nuevaCita.fecha),
          horaFormateada: this.formatearHora(nuevaCita.hora)
        };
        this.historialCitas.unshift(citaConFormato);
        
        this.cerrarModal();
      },
      error => {
        console.error('Error al guardar la cita', error);
        alert('Error al generar la cita');
      }
    );
  }

  verHistorialCitas(): void {
    this.mostrarHistorial = !this.mostrarHistorial;
    if (this.mostrarHistorial && this.historialCitas.length === 0) {
      this.cargarHistorialCitas();
    }
  }

  

  

  cargarHistorialCitas(): void {
    if (this.idPaciente) {
      console.log('Cargando historial de citas para el paciente:', this.idPaciente);
      this.datesService.getCitasByPaciente(this.idPaciente).subscribe(
        (citas: Citas[]) => {
          console.log('Citas recibidas del servidor:', citas);
          this.historialCitas = citas.map(cita => ({
            ...cita,
            fechaFormateada: this.formatearFecha(cita.fecha),
            horaFormateada: this.formatearHora(cita.hora)
          }));
          console.log('Historial de citas formateado:', this.historialCitas);
          if (this.historialCitas.length === 0) {
            console.log('No se encontraron citas para este paciente');
          }
        },
        error => {
          console.error('Error al cargar el historial de citas', error);
          this.errorMessage = 'Error al cargar el historial de citas';
        }
      );
    } else {
      console.error('No hay ID de paciente para cargar el historial');
    }
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  }

  formatearHora(hora: string): string {
    return hora.substring(0, 5);
  }

  downloadCitas(): void {
    this.errorMessage = '';
    this.datesService.getAllCitas().subscribe({
      next: (citas: Citas[]) => {
        this.datesService.downloadCitasAsJson(citas);
      },
      error: (error) => {
        this.errorMessage = 'Error al descargar las citas: ' + error.message;
        console.error('Error al descargar las citas', error);
      }
    });
  }
  inicializarFiltros(): void {
    this.especialidades = [...new Set(this.medicos.map(m => m.especialidad))];
    this.hospitales = [...new Set(this.medicos.map(m => m.hospital))];
    this.ciudades = [...new Set(this.medicos.map(m => m.ciudad))];
  }

  aplicarFiltros(): void {
    this.medicosFiltrados = this.medicos.filter(medico => 
      medico.nombre.toLowerCase().includes(this.searchNombre.toLowerCase()) &&
      (this.searchEspecialidad === '' || medico.especialidad === this.searchEspecialidad) &&
      (this.searchHospital === '' || medico.hospital === this.searchHospital) &&
      (this.searchCiudad === '' || medico.ciudad === this.searchCiudad)
    );
  }
}