import { Component, OnInit }                   from '@angular/core';
import { CommonModule }                        from '@angular/common';
import { ActivatedRoute }                      from '@angular/router';
import { MatCardModule }                       from '@angular/material/card';
import { MatDividerModule }                    from '@angular/material/divider';
import { MatRadioModule }                      from '@angular/material/radio';
import { MatIconModule }                       from '@angular/material/icon';
import { AssessmentService }                   from 'src/app/services/assessment.service';

interface Answer { taskId: string; selected: any; }

@Component({
  selector: 'app-assessment-response-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatRadioModule,
    MatIconModule
  ],
  templateUrl: './assessment-response-detail.component.html',
  styleUrls: ['./assessment-response-detail.component.css']
})
export class AssessmentResponseDetailComponent implements OnInit {
  assessment!: any;
  responses: { phase: string; answers: Answer[] }[] = [];
  userInfo = { firstName: '', lastName: '', email: '' };

  constructor(
    private route: ActivatedRoute,
    private svc:   AssessmentService
  ) {}

  ngOnInit() {
    const aid = this.route.snapshot.paramMap.get('assessmentId')!;
    const uid = this.route.snapshot.paramMap.get('userId')!;

    // 1) charger assessment (nom + dates + tâches/options)
    this.svc.getById(aid).subscribe(a => this.assessment = a);

    // 2) charger les réponses (phase avant + après)
    this.svc.findResponses(aid, uid)
      .subscribe(list => {
        this.responses = list;
        // préremplir userInfo si phase 'avant'
        const avant = list.find(r => r.phase === 'avant');
        if (avant) {
          // on a déjà les infos nom/prenom/email dans avant?
          // si pas dans payload, appelle getUserInfo au besoin
          // sinon :
          this.userInfo = {
            firstName: avant['firstName'],
            lastName:  avant['lastName'],
            email:     avant['email']
          };
        }
      });
  }

  isSelected(resp: { answers: Answer[] }, taskId: string, score: any) {
    const a = resp.answers.find(x => x.taskId === taskId);
    return a ? a.selected === score : false;
  }

  getPhaseResponse(phase: 'avant'|'apres') {
    return this.responses.find(r => r.phase === phase);
  }
}
