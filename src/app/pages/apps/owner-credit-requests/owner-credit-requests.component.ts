import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { CreditRequestService, CreditRequest } from 'src/app/services/credit-request.service';
import { QuizCreditService } from 'src/app/services/quiz-credit.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  standalone: true,
  selector: 'app-owner-credit-requests',
  templateUrl: './owner-credit-requests.component.html',
  styleUrls: ['./owner-credit-requests.component.css'],
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ]
})
export class OwnerCreditRequestsComponent implements OnInit {
  displayedColumns: string[] = ['societe', 'rh', 'email', 'credits', 'status', 'date', 'action'];
  dataSource = new MatTableDataSource<CreditRequest & { actionDisabled?: boolean }>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private creditRequestService: CreditRequestService,
    private quizCreditService: QuizCreditService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.creditRequestService.getAllRequestsForOwner().subscribe((data) => {
      this.dataSource.data = data.map(req => ({ ...req, actionDisabled: false }));
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(value: string): void {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  updateStatus(req: any, status: 'approved' | 'rejected'): void {
    req.actionDisabled = true;

    if (status === 'approved') {
      this.quizCreditService.approveAndAffectCredits(req._id).subscribe(() => {
        req.status = 'approved';
        this.snackBar.open('✅ Crédits affectés, quiz envoyés et email transmis !', 'Fermer', {
          duration: 4000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-success']
        });
      });
    } else {
      this.creditRequestService.updateRequestStatus(req._id, 'rejected').subscribe(() => {
        req.status = 'rejected';
        this.snackBar.open('❌ Demande rejetée avec succès.', 'Fermer', {
          duration: 6000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['snackbar-error']
        });
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'text-success';
      case 'rejected':
        return 'text-danger';
      default:
        return 'text-warning';
    }
  }
}
