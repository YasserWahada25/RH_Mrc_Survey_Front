import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from 'src/app/services/user.service';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add',
  standalone: true,
  templateUrl: './add.component.html',
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    TranslateModule
  ]
})
export class AppAddEmployeeComponent implements OnInit {
  local_data = {
    nom: '',
    email: '',
    mot_de_passe: '',
    type: 'employe'
  };

  /** pattern email (utilisé par le template) */
  emailPattern: string = '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[A-Za-z]{2,}$';

  isResponsable = false;
  selectedFile: File | null = null;
  preview: string | null = null;

  /** Interrupteur pour désactiver tous les snackbars sans supprimer le code */
  private useSnackbars = false;

  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<AppAddEmployeeComponent>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.isResponsable = user?.type === 'responsable';

    if (this.isResponsable) {
      this.local_data.type = 'employe';
    }
  }

  /** Helper: n’affiche le snackbar que si useSnackbars = true */
  private notify(message: string, duration = 3000) {
    if (!this.useSnackbars) return;
    this.snackBar.open(message, 'Fermer', { duration });
  }

  onFileChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const MAX = 800 * 1024;
    if (file.size > MAX) {
      // ❌ popup uniquement
      Swal.fire({
        icon: 'error',
        title: 'Image trop volumineuse',
        text: 'La taille maximale est 800KB.'
      });
      // (on garde l’appel snackbar, mais il est neutralisé)
      this.notify('Image trop volumineuse (max 800KB).', 3000);
      return;
    }

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = e => this.preview = (e?.target as any).result;
    reader.readAsDataURL(file);
  }

  createUser(): void {
    const isResponsable = JSON.parse(localStorage.getItem('user') || '{}')?.type === 'responsable';
    const url = isResponsable
      ? 'http://localhost:3033/api/users/responsable/add'
      : 'http://localhost:3033/api/users';

    // Construire FormData si image présente
    const hasFile = !!this.selectedFile;
    let body: any;

    if (hasFile) {
      const fd = new FormData();
      fd.append('nom', this.local_data.nom.trim());
      fd.append('email', this.local_data.email.trim());
      if (this.local_data.mot_de_passe) fd.append('mot_de_passe', this.local_data.mot_de_passe);
      fd.append('type', this.local_data.type);
      fd.append('photo', this.selectedFile as Blob); // nom de champ attendu par backend
      body = fd;
    } else {
      body = {
        nom: this.local_data.nom.trim(),
        email: this.local_data.email.trim(),
        mot_de_passe: this.local_data.mot_de_passe,
        type: this.local_data.type
      };
    }

    // 🔵 Pop-up de chargement
    Swal.fire({
      title: 'Ajout en cours...',
      text: 'Veuillez patienter',
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.userService.createUserCustom(body, url).subscribe({
      next: () => {
        Swal.close();

        // 🟢 Pop-up succès
        Swal.fire({
          icon: 'success',
          title: 'Utilisateur ajouté',
          text: 'L’utilisateur a été créé avec succès.',
          confirmButtonText: 'OK'
        }).then(() => {
          // (on garde l’appel snackbar, mais il est neutralisé)
          this.notify('✅ Utilisateur créé avec succès !', 3000);
          this.dialogRef.close(true);
        });
      },
      error: (err) => {
        Swal.close();

        const status = err?.status;
        const backendMsg =
          err?.error?.message ||
          err?.error?.error ||
          (Array.isArray(err?.error?.errors) ? err.error.errors.join(', ') : '') ||
          err?.message ||
          '';

        const emailExists =
          status === 409 ||
          (/(exist|existe)/i.test(backendMsg) && /(mail|email)/i.test(backendMsg));

        if (emailExists) {
          Swal.fire({
            icon: 'error',
            title: 'Données invalides',
            text: 'Email déjà utilisé'
          });
          this.notify('Données invalides: Email déjà utilisé', 4000);
          return;
        }

        if (status === 400 || status === 422) {
          Swal.fire({
            icon: 'error',
            title: 'Données invalides',
            text: backendMsg || 'Veuillez vérifier les champs saisis.'
          });
          this.notify(`Données invalides: ${backendMsg}`, 5000);
          return;
        }

        if (status === 403) {
          Swal.fire({
            icon: 'error',
            title: 'Accès refusé',
            text: 'Vous n’avez pas les droits pour effectuer cette action.'
          });
          this.notify('Accès refusé. Vérifiez vos droits.', 4000);
          return;
        }

        if (status === 0) {
          Swal.fire({
            icon: 'error',
            title: 'Problème de connexion',
            text: 'Impossible de joindre le serveur. Vérifiez votre réseau.'
          });
          this.notify('Erreur réseau', 4000);
          return;
        }

        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: backendMsg || 'Une erreur est survenue lors de la création.'
        });
        this.notify(`Erreur: ${backendMsg || 'inconnue'}`, 5000);
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
