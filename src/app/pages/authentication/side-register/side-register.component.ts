import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CoreService } from 'src/app/services/core.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from 'src/app/services/authentification.service';
import Swal from 'sweetalert2';

// ✅ Validator: password & confirm must match
export const passwordMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const password = group.get('password')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
};

// ✅ Regex email (un peu plus strict que Validators.email)
const EMAIL_PATTERN =
  // autorise name+tag@domaine.tld, sans espaces, basique mais robuste
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;

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

  // 👁️ Toggle show/hide
  hidePassword = true;
  hideConfirm = true;

  logoFile: File | null = null;
  selectedLogoName: string | null = null;
  logoPreviewUrl: string | null = null;
  logoError: string | null = null;

  // ✅ trackers des règles du mot de passe
  hasUppercase = false;
  hasSpecialChar = false;
  hasMinLength = false;

  form = new FormGroup(
    {
      nomSociete: new FormControl<string>('', [Validators.required]),
      nom: new FormControl<string>('', [Validators.required, Validators.minLength(6)]),
      email: new FormControl<string>('', [
        Validators.required,
        Validators.email,
        Validators.pattern(EMAIL_PATTERN),
      ]),
      // ✅ Secure password
      password: new FormControl<string>('', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/),
      ]),
      confirmPassword: new FormControl<string>('', [Validators.required]),
      tel: new FormControl<string>('', [Validators.required]),
    },
    { validators: passwordMatchValidator }
  );

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService
  ) {}

  get f() {
    return this.form.controls;
  }

  // ✅ Message d’erreur lisible pour l’email
  getEmailErrorMessage(): string {
    const emailCtrl = this.form.get('email');
    if (!emailCtrl) return '';
    if (emailCtrl.hasError('required')) return 'Email requis.';
    if (emailCtrl.hasError('email') || emailCtrl.hasError('pattern')) return 'Format d’email invalide.';
    return '';
    // (si tu utilises ngx-translate, tu peux remplacer par des clés i18n)
  }

  // ✅ Vérifier les règles en live
  onPasswordInput(event: any): void {
    const value = event.target.value || '';
    this.hasUppercase = /[A-Z]/.test(value);
    this.hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    this.hasMinLength = value.length >= 8;
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
      reader.onload = (e: any) => (this.logoPreviewUrl = e.target.result);
      reader.readAsDataURL(file);
    }
  }

  submit() {
    if (this.form.invalid || this.logoError) {
      // ✅ Alert si le formulaire n’est pas valide
      Swal.fire({
        icon: 'warning',
        title: 'Formulaire incomplet',
        text: 'Merci de corriger les erreurs avant de continuer.',
      });
      return;
    }

    const formData = new FormData();
    formData.append('nomSociete', this.form.value.nomSociete || '');
    formData.append('nom', this.form.value.nom || '');
    formData.append('email', (this.form.value.email || '').trim());
    formData.append('password', this.form.value.password || '');
    formData.append('tel', (this.form.value.tel || '').trim());
    if (this.logoFile) formData.append('logo', this.logoFile);

    this.authService.registerRh(formData).subscribe({
      next: (res) => {
        console.log('✅ Inscription réussie :', res);

        // ✅ Pop-up succès : demander de vérifier l’email
        Swal.fire({
          icon: 'success',
          title: 'Inscription réussie',
          text: 'Veuillez vérifier votre email pour activer votre compte.',
          confirmButtonText: 'OK'
        }).then(() => {
          this.router.navigate(['/authentication/login']);
        });
      },
      error: (err) => {
        console.error('❌ Erreur inscription :', err);

        // ✅ Gestion fine des erreurs backend
        const status = err?.status;
        const backendMsg =
          err?.error?.message ||
          err?.error?.error ||
          (Array.isArray(err?.error?.errors) ? err.error.errors.join(', ') : '') ||
          '';

        // Heuristiques : email déjà utilisé
        const looksLikeEmailExists =
          status === 409 ||
          /exist/i.test(backendMsg) && /mail/i.test(backendMsg);

        if (looksLikeEmailExists) {
          Swal.fire({
            icon: 'error',
            title: 'Email déjà utilisé',
            text: 'Cet email est déjà associé à un compte.',
          });
          return;
        }

        // Erreurs de validation
        if (status === 400 || status === 422) {
          Swal.fire({
            icon: 'error',
            title: 'Données invalides',
            text: backendMsg || 'Veuillez vérifier les champs saisis.',
          });
          return;
        }

        // Erreurs réseau
        if (status === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Problème de connexion',
            text: 'Impossible de joindre le serveur. Vérifiez votre réseau.',
          });
          return;
        }

        // Erreur générique
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: backendMsg || 'Une erreur est survenue lors de l’inscription.',
        });
      },
    });
  }
}
