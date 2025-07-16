// src/app/pages/apps/reponses/reponse-list/reponses-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule }       from '@angular/common';
import { MatCardModule }      from '@angular/material/card';
import { MatTableModule }     from '@angular/material/table';
import { MatIconModule }      from '@angular/material/icon';
import { MatButtonModule }    from '@angular/material/button';
import { TablerIconsModule }  from 'angular-tabler-icons';
import { ResponseService }    from 'src/app/services/response.service';

interface ResponseDTO {
  _id: string;
  createdAt: string;
  userId: string;
  formulaire: { titre: string };
}

export interface ResponseItem {
  id: string;
  date: string;
  user: string;
  title: string;
}

@Component({
  selector: 'app-reponses-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    TablerIconsModule,
  ],
  templateUrl: './reponses-list.component.html',
})
export class AppReponsesListComponent implements OnInit {
  displayedColumns: string[] = ['date', 'user', 'title', 'action'];
  dataSource: ResponseItem[] = [];

  constructor(private respSvc: ResponseService) {}

  ngOnInit(): void {
    this.respSvc.getAllResponses().subscribe({
      next: (list: ResponseDTO[]) => {
        this.dataSource = list.map((r: ResponseDTO) => ({
          id:    r._id,
          date:  new Date(r.createdAt).toLocaleDateString('fr-FR', {
                   day:   '2-digit',
                   month: '2-digit',
                   year:  'numeric',
                 }),
          user:  r.userId === 'guest' ? 'Anonyme' : r.userId,
          title: r.formulaire?.titre ?? '—',
        }));
      },
      error: (err) => {
        console.error('Erreur chargement des réponses :', err);
      }
    });
  }
}
