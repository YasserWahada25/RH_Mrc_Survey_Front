import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTabsModule } from '@angular/material/tabs';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-account-setting',
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    TablerIconsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './account-setting.component.html',
})
export class AppAccountSettingComponent {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  passwordForm: FormGroup;
  passwordChangeSuccess = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) return;

    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('❌ Les mots de passe ne correspondent pas', 'Fermer', { duration: 3000 });
      return;
    }

    const token = localStorage.getItem('token');
    this.http.patch(
      'http://localhost:3033/api/users/change-password',
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Mot de passe modifié avec succès', 'Fermer', { duration: 3000 });
        this.passwordChangeSuccess = true;
        this.passwordForm.reset();
        Object.keys(this.passwordForm.controls).forEach(key => {
          const control = this.passwordForm.get(key);
          control?.setErrors(null);
          control?.markAsPristine();
          control?.markAsUntouched();
          control?.updateValueAndValidity();
        });
        setTimeout(() => (this.passwordChangeSuccess = false), 3000);
      },
      error: err => {
        this.snackBar.open(`❌ ${err.error.message || 'Erreur serveur'}`, 'Fermer', { duration: 3000 });
        this.passwordChangeSuccess = false;
      }
    });
  }
}
