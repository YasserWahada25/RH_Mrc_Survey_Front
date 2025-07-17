import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { MatFormFieldModule }from '@angular/material/form-field';
import { MatSelectModule }   from '@angular/material/select';
import { MatCardModule }     from '@angular/material/card';
import { MatDialog }         from '@angular/material/dialog';
import { QuestionColumnDialogComponent } from '../question-column-dialog/question-column-dialog.component';

import {
  NgApexchartsModule,
  ChartComponent,
  ApexChart,
  ApexLegend,
  ApexDataLabels
} from 'ng-apexcharts';
import { forkJoin }          from 'rxjs';
import { map, switchMap }    from 'rxjs/operators';

import { FormulaireService, Formulaire }                       from 'src/app/services/formulaire.service';
import { ResponseService, ResponseListDTO, ResponseDetailDTO } from 'src/app/services/response.service';
import { SectionService, Section }                             from 'src/app/services/section.service';
import { QuestionService, Question }                           from 'src/app/services/question.service';

export type ChartOptions = {
  series: number[];
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-doughnut-pie',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCardModule,
    NgApexchartsModule
  ],
  templateUrl: './doughnut-pie.component.html',
  styleUrls: ['./doughnut-pie.component.scss']
})
export class RapportDoughnutPieComponent  implements OnInit {
  forms: Formulaire[] = [];
  selectedFormId?: string;
  responses: ResponseDetailDTO[] = [];
  questionsList: Question[] = [];

  overallChartOptions?: ChartOptions;
  sectionChartOptions?: ChartOptions;
  questionChartOptions?: ChartOptions;

  constructor(
    private formulaireSvc: FormulaireService,
    private respSvc:       ResponseService,
    private sectionSvc:    SectionService,
    private qSvc:          QuestionService,
    private dialog:        MatDialog
  ) {}

  ngOnInit(): void {
    this.formulaireSvc.getAll().subscribe(forms => this.forms = forms);
  }

  onFormChange(): void {
    if (!this.selectedFormId) return;

    this.respSvc.getAllResponses().subscribe((list: ResponseListDTO[]) => {
      const filtered = list.filter(r => r.formulaire._id === this.selectedFormId);
      if (!filtered.length) {
        this.overallChartOptions =
        this.sectionChartOptions =
        this.questionChartOptions = undefined;
        return;
      }

      const detailCalls = filtered.map(r =>
        this.respSvc.getResponse(this.selectedFormId!, r._id)
      );
      forkJoin(detailCalls).subscribe(resps => {
        this.responses = resps;
        this.computeOverallChart();
        this.computeSectionChart();
        this.computeQuestionChart();
      });
    });
  }

  private computeOverallChart(): void {
    const count = this.responses.length;
    const totalObt = this.responses.reduce((s,r) => s + r.score, 0);
    const maxParResp = this.responses[0].totalScore;
    const totalMax = maxParResp * count;

    this.overallChartOptions = {
      series: [ totalObt, totalMax - totalObt ],
      labels: ['Obtenu','Restant'],
      chart:  { type: 'pie', height: 350 },
      legend: { position: 'bottom' },
      dataLabels: { enabled: false }
    };
  }

  private computeSectionChart(): void {
    this.sectionSvc.findByFormulaire(this.selectedFormId!).pipe(
      switchMap((secs: Section[]) =>
        forkJoin(
          secs.map(sec =>
            this.qSvc.findBySection(sec._id!).pipe(
              map(qs => ({ sec, qs }))
            )
          )
        )
      )
    ).subscribe(secsWithQs => {
      const labels: string[] = [];
      const obtSeries: number[] = [];
      const count = this.responses.length;

      secsWithQs.forEach(({ sec, qs }) => {
        labels.push(sec.titre);
        let obt = 0;
        const maxSec = qs.reduce((sum,q) => sum + this.calcScores(q,null).possible, 0);

        this.responses.forEach(resp =>
          resp.answers
            .filter(a => a.sectionId === sec._id)
            .forEach(a => {
              const q = qs.find(x => x._id === a.questionId);
              if (q) obt += this.calcScores(q,a.answer).actual;
            })
        );

        obtSeries.push(obt);
      });

      this.sectionChartOptions = {
        series: obtSeries,
        labels,
        chart: { type: 'pie', height: 350 },
        legend: { position: 'bottom' },
        dataLabels: { enabled: false }
      };
    });
  }

  private computeQuestionChart(): void {
    this.sectionSvc.findByFormulaire(this.selectedFormId!).pipe(
      switchMap((secs: Section[]) =>
        forkJoin(
          secs.map(sec =>
            this.qSvc.findBySection(sec._id!).pipe(
              map(qs => ({ sec, qs }))
            )
          )
        )
      )
    ).subscribe(secsWithQs => {
      const allQs = secsWithQs.flatMap(sq => sq.qs);
      this.questionsList = allQs;
      const labels = allQs.map(q => q.texte);
      const obtSeries: number[] = [];
      const count = this.responses.length;

      allQs.forEach(q => {
        let obt = 0;
        this.responses.forEach(resp => {
          const ans = resp.answers.find(a => a.questionId===q._id);
          if (ans) obt += this.calcScores(q,ans.answer).actual;
        });
        obtSeries.push(obt);
      });

      this.questionChartOptions = {
        series: obtSeries,
        labels,
        chart: {
          type: 'pie',
          height: 350,
          events: {
            dataPointSelection: (_e,_chart,config) => {
              const idx = config.dataPointIndex;
              const question = this.questionsList[idx];
              this.dialog.open(QuestionColumnDialogComponent, {
                width: '600px',
                data: { question, responses: this.responses }
              });
            }
          }
        },
        legend: { position: 'bottom' },
        dataLabels: { enabled: false }
      };
    });
  }

  private calcScores(q: Question, answer: any): { actual: number; possible: number } {
    let actual = 0, possible = 0;
    switch(q.inputType) {
      case 'texte':
        possible = 0; break;
      case 'liste':
      case 'bouton_radio':
        possible = Math.max(...q.options.map(o=>o.score));
        if (typeof answer==='string') {
          const f = q.options.find(o=>o.label===answer);
          actual = f? f.score: 0;
        }
        break;
      case 'case_a_cocher':
        possible = q.options.reduce((s,o)=>s+o.score,0);
        if (Array.isArray(answer)) {
          actual = q.options
            .filter(o=>answer.includes(o.label))
            .reduce((s,o)=>s+o.score,0);
        }
        break;
      case 'evaluation':
        possible = q.options.length * 5;
        if (Array.isArray(answer)) {
          actual = answer.reduce((s,v)=>s+(typeof v==='number'?v:0),0);
        }
        break;
    }
    return { actual, possible };
  }
}
