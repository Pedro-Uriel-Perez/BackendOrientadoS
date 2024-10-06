import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Citas } from '../models/Citas';
import { Date } from '../models/Date';

@Injectable({
  providedIn: 'root'
})
export class DatesService {
  //API_URI = 'http://localhost:3000/api'; // para frontend
  API_URI = 'https://citasmedicas-ten.vercel.app/api'; // Cambiado para usar backend

  private POSITIONSTACK_API = 'https://api.positionstack.com/v1';
  private POSITIONSTACK_API_KEY = 'fa06cdb185054fb35ca0032d6d8855c9'; // API de datos

  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<any>(JSON.parse(localStorage.getItem('user') || 'null'));
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  // Autenticación con Google
  authenticateWithGoogle(credential: string): Observable<any> {
    console.log('Enviando credencial de Google al backend');
    return this.http.post(`${this.API_URI}/auth/google`, { token: credential }).pipe(
      tap(response => {
        console.log('Respuesta del backend:', response);
        this.handleAuthSuccess(response);
      }),
      catchError(this.handleError)
    );
  }

  

  // Autenticación con GitHub
  loginWithGitHub(): void {
    window.location.href = `${this.API_URI}/auth/github`;
  }

  // Manejo de la respuesta de autenticación
  handleAuthResponse(token: string): Observable<any> {
    return this.http.post(`${this.API_URI}/verify-token`, { token }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  // Método para manejar el éxito de la autenticación
  private handleAuthSuccess(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response));
    this.currentUserSubject.next(response);
  }

