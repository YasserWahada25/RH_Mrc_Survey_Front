import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CoreService } from 'src/app/services/core.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/authentification.service';

@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './side-register.component.html',
  styleUrls: ['./side-register.component.css'],
})
export class AppSideRegisterComponent {
  options = this.settings.getOptions();

  logoFile: File | null = null;
  selectedLogoName: string | null = null;
  logoPreviewUrl: string | null = null;
  logoError: string | null = null;

  form = new FormGroup({
    nomSociete: new FormControl('', [Validators.required]),
    nom: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    tel: new FormControl('', [Validators.required]),
  });

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService
  ) { }

  get f() {
    return this.form.controls;
  }

  onLogoSelected(event: any): void {
    const file = event.target.files[0];
    this.logoError = null;

    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      const maxSizeMB = 2;

      if (!allowedTypes.includes(file.type)) {
        this.logoError = 'FORMAT_INVALIDE';
        return;
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        this.logoError = 'TAILLE_TROP_GRANDE';
        return;
      }

      this.logoFile = file;
      this.selectedLogoName = file.name;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreviewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.invalid || this.logoError) return;

    const formData = new FormData();
    formData.append('nomSociete', this.form.value.nomSociete || '');
    formData.append('nom', this.form.value.nom || '');
    formData.append('email', this.form.value.email || '');
    formData.append('password', this.form.value.password || '');
    formData.append('tel', this.form.value.tel || '');
    if (this.logoFile) formData.append('logo', this.logoFile);

    this.authService.registerRh(formData).subscribe({
      next: (res) => {
        console.log('✅ Inscription réussie :', res);
        this.router.navigate(['/authentication/login']);
      },
      error: (err) => {
        console.error('❌ Erreur inscription :', err);
      },
    });
  }
}
