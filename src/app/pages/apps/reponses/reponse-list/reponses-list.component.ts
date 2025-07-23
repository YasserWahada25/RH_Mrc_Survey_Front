// src/app/pages/apps/reponses/reponse-list/reponses-list.component.ts

import { Component, OnInit }   from '@angular/core';
import { CommonModule }         from '@angular/common';
import { RouterModule }         from '@angular/router';
import { MatCardModule }        from '@angular/material/card';
import { MatTableModule }       from '@angular/material/table';
import { MatIconModule }        from '@angular/material/icon';
import { MatButtonModule }      from '@angular/material/button';
import { MatMenuModule }        from '@angular/material/menu';
import { TablerIconsModule }    from 'angular-tabler-icons';

import * as ExcelJS            from 'exceljs';
import { saveAs }              from 'file-saver';
import autoTable               from 'jspdf-autotable';
import jsPDF                   from 'jspdf';

import { forkJoin }            from 'rxjs';
import { mergeMap, map }       from 'rxjs/operators';

import { ResponseService }     from 'src/app/services/response.service';
import { FormulaireService }   from 'src/app/services/formulaire.service';
import { SectionService }      from 'src/app/services/section.service';
import { QuestionService }     from 'src/app/services/question.service';

interface ResponseDTO {
  _id: string;
  createdAt: string;
  userId: string;
  formulaire: { _id: string; titre: string } | null;
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
    MatMenuModule,
    TablerIconsModule,
  ],
  templateUrl: './reponses-list.component.html',
})
export class AppReponsesListComponent implements OnInit {
  displayedColumns = ['date', 'user', 'title', 'action'];
  dataSource: ResponseItem[] = [];

  constructor(
    private respSvc: ResponseService,
    private formSvc: FormulaireService,
    private secSvc: SectionService,
    private qSvc: QuestionService
  ) {}

  ngOnInit(): void {
    this.respSvc.getAllResponses().subscribe((list: ResponseDTO[]) => {
      this.dataSource = list.map(r => {
        const form = r.formulaire;
        return {
          id:     r._id,
          formId: form?._id ?? '',
          date:   new Date(r.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }),
          user:   r.userId === 'guest' ? 'Anonyme' : r.userId,
          title:  form?.titre ?? '— formulaire supprimé —'
        };
      });
    });
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
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    let y = margin;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Titre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(titreForm, pageWidth / 2, y, { align: 'center' });
    y += 30;