  // Obtener información del usuario
  getUserInfo(): Observable<any> {
    return this.http.get(`${this.API_URI}/user`, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${this.getToken()}`
      })
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Verificar si el usuario está autenticado
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUserValue;
  }

  // Obtener el token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Cerrar sesión
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }


  

   // Netodos para la geolocalizacion de Positionstack
   

  private handleError(error: HttpErrorResponse) {
    console.error('Error en la solicitud HTTP:', error);
    let errorMsg: string;
    if (error.error instanceof ErrorEvent) {
      errorMsg = `Error del cliente: ${error.error.message}`;
    } else {
      errorMsg = `Error del servidor: ${error.status}, cuerpo: ${JSON.stringify(error.error)}`;
    }
    console.error(errorMsg);
    return throwError(errorMsg);
  }

  
  geocodeAddress(address: string): Observable<any> {
    const url = `${this.POSITIONSTACK_API}/forward`;
    const params = {
      access_key: this.POSITIONSTACK_API_KEY,
      query: address
    };
    return this.http.get(url, { params });
  }

  reverseGeocode(lat: number, lon: number): Observable<any> {
    const url = `${this.POSITIONSTACK_API}/reverse`;
    const params = {
      access_key: this.POSITIONSTACK_API_KEY,
      query: `${lat},${lon}`
    };
    return this.http.get(url, { params });
  }



  // Mwtodo para guardar un hospitall
  guardarHospital(hospital: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.API_URI}/registrar-hospital`, hospital, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  procesarPago(tarjeta: any): Observable<any> {
    return this.http.post<any>(`${this.API_URI}/registrar-pagos`, tarjeta);
  }

  getDates(): Observable<Date[]> {
    return this.http.get<Date[]>(`${this.API_URI}/dates`).pipe(
      tap(dates => console.log('Fechas obtenidas:', dates)),
      catchError(this.handleError)
    );
  }

  getDate(id: string): Observable<Date> {
    return this.http.get<Date>(`${this.API_URI}/dates/${id}`).pipe(
      tap(date => console.log('Fecha obtenida:', date)),
      catchError(this.handleError)
    );
  }

  saveDate(date: Date): Observable<any> {
    console.log('Enviando solicitud de registro:', date);
    return this.http.post(`${this.API_URI}/register`, date).pipe(
      catchError(this.handleError)
    );
  }

  register(user: any): Observable<any> {
    return this.http.post(`${this.API_URI}/register`, user).pipe(
      catchError(this.handleError)
    );
  }

  login(credentials: { correo: string; contrase: string }): Observable<any> {
    return this.http.post(`${this.API_URI}/login`, credentials).pipe(
      catchError(this.handleError)
    );
  }

  authenticate(correo: string, contrase: string): Observable<{ isAuthenticated: boolean; userId?: string; userName?: string }> {
    return this.http.post<{ isAuthenticated: boolean; userId?: string; userName?: string }>(`${this.API_URI}/auth`, { correo, contrase }).pipe(
      tap(response => console.log('Autenticación:', response)),
      catchError(this.handleError)
    );
  }

  saveCita(cita: Citas): Observable<any> {
    return this.http.post(`${this.API_URI}/citas`, cita);
  }

  getAllCitas(): Observable<Citas[]> {
    return this.http.get<Citas[]>(`${this.API_URI}/citas`);
  }

  downloadCitasAsJson(citas: Citas[]): void {
    const data = JSON.stringify(citas, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'citas.xls';
    link.click();
    window.URL.revokeObjectURL(url);
  }


  // Para ver las citas médicas y el historial de citas
  registrarCita(cita: any): Observable<any> {
    return this.http.post(`${this.API_URI}/citas`, cita);
  }

  getCitasPaciente(idPaciente: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URI}/citas/${idPaciente}`);
  }

  getCitasByPaciente(idPaciente: string): Observable<Citas[]> {
    return this.http.get<Citas[]>(`${this.API_URI}/citas/${idPaciente}`).pipe(
      map(citas => citas.map(cita => ({
        ...cita,
        especialidad: cita.especialidad || 'No especificada',
        hospital: cita.hospital || 'No especificada',
        duracionEstimada: cita.duracionEstimada || '30 minutos',
        telefonoMedico: cita.telefonoMedico || 'No disponible',
        correoMedico: cita.correoMedico || 'No disponible',
        puedeModificar: cita.estado === 'pendiente',
        estaFinalizada: cita.estado === 'finalizada'
      })))
    );
  }

  // Modificación de citas y cancelaciones por parte de los pacientes
  updateCita(cita: Citas): Observable<any> {
    return this.http.put(`${this.API_URI}/citas/${cita.idcita}`, cita);
  }

  deleteCita(idCita: number): Observable<any> {
    return this.http.delete(`${this.API_URI}/citas/${idCita}`);
  }

  // Métodos para médicos
  medicoLogin(correo: string, id: string): Observable<any> {
    return this.http.post(`${this.API_URI}/medico-login`, { correo, id }).pipe(
      tap(response => console.log('Login de médico:', response)),
      catchError(this.handleError)
    );
  }


  // Para confirmar citas y enviar historial médico
  confirmarCita(idCita: number): Observable<any> {
    return this.http.put(`${this.API_URI}/citas/${idCita}/confirmar`, {});
  }

  finalizarCita(idCita: number, historialMedico: any): Observable<any> {
    return this.http.post(`${this.API_URI}/citas/${idCita}/finalizar`, historialMedico);
  }




  // Obtener historial médico de un paciente


 

  getCitasByMedico(medicoId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URI}/citas-medico/${medicoId}`).pipe(
      tap(citas => console.log('Citas obtenidas:', citas)),
      catchError(this.handleError)
    );
  }
  getHistorialMedico(idPaciente: string): Observable<any> {
    console.log('Solicitando historial médico para el paciente:', idPaciente);
    return this.http.get(`${this.API_URI}/historial-medico/${idPaciente}`).pipe(
      tap(historial => console.log('Historial médico obtenido:', historial)),
      catchError(this.handleError)
    );
  }

  actualizarHistorial(idHistorial: string, historial: any): Observable<any> {
    return this.http.put(`${this.API_URI}/historial-medico/${idHistorial}`, historial).pipe(
      catchError(this.handleError)
    );
  }

  eliminarHistorial(idHistorial: string): Observable<any> {
    return this.http.delete(`${this.API_URI}/historial-medico/${idHistorial}`).pipe(
      catchError(this.handleError)
    );
  }

  
}

  
    