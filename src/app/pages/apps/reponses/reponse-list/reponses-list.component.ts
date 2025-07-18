// src/app/pages/apps/reponses/reponse-list/reponses-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { MatCardModule }     from '@angular/material/card';
import { MatTableModule }    from '@angular/material/table';
import { MatIconModule }     from '@angular/material/icon';
import { MatButtonModule }   from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { forkJoin } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { ResponseService }    from 'src/app/services/response.service';
import { FormulaireService }  from 'src/app/services/formulaire.service';
import { SectionService }     from 'src/app/services/section.service';
import { QuestionService }    from 'src/app/services/question.service';

interface ResponseDTO {
  _id: string;
  createdAt: string;
  userId: string;
  formulaire: { _id: string; titre: string };
}

export interface ResponseItem {
  id: string;
  formId: string;
  date: string;
  user: string;
  title: string;
}

@Component({
  selector: 'app-reponses-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    TablerIconsModule,
  ],
  templateUrl: './reponses-list.component.html',
})
export class AppReponsesListComponent implements OnInit {
  displayedColumns = ['date','user','title','action'];
  dataSource: ResponseItem[] = [];

  constructor(
    private respSvc: ResponseService,
    private formSvc: FormulaireService,
    private secSvc: SectionService,
    private qSvc: QuestionService
  ) {}

  ngOnInit(): void {
    this.respSvc.getAllResponses().subscribe(
      (list: ResponseDTO[]) => {
        this.dataSource = list.map(r => ({
          id:     r._id,
          formId: r.formulaire._id,
          date:   new Date(r.createdAt).toLocaleDateString('fr-FR', {
                    day:'2-digit', month:'2-digit', year:'numeric'
                  }),
          user:   r.userId==='guest'? 'Anonyme': r.userId,
          title:  r.formulaire.titre
        }));
      },
      err => console.error('Erreur chargement des réponses :', err)
    );
  }

  downloadPdf(formId: string, responseId: string): void {
    this.respSvc.getResponse(formId, responseId).pipe(
      mergeMap(resp =>
        this.formSvc.getById(formId).pipe(map(form => ({ resp, form })))
      ),
      mergeMap(({ resp, form }) =>
        this.secSvc.findByFormulaire(formId).pipe(
          mergeMap(secs =>
            forkJoin(
              secs.map(sec =>
                this.qSvc.findBySection(sec._id!).pipe(
                  map(qs => ({ sec, questions: qs }))
                )
              )
            ).pipe(map(secsWithQs => ({ resp, form, secsWithQs })))
          )
        )
      )
    ).subscribe(({ resp, form, secsWithQs }) =>
      this.generatePdf(form.titre, secsWithQs, resp.answers, resp.createdAt)
    );
  }

  private generatePdf(
    titreForm: string,
    secsWithQs: Array<{ sec: any; questions: any[] }>,
    answers: Array<{ sectionId: string; questionId: string; answer: any }>,
    submittedAt: string
  ): void {
    const doc = new jsPDF({ unit:'pt', format:'a4' });
    const margin = 40;
    let y = margin;

    // Titre du formulaire
    doc.setFontSize(18);
    doc.setFont('helvetica','bold');
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(titreForm, pageWidth/2, y, { align:'center' });
    y += 30;

    // Parcours des sections
    secsWithQs.forEach(({ sec, questions }) => {
      // Titre de section
      doc.setFontSize(14);
      doc.setFont('helvetica','bold');
      doc.text(sec.titre, margin, y);
      y += 20;

      questions.forEach(q => {
        if (q.inputType === 'evaluation') {
          // En-tête question
          autoTable(doc, {
            startY: y,
            head: [[
              { content: q.texte, colSpan: 2,
                styles: { halign:'center', fillColor:[230,230,230], fontStyle:'bold' }
              }
            ]],
            body: [],
            theme: 'plain',
            margin: { left: margin, right: margin }
          });
          y = (doc as any).lastAutoTable.finalY + 8;

          // Tableau Propositions / Note
          const rows = q.options.map((opt:any, idx:number) => {
            const ans = answers.find(a => a.questionId === q._id.toString());
            const val = ans && Array.isArray(ans.answer) ? ans.answer[idx] : '';
            return [opt.label, String(val)];
          });
          autoTable(doc, {
            startY: y,
            head: [[
              'Proposition',
              { content: 'Note', styles: { halign: 'right' } }
            ]],
            body: rows,
            styles:     { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor:[240,240,240], textColor:30, fontStyle:'bold' },
            columnStyles: {
              0: { halign: 'left' },
              1: { halign: 'right' }
            },
            margin: { left: margin, right: margin }
          });
          y = (doc as any).lastAutoTable.finalY + 15;
        } else {
          // Question classique
          const ans = answers.find(a => a.questionId === q._id.toString());
          const rep = ans
            ? Array.isArray(ans.answer) ? ans.answer.join(', ') : String(ans.answer)
            : '';
          autoTable(doc, {
            startY: y,
            head: [[
              'Question',
              { content: 'Réponse', styles: { halign: 'right' } }
            ]],
            body: [[q.texte, rep]],
            styles:     { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor:[240,240,240], textColor:30, fontStyle:'bold' },
            columnStyles: {
              0: { halign: 'left' },
              1: { halign: 'right' }
            },
            margin: { left: margin, right: margin }
          });
          y = (doc as any).lastAutoTable.finalY + 15;
        }

        if (y > doc.internal.pageSize.getHeight() - 100) {
          doc.addPage();
          y = margin;
        }
      });
    });

    // Date de soumission à droite
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica','italic');
    doc.text('Date de soumission ', pageWidth - margin, y, { align:'right' });
    const dateStr = new Date(submittedAt).toLocaleString('fr-FR', {
      day:'2-digit', month:'2-digit', year:'numeric'
    });
    doc.text(dateStr, pageWidth - margin, y + 20, { align:'right' });

    doc.save(`${titreForm}.pdf`);
  }
}
