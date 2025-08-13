import { AfterViewInit, Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule }                        from '@angular/common';
import { MatPaginator, MatPaginatorModule }    from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule }  from '@angular/material/table';
import { MatCardModule }                       from '@angular/material/card';
import { MatFormFieldModule }                  from '@angular/material/form-field';
import { MatInputModule }                      from '@angular/material/input';
import { MatIconModule }                       from '@angular/material/icon';
import { MatButtonModule }                     from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule }      from '@angular/material/snack-bar'; // ⬅️ NEW
import { TablerIconsModule }                   from 'angular-tabler-icons';

import { QuizResultsService } from '../../../services/quiz-results.service';
import { QuizResult } from '../../../models/quiz-result.model';

@Component({
  selector: 'app-quiz-results-listRH',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSnackBarModule,     // ⬅️ NEW
    TablerIconsModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './quiz-results-listRH.component.html',
  styleUrls: ['./quiz-results-listRH.component.scss']
})
export class QuizResultsListRHComponent implements AfterViewInit {
  displayedColumns = ['prenom', 'nom', 'societe', 'beneficiaryEmail', 'dateTaken', 'action'];

  dataSource = new MatTableDataSource<QuizResult>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private quizService: QuizResultsService,
    private snack: MatSnackBar, // ⬅️ NEW
  ) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.loadData();
  }

  loadData() {
    this.quizService.getResults().subscribe((results: QuizResult[]) => {
      this.dataSource.data = results;
    });
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  viewReport(token: string) {
    this.quizService.previewReport(token).subscribe({
      next: (resp) => {
        const blob = new Blob([resp.body!], { type: 'application/pdf' });
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL, '_blank', 'noopener');
        setTimeout(() => URL.revokeObjectURL(fileURL), 60_000);
      },
      error: (err) => {
        console.error('Preview error', err);
        this.snack.open('Impossible d’afficher le PDF.', 'OK', { duration: 3000 });
      }
    });
  }

  downloadReport(token: string) {
    this.quizService.downloadReport(token).subscribe({
      next: (resp) => {
        const blob = new Blob([resp.body!], { type: 'application/pdf' });
        const cd = resp.headers.get('Content-Disposition') || '';
        const match = /filename="?([^"]+)"?/.exec(cd);
        const filename = match?.[1] || `quiz-disc-${token}.pdf`;

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      },
      error: (err) => {
        console.error('Download error', err);
        this.snack.open('Téléchargement impossible.', 'OK', { duration: 3000 });
      }
    });
  }

  /** ⬇️ NEW: envoi au bénéficiaire */
  sendToBeneficiary(row: QuizResult) {
    this.quizService.sendReportToBeneficiary(row.reportToken, row.beneficiaryEmail).subscribe({
      next: () => this.snack.open('Rapport envoyé au bénéficiaire 🎉', 'OK', { duration: 3000 }),
      error: (err) => {
        console.error('Send error', err);
        this.snack.open('Échec de l’envoi du rapport.', 'OK', { duration: 3000 });
      }
    });
  }
}
