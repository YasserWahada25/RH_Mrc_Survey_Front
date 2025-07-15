import { Component } from '@angular/core';
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

@Component({
  selector: 'app-add',
  standalone: true,
  templateUrl: './add.component.html',
  imports: [
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
export class AppAddEmployeeComponent {
  local_data = {
    nom: '',
    email: '',
    mot_de_passe: '',
    type: 'employe'
  };

  constructor(
    private userService: UserService,
    private dialogRef: MatDialogRef<AppAddEmployeeComponent>,
    private snackBar: MatSnackBar
  ) {}

  createUser(): void {
    const payload = {
      nom: this.local_data.nom,
      email: this.local_data.email,
      mot_de_passe: this.local_data.mot_de_passe,
      type: this.local_data.type
    };

    console.log('➡️ Données envoyées :', payload);

    this.userService.createUser(payload).subscribe({
      next: (res) => {
        this.snackBar.open('✅ Utilisateur créé avec succès !', 'Fermer', {
          duration: 3000
        });
        this.dialogRef.close(true);
      },
      error: (err) => {
        console.error('❌ Erreur API:', err);
        const msg = err?.error?.message || err.message || 'Erreur inconnue';
        this.snackBar.open(`❌ Erreur: ${msg}`, 'Fermer', {
          duration: 5000
        });
      }
    });
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }
}
