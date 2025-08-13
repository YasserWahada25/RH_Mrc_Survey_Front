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
import { CommonModule } from '@angular/common'; // ⬅️ add this
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

  isResponsable = false;
  selectedFile: File | null = null;
  preview: string | null = null;

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

  onFileChange(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const MAX = 800 * 1024;
    if (file.size > MAX) {
      this.snackBar.open('Image trop volumineuse (max 800KB).', 'Fermer', { duration: 3000 });
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
      fd.append('nom', this.local_data.nom);
      fd.append('email', this.local_data.email);
      if (this.local_data.mot_de_passe) fd.append('mot_de_passe', this.local_data.mot_de_passe);
      fd.append('type', this.local_data.type);
      fd.append('photo', this.selectedFile as Blob); // <— nom de champ attendu par backend
      body = fd;
    } else {
      body = {
        nom: this.local_data.nom,
        email: this.local_data.email,
        mot_de_passe: this.local_data.mot_de_passe,
        type: this.local_data.type
      };
    }

    this.userService.createUserCustom(body, url).subscribe({
      next: () => {
        this.snackBar.open('✅ Utilisateur créé avec succès !', 'Fermer', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        const msg = err?.error?.message || err.message || 'Erreur inconnue';
        if (err.status === 403) {
          this.snackBar.open('🚫 Accès refusé. Vérifiez vos droits.', 'Fermer', { duration: 4000 });
        } else {
          this.snackBar.open(`❌ Erreur: ${msg}`, 'Fermer', { duration: 5000 });
        }
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
