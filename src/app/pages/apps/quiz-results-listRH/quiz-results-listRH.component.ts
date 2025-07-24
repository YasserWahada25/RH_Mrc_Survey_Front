// src/app/pages/apps/quiz-results-listRH/quiz-results-listRH.component.ts
import { AfterViewInit, Component, ViewChild, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule }                        from '@angular/common';
import { MatPaginator, MatPaginatorModule }    from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule }  from '@angular/material/table';
import { MatCardModule }                       from '@angular/material/card';
import { MatFormFieldModule }                  from '@angular/material/form-field';
import { MatInputModule }                      from '@angular/material/input';
import { MatIconModule }                       from '@angular/material/icon';
import { MatButtonModule }                     from '@angular/material/button';

import { TablerIconsModule }                   from 'angular-tabler-icons';

import { QuizResultsService } from '../../../services/quiz-results.service';
import { QuizResult          } from '../../../models/quiz-result.model';

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
    TablerIconsModule    // pour <i-tabler>
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './quiz-results-listRH.component.html',
  styleUrls: ['./quiz-results-listRH.component.scss'] 

})
export class QuizResultsListRHComponent implements AfterViewInit {
  displayedColumns = [
    'beneficiaryEmail',
    'dateTaken',
    'action'

  ];
  dataSource = new MatTableDataSource<QuizResult>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private quizService: QuizResultsService) {}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.loadData();
  }

  loadData() {
    this.quizService.getResults()
      .subscribe((results: QuizResult[]) => {
        this.dataSource.data = results;
      });
  }

  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  /** Ouvre le PDF en aperçu */
  viewReport(token: string) {
    window.open(`/reports/${token}.pdf`, '_blank');
  }

  /** Force le téléchargement du PDF */
  downloadReport(token: string) {
    const link = document.createElement('a');
    link.href = `/reports/${token}.pdf`;
    link.download = `quiz-disc-${token}.pdf`;
    link.click();
  }
}
