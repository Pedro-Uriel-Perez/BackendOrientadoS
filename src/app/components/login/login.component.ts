import { Component, NgZone, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DatesService } from '../../services/dates.service';

declare var google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  correo: string = '';
  contrase: string = '';
  errorMessage: string = '';

  constructor(
    private datesService: DatesService, 
    private router: Router, 
    private ngZone: NgZone
  ) { }

  ngOnInit() {
    this.loadGoogleScript();
  }

  loadGoogleScript() {
    if (typeof google !== 'undefined') {
      this.initializeGoogleSignIn();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => this.initializeGoogleSignIn();
    document.body.appendChild(script);
  }

  initializeGoogleSignIn() {
    if (google && google.accounts && google.accounts.id) {
      google.accounts.id.initialize({
        client_id: '897350557653-u9a4a3mav5hpn8naolv3qcm4gd5vo5n2.apps.googleusercontent.com',
        callback: this.handleCredentialResponse.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      
      google.accounts.id.renderButton(
        document.getElementById('googleSignInButton'),
        { theme: 'outline', size: 'large' }
      );
    } else {
      console.error('Google Sign-In API no está disponible');
    }
  }

  

  handleCredentialResponse(response: any) {
    console.log('Respuesta de Google:', response);
    this.datesService.authenticateWithGoogle(response.credential).subscribe(
      (authResponse: any) => {
        console.log('Autenticación exitosa:', authResponse);
        this.handleSuccessfulLogin(authResponse);
      },
      error => {
        console.error('Error en la autenticación con Google:', error);
        this.errorMessage = error;
      }
    );
  }

  onLogin(): void {
    this.datesService.login({ correo: this.correo, contrase: this.contrase }).subscribe(
      (response: any) => {
        if (response.isAuthenticated) {
          this.handleSuccessfulLogin(response);
        } else {
          this.errorMessage = 'Correo o contraseña incorrectos';
        }
      },
      (error) => {
        console.error('Error al autenticar usuario:', error);
        this.errorMessage = 'Error al autenticar usuario: ' + error.message;
      }
    );
  }

  loginWithGitHub(): void {
    this.datesService.loginWithGitHub();
  }

  private handleSuccessfulLogin(response: any): void {
    console.log('Usuario autenticado exitosamente');
    localStorage.setItem('userId', response.userId);
    localStorage.setItem('userName', response.userName);
    this.ngZone.run(() => {
      this.router.navigate(['/citas', { userId: response.userId, userName: response.userName }]);
    });
  }
}