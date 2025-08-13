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
import { UserService } from 'src/app/services/user.service';
import { AuthService } from 'src/app/services/authentification.service'; // ⬅️ add

const API_BASE = 'http://localhost:3033';

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

  // Role helpers
  isRhOrOwner = this.user?.type === 'rh_admin' || this.user?.type === 'owner';

  // Logo (for rh_admin/owner)
  selectedLogo: File | null = null;
  logoPreview: string = this.user?.societe_logo ? `${API_BASE}${this.user.societe_logo}` : '/assets/images/profile/user-1.jpg';

  // Personal photo (for employe/responsable)
  selectedPhoto: File | null = null;
  photoPreview: string = this.user?.photo ? `${API_BASE}${this.user.photo}` : '/assets/images/profile/user-1.jpg';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private userService: UserService,
    private authService: AuthService, // ⬅️ add
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  // ====== Logo ======
  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const MAX = 800 * 1024;
    if (file.size > MAX) {
      this.snackBar.open('Image trop volumineuse (max 800KB).', 'Fermer', { duration: 2500 });
      return;
    }
    this.selectedLogo = file;
    const reader = new FileReader();
    reader.onload = (e: any) => this.logoPreview = e.target.result;
    reader.readAsDataURL(file);
  }

  uploadLogo() {
    if (!this.selectedLogo) return;
    const formData = new FormData();
    formData.append('logo', this.selectedLogo);

    const token = localStorage.getItem('token');
    this.http.patch(`${API_BASE}/api/users/update-logo`, formData, {
      headers: { Authorization: `Bearer ${token}` }
    }).subscribe({
      next: (res: any) => {
        this.snackBar.open('✅ Logo mis à jour avec succès', 'Fermer', { duration: 3000 });

        // 1) update preview immediately
        this.logoPreview = `${API_BASE}${res.logo}`;

        // 2) update local user
        this.user.societe_logo = res.logo;
        localStorage.setItem('user', JSON.stringify(this.user));

        // 3) broadcast to the whole app (header, etc.)
        this.authService.setSocieteLogo(res.logo);   // ⬅️ notify subscribers

        // optional reset
        this.selectedLogo = null;
      },
      error: err => {
        this.snackBar.open(`❌ ${err.error?.message || 'Erreur serveur'}`, 'Fermer', { duration: 3000 });
      }
    });
  }

  // ====== Personal photo ======
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const MAX = 800 * 1024;
    if (file.size > MAX) {
      this.snackBar.open('Image trop volumineuse (max 800KB).', 'Fermer', { duration: 2500 });
      return;
    }
    this.selectedPhoto = file;
    const reader = new FileReader();
    reader.onload = (e: any) => this.photoPreview = e.target.result;
    reader.readAsDataURL(file);
  }

  uploadMyPhoto() {
    if (!this.selectedPhoto) return;
    this.userService.uploadMyPhoto(this.selectedPhoto).subscribe({
      next: ({ photo }) => {
        this.snackBar.open('✅ Photo mise à jour', 'Fermer', { duration: 3000 });

        // 1) update preview immediately
        this.photoPreview = `${API_BASE}${photo}`;

        // 2) update local user
        this.user.photo = photo;
        localStorage.setItem('user', JSON.stringify(this.user));

        // 3) broadcast to the whole app (header, etc.)
        this.authService.setUserPhoto(photo);       // ⬅️ notify subscribers

        // optional reset
        this.selectedPhoto = null;
      },
      error: (err) => {
        this.snackBar.open(`❌ ${err.error?.message || 'Erreur serveur'}`, 'Fermer', { duration: 3000 });
      }
    });
  }

  // ====== Password ======
  changePassword() {
    if (this.passwordForm.invalid) return;
    const { currentPassword, newPassword, confirmPassword } = this.passwordForm.value;

    if (newPassword !== confirmPassword) {
      this.snackBar.open('❌ Les mots de passe ne correspondent pas', 'Fermer', { duration: 3000 });
      return;
    }

    const token = localStorage.getItem('token');
    this.http.patch(`${API_BASE}/api/users/change-password`,
      { currentPassword, newPassword },
      { headers: { Authorization: `Bearer ${token}` } }
    ).subscribe({
      next: () => {
        this.snackBar.open('✅ Mot de passe modifié avec succès', 'Fermer', { duration: 3000 });
        this.passwordForm.reset();
      },
      error: err => {
        this.snackBar.open(`❌ ${err.error?.message || 'Erreur serveur'}`, 'Fermer', { duration: 3000 });
      }
    });
  }
}
