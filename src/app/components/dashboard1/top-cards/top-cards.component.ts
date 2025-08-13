import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { CreditRequestService } from '../../../services/credit-request.service';
import { AuthService } from '../../../services/authentification.service';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { CreditRequestDialogComponent } from './credit-request-dialog/credit-request-dialog.component';
import { UserService } from '../../../services/user.service'; // ⬅️ AJOUT

@Component({
  selector: 'app-top-cards',
  standalone: true,
  imports: [MaterialModule, MatDialogModule, CreditRequestDialogComponent, CommonModule],
  templateUrl: './top-cards.component.html',
  styleUrls: ['./top-cards.component.css']
})
export class AppTopCardsComponent implements OnInit {
  credits: number = 0;
  rhAdminId: string = '';
  isRhAdmin: boolean = false;

  // ⬅️ AJOUT : compteur utilisateurs
  usersCount: number | null = null;

  constructor(
    private creditRequestService: CreditRequestService,
    private authService: AuthService,
    private dialog: MatDialog,
    private userService: UserService          // ⬅️ AJOUT
  ) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();

    // --- Quiz credits ---
    if (currentUser && currentUser.type === 'rh_admin') {
      this.rhAdminId = currentUser.id;
      this.isRhAdmin = true;
      this.loadCredits();
    } else {
      this.credits = -1; // +∞
    }

    // --- Users count ---
    if (currentUser?.type === 'rh_admin' || currentUser?.type === 'owner') {
      this.loadUsersCountAll();          // GET /api/users
    } else if (currentUser?.type === 'responsable' || currentUser?.type === 'employe') {
      this.loadUsersCountAccessible();   // GET /api/users/accessible
    } else {
      this.usersCount = null;
    }
  }

  // ===== Quiz credits =====
  loadCredits(): void {
    this.creditRequestService.getCredits(this.rhAdminId).subscribe({
      next: (res) => { this.credits = res.nombre_credits; },
      error: (err) => { console.error('Erreur chargement crédits', err); }
    });
  }

  openRequestDialog(): void {
    const dialogRef = this.dialog.open(CreditRequestDialogComponent, {
      width: '500px',
      maxWidth: '90vw',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) this.submitRequest(result);
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

  // ===== Users count =====
  private loadUsersCountAll(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => this.usersCount = users.length,
      error: (err) => {
        console.error('Erreur chargement utilisateurs (all)', err);
        this.usersCount = null;
      }
    });
  }

  private loadUsersCountAccessible(): void {
    this.userService.getAccessibleUsers().subscribe({
      next: (users) => this.usersCount = users.length,
      error: (err) => {
        console.error('Erreur chargement utilisateurs (accessible)', err);
        this.usersCount = null;
      }
    });
  }
}