    // Sections & questions...
    secsWithQs.forEach(({ sec, questions }) => {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(sec.titre, margin, y);
      y += 20;

      questions.forEach(q => {
        if (q.inputType === 'evaluation') {
          autoTable(doc, {
            startY: y,
            head: [[
              { content: q.texte, colSpan: 2,
                styles: { halign: 'center', fillColor: [230,230,230], fontStyle: 'bold' }
              }
            ]],
            body: [],
            theme: 'plain',
            margin: { left: margin, right: margin }
          });
          // @ts-ignore
          y = (doc as any).lastAutoTable.finalY + 8;

          const rows = q.options.map((opt: any, idx: number) => {
            const ans = answers.find(a => a.questionId === q._id.toString());
            const val = ans && Array.isArray(ans.answer) ? ans.answer[idx] : '';
            return [opt.label, String(val)];
          });
          autoTable(doc, {
            startY: y,
            head: [['Proposition', { content: 'Note', styles: { halign: 'right' } }]],
            body: rows,
            styles:     { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [240,240,240], textColor: 30, fontStyle: 'bold' },
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'right' } },
            margin: { left: margin, right: margin }
          });
          // @ts-ignore
          y = (doc as any).lastAutoTable.finalY + 15;

        } else {
          const ans = answers.find(a => a.questionId === q._id.toString());
          const rep = ans
            ? Array.isArray(ans.answer) ? ans.answer.join(', ') : String(ans.answer)
            : '';
          autoTable(doc, {
            startY: y,
            head: [['Question', { content: 'Réponse', styles: { halign: 'right' } }]],
            body: [[q.texte, rep]],
            styles:     { fontSize: 10, cellPadding: 4 },
            headStyles: { fillColor: [240,240,240], textColor: 30, fontStyle: 'bold' },
            columnStyles: { 0: { halign: 'left' }, 1: { halign: 'right' } },
            margin: { left: margin, right: margin }
          });
          // @ts-ignore
          y = (doc as any).lastAutoTable.finalY + 15;
        }

        if (y > doc.internal.pageSize.getHeight() - 100) {
          doc.addPage();
          y = margin;
        }
      });
    });

    // Date de soumission
    y += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Date de soumission', pageWidth - margin, y, { align: 'right' });
    const dateStr = new Date(submittedAt).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
    doc.text(dateStr, pageWidth - margin, y + 20, { align: 'right' });

    doc.save(`${titreForm}.pdf`);
  }

  exportExcel(formId: string, responseId: string): void {
    this.respSvc.getResponse(formId, responseId).pipe(
      mergeMap(resp =>
        forkJoin({
          form: this.formSvc.getById(formId),
          secs: this.secSvc.findByFormulaire(formId),
        }).pipe(map(o => ({ resp, ...o })))
      ),
      mergeMap(({ resp, form, secs }) =>
        forkJoin(
          secs.map(sec =>
            this.qSvc.findBySection(sec._id!).pipe(
              map(questions => ({ sec, questions }))
            )
          )
        ).pipe(map(secsWithQs => ({ resp, form, secsWithQs })))
      )
    ).subscribe(({ resp, form, secsWithQs }) => {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet('Réponses');
      ws.columns = [
        { header: 'Section',  key: 'sec',      width: 30 },
        { header: 'Question', key: 'question', width: 50 },
        { header: 'Réponse',  key: 'reponse',  width: 20 }
      ];
      ws.getRow(1).eachCell((cell: ExcelJS.Cell) => {
        cell.fill      = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
        cell.font      = { color: { argb: 'FFFFFFFF' }, bold: true };
        cell.alignment = { horizontal: 'center' };
      });

      let rowIndex = 2;
      secsWithQs.forEach(({ sec, questions }) => {
        const secRow = ws.getRow(rowIndex++);
        secRow.getCell(1).value = sec.titre;
        secRow.getCell(1).font  = { color: { argb: 'FF008000' }, bold: true };

        questions.forEach(q => {
          if (q.inputType === 'evaluation') {
            const qh = ws.getRow(rowIndex++);
            qh.getCell(2).value = q.texte;
            qh.getCell(2).fill  = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE1DFDF' } };
            qh.getCell(2).font  = { bold: true };
            qh.getCell(2).alignment = { horizontal: 'center' };

            q.options.forEach((opt: any, idx: number) => {
              const ans = resp.answers.find(a => a.questionId === q._id.toString());
              const val = ans && Array.isArray(ans.answer) ? ans.answer[idx] : '';
              const orow = ws.getRow(rowIndex++);
              orow.getCell(2).value = opt.label;
              orow.getCell(2).font  = { color: { argb: 'FFFF0000' } };
              orow.getCell(3).value = val;
              orow.getCell(3).alignment = { horizontal: 'right' };
            });

          } else {
            const ans = resp.answers.find(a => a.questionId === q._id.toString());
            const val = ans
              ? Array.isArray(ans.answer) ? ans.answer.join(', ') : ans.answer
              : '';
            const crow = ws.getRow(rowIndex++);
            crow.getCell(2).value = q.texte;
            crow.getCell(3).value = val;
            crow.getCell(3).alignment = { horizontal: 'right' };
          }
        });

        rowIndex++;
      });

      const labelRow = ws.getRow(rowIndex++);
      labelRow.getCell(1).value = 'Date de soumission';
      labelRow.getCell(1).font  = { color: { argb: 'FF008000' }, italic: true };

      const valueRow = ws.getRow(rowIndex++);
      valueRow.getCell(3).value = new Date(resp.createdAt)
        .toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      valueRow.getCell(3).font  = { color: { argb: 'FF008000' }, italic: true };
      valueRow.getCell(3).alignment = { horizontal: 'right' };

      wb.xlsx.writeBuffer().then((buffer: ArrayBuffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${form.titre}.xlsx`);
      });
    });
  }
}
