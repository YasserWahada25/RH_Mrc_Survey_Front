import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-credit-request-dialog',
  templateUrl: './credit-request-dialog.component.html',
  styleUrls: ['./credit-request-dialog.component.css'],
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ]
})
export class CreditRequestDialogComponent {
  requestCredits: number = 1;

  constructor(
    public dialogRef: MatDialogRef<CreditRequestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.requestCredits < 1) {
      alert('Veuillez saisir un nombre valide de crédits');
      return;
    }
    this.dialogRef.close(this.requestCredits);
  }
}
