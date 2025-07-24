import { Component, OnInit, ViewChild }           from '@angular/core';
import { CommonModule }                           from '@angular/common';
import { MatTableDataSource, MatTableModule }     from '@angular/material/table';
import { MatIconModule }                          from '@angular/material/icon';
import { MatButtonModule }                        from '@angular/material/button';
import { MatCardModule }                          from '@angular/material/card';
import { MatPaginatorModule, MatPaginator }       from '@angular/material/paginator';
import { MatTooltipModule }                       from '@angular/material/tooltip';
import { RouterModule }                           from '@angular/router';

import { AssessmentService }                      from 'src/app/services/assessment.service';

@Component({
  selector: 'app-assessment-responses-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,           // ← nécessaire pour routerLink
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
export class AssessmentResponsesListComponent implements OnInit {
  displayedColumns: string[] = [
    'email',
    'assessmentName',
    'type',
    'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private svc: AssessmentService) {}

  ngOnInit() {
    this.svc.getGroupedResponses().subscribe(data => {
      this.dataSource.data      = data;
      this.dataSource.paginator = this.paginator;
    });
  }
}
