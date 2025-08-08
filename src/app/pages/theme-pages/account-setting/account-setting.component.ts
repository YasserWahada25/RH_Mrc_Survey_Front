import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
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
    CommonModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatTabsModule,
    MatIconModule,
    TablerIconsModule,
    MatSelectModule,
    MatSlideToggleModule
  ],
  templateUrl: './account-setting.component.html',
})
export class AppAccountSettingComponent {
  user = JSON.parse(localStorage.getItem('user') || '{}');
  passwordForm: FormGroup;

  selectedFile: File | null = null;
  logoPreview: string = this.user?.societe_logo
    ? `http://localhost:3033${this.user.societe_logo}`
    : '/assets/images/profile/user-1.jpg';

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadLogo() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('logo', this.selectedFile);

    const token = localStorage.getItem('token');
    this.http.patch('http://localhost:3033/api/users/update-logo', formData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.snackBar.open('✅ Logo mis à jour avec succès', 'Fermer', { duration: 3000 });
        this.user.societe_logo = res.logo;
        localStorage.setItem('user', JSON.stringify(this.user));
        this.logoPreview = `http://localhost:3033${res.logo}`;
      },
      error: err => {
        this.snackBar.open(`❌ ${err.error.message || 'Erreur serveur'}`, 'Fermer', { duration: 3000 });
      }
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
    this.http.patch('http://localhost:3033/api/users/change-password',
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Mot de passe modifié avec succès', 'Fermer', { duration: 3000 });
        this.passwordForm.reset();
      },
      error: err => {
        this.snackBar.open(`❌ ${err.error.message || 'Erreur serveur'}`, 'Fermer', { duration: 3000 });
      }
    });
  }
}
