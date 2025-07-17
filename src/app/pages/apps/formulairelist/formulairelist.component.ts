// src/app/pages/apps/formulairelist/formulairelist.component.ts

import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { FormulaireService, Formulaire } from 'src/app/services/formulaire.service';
import { FormulaireWizardComponent } from '../formulaire-wizard/formulaire-wizard.component';
import { FormulaireEditComponent, EditDialogData } from '../formulaire-edit/formulaire-edit.component';
import { FormulaireViewComponent, ViewDialogData } from '../formulaire-view/formulaire-view.component';

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
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonToggleModule,
    RouterModule,
    TranslateModule
  ],
  templateUrl: './formulairelist.component.html',
  styleUrls: ['./formulairelist.component.css'],
})
export class FormulaireListComponent implements OnInit, AfterViewInit {
  forms: Formulaire[] = [];
  displayedColumns = ['id', 'titre', 'date', 'action'];
  dataSource = new MatTableDataSource<Formulaire>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private dialog: MatDialog,
    private formSvc: FormulaireService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadForms();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  private loadForms(): void {
    this.formSvc.getAll().subscribe(data => {
      this.forms = data;
      this.dataSource.data = data;
    });
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /** Ouvre le wizard pour créer un nouveau formulaire */
  openWizard(): void {
    const ref = this.dialog.open<FormulaireWizardComponent, { formulaireId: string | null }, boolean>(
      FormulaireWizardComponent,
      {
        width: '800px',
        data: { formulaireId: null }
      }
    );
    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadForms();
    });
  }

  /** Ouvre le popup d’édition pour le formulaire sélectionné */
  edit(form: Formulaire): void {
    const ref = this.dialog.open<FormulaireEditComponent, EditDialogData, boolean>(
      FormulaireEditComponent,
      {
        width: '700px',
        maxHeight: '90vh',
        data: { formulaireId: form._id! }
      }
    );
    ref.afterClosed().subscribe(saved => {
      if (saved) this.loadForms();
    });
  }

  /** Duplique un formulaire existant */
  duplicate(form: Formulaire): void {
    this.formSvc.duplicate(form._id!).subscribe({
      next: () => this.loadForms(),
      error: err => console.error('Échec duplication', err)
    });
  }

  /** Affiche la vue détaillée d’un formulaire */
  view(form: Formulaire): void {
    this.dialog.open<FormulaireViewComponent, ViewDialogData>(
      FormulaireViewComponent,
      {
        data: { formulaireId: form._id! }
      }
    );
  }

  /** Supprime un formulaire après confirmation */
  delete(form: Formulaire): void {
    if (!confirm(`Supprimer le formulaire « ${form.titre} » ?`)) return;
    this.formSvc.delete(form._id!).subscribe(() => this.loadForms());
  }
}
