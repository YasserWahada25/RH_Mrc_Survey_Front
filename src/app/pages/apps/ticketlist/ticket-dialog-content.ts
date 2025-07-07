import { Component, Inject, Optional } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule
} from '@angular/material/dialog';
import { CommonModule }        from '@angular/common';
import { FormsModule }         from '@angular/forms';
import { MatFormFieldModule }  from '@angular/material/form-field';
import { MatInputModule }      from '@angular/material/input';
import { MatButtonModule }     from '@angular/material/button';

import { FormulaireService }   from 'src/app/services/formulaire.service';
import { SectionDialogContentComponent } from './section-dialog-content';

export interface FormulaireData {
  titre: string;
  description: string;
}

@Component({
  selector: 'app-ticket-dialog-content',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    SectionDialogContentComponent
  ],
  templateUrl: './ticket-dialog-content.html',
})
export class AppTicketDialogContentComponent {
  local_data: FormulaireData = { titre: '', description: '' };

  constructor(
    private dialogRef: MatDialogRef<AppTicketDialogContentComponent>,
    private dialog: MatDialog,
    private formSvc: FormulaireService,
    @Optional() @Inject(MAT_DIALOG_DATA) data?: FormulaireData
  ) {
    if (data) this.local_data = data;
  }

  /** Crée le formulaire puis passe à l’étape Section+Questions */
  doAction(): void {
    if (!this.local_data.titre || !this.local_data.description) return;
    this.formSvc.create({
      titre: this.local_data.titre,
      description: this.local_data.description,
      type: 'quiz 360'
    }).subscribe(form => {
      this.dialogRef.close();
      this.dialog.open(SectionDialogContentComponent, {
        width: '650px',
        data: { formulaireId: form._id }
      });
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
