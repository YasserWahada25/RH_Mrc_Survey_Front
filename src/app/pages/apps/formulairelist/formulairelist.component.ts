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

import {
  FormulaireService,
  Formulaire,
} from 'src/app/services/formulaire.service';
import { FormulaireWizardComponent } from '../formulaire-wizard/formulaire-wizard.component';

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
    MatCardModule
  ],
  templateUrl: './formulairelist.component.html',
  styleUrls: ['./formulairelist.component.css'],
})
export class FormulaireListComponent implements OnInit, AfterViewInit {
  forms: Formulaire[] = [];
  displayedColumns = ['num', 'titre', 'date', 'actions'];
  dataSource = new MatTableDataSource<Formulaire>([]);
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private dialog: MatDialog, private formSvc: FormulaireService) {}

  ngOnInit(): void {
    this.loadForms();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  private loadForms(): void {
    this.formSvc.getAll().subscribe((data) => {
      this.forms = data;
      this.dataSource.data = data;
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  openWizard(): void {
    const ref = this.dialog.open(FormulaireWizardComponent, {
      width: '800px',
      data: { formulaireId: null },
    });
    ref.afterClosed().subscribe(() => this.loadForms());
  }

  edit(form: Formulaire): void {
    console.log('Edit', form);
  }
  
  duplicate(form: Formulaire): void {
    console.log('Duplicate', form);
  }
  
  view(form: Formulaire): void {
    console.log('View', form);
  }
  
  delete(form: Formulaire): void {
    console.log('Delete', form);
  }
}