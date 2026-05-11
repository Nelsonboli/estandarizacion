import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  password = '';
  errorMessage = '';

  constructor(private router: Router) {}

  onSubmit() {
    if (this.password === 'estandarizacion2026') {
      sessionStorage.setItem('general_auth', 'true');
      this.errorMessage = '';
      this.router.navigate(['/']);
    } else {
      this.errorMessage = 'Contraseña incorrecta. Por favor, intente de nuevo.';
      this.password = '';
    }
  }
}
