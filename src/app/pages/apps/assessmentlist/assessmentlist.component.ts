import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { FormsModule }                       from '@angular/forms';
import { MatDialog, MatDialogModule }        from '@angular/material/dialog';
import { MatFormFieldModule }                from '@angular/material/form-field';
import { MatInputModule }                    from '@angular/material/input';
import { MatButtonModule }                   from '@angular/material/button';
import { MatIconModule }                     from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule }  from '@angular/material/paginator';
import { MatTooltipModule }                  from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { RouterModule }  from '@angular/router';

import { AssessmentWizardDialogComponent } from '../assessment-wizard-dialog/assessment-wizard-dialog.component';
import { AssessmentService }               from 'src/app/services/assessment.service';

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
    RouterModule
  ],
  templateUrl: './assessmentlist.component.html',
})
export class AssessmentListComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private assessmentService: AssessmentService
  ) {}

  ngOnInit() {
    this.loadAssessments();
  }

  loadAssessments() {
    this.assessmentService.findAll().subscribe(list => {
      this.dataSource.data      = list;
      this.dataSource.paginator = this.paginator;
    });
  }

  applyFilter(filter: string) {
    this.dataSource.filter = filter.trim().toLowerCase();
  }

  openWizard() {
    const ref = this.dialog.open(AssessmentWizardDialogComponent, {
      width: '600px'
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.assessmentService.create(result)
          .subscribe(() => this.loadAssessments());
      }
    });
  }
delete(a: any) {
    if (!confirm(`Supprimer "${a.name}" ?`)) return;   // confirmation
    this.assessmentService.delete(a._id)
      .subscribe({
        next: () => {
          this.loadAssessments();                      // recharge la liste
          // (optionnel) this.snack.open('Supprimé !', 'Fermer', { duration: 2000 });
        },
        error: err => console.error('Erreur delete', err)
      });
  }

  edit(a: any) {
    // à implémenter si besoin
  }
}
