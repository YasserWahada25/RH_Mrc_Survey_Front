import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatTableModule }    from '@angular/material/table';
import { MatTooltipModule }  from '@angular/material/tooltip';

import { FormulaireService, Formulaire } from 'src/app/services/formulaire.service';
import { FormulaireWizardComponent }     from '../formulaire-wizard/formulaire-wizard.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-formulaire-list',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatTooltipModule,
    TranslateModule
  ],
  templateUrl: './formulairelist.component.html',
  styleUrls: ['./formulairelist.component.css']
})
export class FormulaireListComponent implements OnInit {
  forms: Formulaire[] = [];
  displayedColumns = ['num', 'titre', 'date', 'actions'];

  constructor(
    private dialog: MatDialog,
    private formSvc: FormulaireService
  ) {}

  ngOnInit(): void {
    this.loadForms();
  }

  /** Charge la liste des formulaires */
  private loadForms(): void {
    this.formSvc.getAll().subscribe(data => {
      this.forms = data;
    });
  }

  /** Ouvre le wizard de création et recharge la liste au retour */
  openWizard(): void {
    const ref = this.dialog.open(FormulaireWizardComponent, {
      width: '800px',
      data: { formulaireId: null }
    });
    ref.afterClosed().subscribe(() => this.loadForms());
  }

  /** Placeholders pour les actions */
  edit(form: Formulaire): void      { console.log('Edit', form); }
  duplicate(form: Formulaire): void { console.log('Duplicate', form); }
  view(form: Formulaire): void      { console.log('View', form); }
  delete(form: Formulaire): void    { console.log('Delete', form); }
}
