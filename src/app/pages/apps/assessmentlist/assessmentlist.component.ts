import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule }                           from '@angular/common';
import { FormsModule }                            from '@angular/forms';
import { MatDialog, MatDialogModule }             from '@angular/material/dialog';
import { MatFormFieldModule }                     from '@angular/material/form-field';
import { MatInputModule }                         from '@angular/material/input';
import { MatButtonModule }                        from '@angular/material/button';
import { MatIconModule }                          from '@angular/material/icon';
import { MatTableDataSource, MatTableModule }     from '@angular/material/table';
import { MatPaginator, MatPaginatorModule }       from '@angular/material/paginator';
import { MatTooltipModule }                       from '@angular/material/tooltip';
import { MatCardModule }                          from '@angular/material/card';
import { RouterModule }                           from '@angular/router';

import { AssessmentWizardDialogComponent }        from '../assessment-wizard-dialog/assessment-wizard-dialog.component';
import { AssessmentService }                      from 'src/app/services/assessment.service';

type AssessmentRow = {
  _id: string;
  name: string;
  type: 'normal' | 'avant_apres';
  company?: string;
  trainerName?: string;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
};

@Component({
  selector: 'app-assessmentlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatCardModule,
    RouterModule // ← nécessaire pour routerLink
  ],
  templateUrl: './assessmentlist.component.html',
})
export class AssessmentListComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['name', 'company', 'trainerName', 'type', 'dates', 'action'];
  dataSource = new MatTableDataSource<AssessmentRow>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit() {
    // Filtre custom : on filtre sur name + type + company + trainerName
    this.dataSource.filterPredicate = (row: AssessmentRow, filter: string) => {
      const f = filter.trim().toLowerCase();
      const typeLabel = row.type === 'normal' ? 'normal' : 'avant apres';
      return [
        row.name || '',
        typeLabel,
        row.company || '',
        row.trainerName || ''
      ].some(v => v.toLowerCase().includes(f));
    };

    this.loadAssessments();
  }

  ngAfterViewInit(): void {
    // Attacher le paginator une fois la vue montée (évite les cas timing)
    this.dataSource.paginator = this.paginator;
  }

  loadAssessments() {
    this.assessmentService.findAll().subscribe(list => {
      this.dataSource.data = list as AssessmentRow[];
      // si le paginator est déjà prêt, on le ré-associe
      if (this.paginator) this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(filter: string) {
    this.dataSource.filter = filter.trim().toLowerCase();
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  openWizard() {
    const ref = this.dialog.open(AssessmentWizardDialogComponent, { width: '600px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        // HttpClient sérialisera les Date -> ISO automatiquement
        this.assessmentService.create(result).subscribe(() => this.loadAssessments());
      }
    });
  }

  delete(a: AssessmentRow) {
    if (!confirm(`Supprimer "${a.name}" ?`)) return;
    this.assessmentService.delete(a._id).subscribe(() => this.loadAssessments());
  }
}
