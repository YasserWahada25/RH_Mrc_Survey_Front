import { Component } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { FormGroup, FormControl, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { AuthService } from 'src/app/services/authentification.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-side-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  templateUrl: './side-login.component.html',
  styleUrls: ['./side-login.component.css'],
})
export class AppSideLoginComponent {
  options = this.settings.getOptions();
  isSubmitted = false;
  isError = false;
  message = '';

  form = new FormGroup({
    uname: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService
  ) {}

  get f() {
    return this.form.controls;
  }

  submit() {
  this.isSubmitted = true;
  this.isError = false;
  this.message = '';

  if (this.form.valid) {
    const loginData = {
      email: this.form.value.uname!,
      password: this.form.value.password!
    };

    console.log('📤 Données envoyées :', loginData);
    this.authService.login(loginData).subscribe({
      next: (res) => {
        console.log('✅ Réponse login : ', res);

        if (!res || !res.token || !res.user) {
          this.isError = true;
          this.message = 'Réponse serveur invalide.';
          this.isSubmitted = false;
          return;
        }

        // ✅ Stockage correct dans localStorage
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user)); // ✅ Clé utilisée dans add.component.ts

        this.router.navigate(['/dashboards/dashboard1']);
      },
      error: (err) => {
        this.isError = true;
        this.isSubmitted = false;
        this.message = err.error?.message || 'Erreur lors de la connexion';
        this.form.patchValue({ password: '' });

        if (err.error.code === 403) this.form.patchValue({ uname: '' });
      }
    });
  }
}

}
