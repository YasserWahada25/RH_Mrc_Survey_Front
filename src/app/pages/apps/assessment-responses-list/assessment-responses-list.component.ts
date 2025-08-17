import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';

import { AssessmentService } from 'src/app/services/assessment.service';

type Row = {
  email: string;
  userId: string;
  assessmentId: string;
  assessmentName: string;
  assessmentType: 'normal' | 'avant_apres';
  phaseCount: number; // 0..2
};

@Component({
  selector: 'app-assessment-responses-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule, // pour routerLink
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatPaginatorModule,
    MatTooltipModule,
  ],
  templateUrl: './assessment-responses-list.component.html',
  styleUrls: ['./assessment-responses-list.component.css'],
})
export class AssessmentResponsesListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['email', 'assessmentName', 'type', 'progress', 'actions'];
  dataSource = new MatTableDataSource<Row>([]);
  loading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private svc: AssessmentService) {}

  ngOnInit() {
    this.loading = true;
    this.svc.getGroupedResponses().subscribe({
      next: (data: any[]) => {
        this.dataSource.data = data as Row[];
        this.loading = false;
        // si le paginator est déjà dispo (rare), on l’attache tout de suite
        if (this.paginator) this.dataSource.paginator = this.paginator;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  ngAfterViewInit(): void {
    // Attache le paginator une fois la vue initialisée
    this.dataSource.paginator = this.paginator;
  }

  // --- Helpers UI ---
  isComplete(row: Row): boolean {
    return row.assessmentType === 'normal'
      ? row.phaseCount >= 1
      : row.phaseCount === 2;
  }

  progressLabel(row: Row): string {
    if (row.assessmentType === 'normal') {
      return row.phaseCount >= 1 ? 'Soumis' : 'Non soumis';
    }
    const frac = `${row.phaseCount}/2`;
    return row.phaseCount === 2 ? `${frac} (Complet)` : frac;
  }

  progressClass(row: Row): string {
    if (row.assessmentType === 'normal') {
      return row.phaseCount >= 1 ? 'badge badge-success' : 'badge badge-warn';
    }
    return row.phaseCount === 2 ? 'badge badge-success' : 'badge badge-info';
  }
}
