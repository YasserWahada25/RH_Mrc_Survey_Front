import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { CreditRequestService } from '../../../services/credit-request.service';
import { AuthService } from '../../../services/authentification.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CreditRequestDialogComponent } from './credit-request-dialog/credit-request-dialog.component';

@Component({
  selector: 'app-top-cards',
  standalone: true,
  imports: [MaterialModule, MatDialogModule, CreditRequestDialogComponent,  CommonModule ],
  templateUrl: './top-cards.component.html',
  styleUrls: ['./top-cards.component.css']
})
export class AppTopCardsComponent implements OnInit {
  credits: number = 0;
  rhAdminId: string = '';
  isRhAdmin: boolean = false; // 👈 Ajouter cette ligne

  constructor(
    private creditRequestService: CreditRequestService,
    private authService: AuthService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser && currentUser.type === 'rh_admin') {
      this.rhAdminId = currentUser.id;
      this.isRhAdmin = true; // 👈 Marquer que c’est un RH admin
      this.loadCredits();
    } else {
      this.credits = -1;
    }
  }


  loadCredits(): void {
    this.creditRequestService.getCredits(this.rhAdminId).subscribe({
      next: (res) => {
        this.credits = res.nombre_credits;
      },
      error: (err) => {
        console.error('Erreur chargement crédits', err);
      }
    });
  }

  openRequestDialog(): void {
    const dialogRef = this.dialog.open(CreditRequestDialogComponent, {
      width: '500px',  // augmenter ici
      maxWidth: '90vw', // max responsive width
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.submitRequest(result);
      }
    });
  }

submitRequest(requestCredits: number) {
  if (requestCredits < 1) {
    alert('Veuillez saisir un nombre valide de crédits');
    return;
  }

  this.creditRequestService.createRequest(this.rhAdminId, requestCredits).subscribe({
    next: () => {
      alert('Demande envoyée avec succès');
      this.loadCredits(); 
    },
    error: (err) => {
      console.error('Erreur lors de la demande', err);
      alert('Erreur lors de la demande');
    }
  });
}

}
