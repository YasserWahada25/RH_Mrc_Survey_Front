// src/app/pages/apps/assessment-detail/assessment-detail.component.ts

import { Component, OnInit }          from '@angular/core';
import { CommonModule }               from '@angular/common';
import { FormsModule }                from '@angular/forms';
import { MatCardModule }              from '@angular/material/card';
import { MatRadioModule }             from '@angular/material/radio';
import { MatButtonModule }            from '@angular/material/button';
import { MatDividerModule }           from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ActivatedRoute }             from '@angular/router';

import { AssessmentService }          from 'src/app/services/assessment.service';
import { UserSelectDialogComponent }  from './selectuser/user-select-dialog.component';

@Component({
  selector: 'app-assessment-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatRadioModule,
    MatButtonModule,
    MatDividerModule,
    MatDialogModule,
    UserSelectDialogComponent
  ],
  templateUrl: './assessment-detail.component.html',
  styleUrls: ['./assessment-detail.component.css']
})
export class AssessmentDetailComponent implements OnInit {
  assessment: any;
  answers: Record<string, any> = {};

  constructor(
    private route: ActivatedRoute,
    private svc:   AssessmentService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.getById(id).subscribe(a => {
      this.assessment = a;
      this.initAnswers();
    });
  }

  initAnswers() {
    this.assessment.tasks.forEach((t: any) => {
      this.answers[t._id] = null;
    });
  }

  onSubmit() {
    const ref = this.dialog.open(UserSelectDialogComponent, {
      width: '400px'
    });
    ref.afterClosed().subscribe(userId => {
      if (!userId) return;
      // Exemple d'appel pour envoi par email :
      // this.svc.sendByEmail(this.assessment._id, userId, this.answers).subscribe();
    });
  }
}
