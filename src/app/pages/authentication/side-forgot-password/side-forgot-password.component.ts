import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-side-forgot-password',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    HttpClientModule,
  ],
  templateUrl: './side-forgot-password.component.html',
})
export class AppSideForgotPasswordComponent {
  form!: FormGroup;
  token!: string;
  options = this.settings.getOptions();

  constructor(
    private settings: CoreService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = new FormGroup(
      {
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get f() {
    return this.form.controls;
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (password !== confirmPassword) {
      group.get('confirmPassword')?.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    return null;
  }

  submit() {
    if (this.form.invalid) return;

    // 🔐 Extraire token de l'URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    const payload = {
      newPassword: this.form.value.newPassword,
    };

    // 📨 Envoi vers le backend
    this.http
      .patch(`http://localhost:3033/api/auth/reset-password/${this.token}`, payload)
      .subscribe({
        next: () => {
          alert('✅ Mot de passe réinitialisé avec succès !');
          this.router.navigate(['/authentication/login']);
        },
        error: (err) => {
          console.error('❌ Erreur :', err);
          alert('Erreur lors de la réinitialisation.');
        },
      });
  }
}
