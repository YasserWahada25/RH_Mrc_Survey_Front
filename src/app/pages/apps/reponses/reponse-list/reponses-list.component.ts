// src/app/pages/apps/reponses/reponse-list/reponses-list.component.ts

import { Component }       from '@angular/core';
import { CommonModule }    from '@angular/common';
import { MatCardModule }   from '@angular/material/card';
import { MatTableModule }  from '@angular/material/table';
import { MatIconModule }   from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TablerIconsModule } from 'angular-tabler-icons';
import { ResponseItem }    from 'src/app/models/response.model';

@Component({
  selector: 'app-reponses-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    TablerIconsModule
  ],
  templateUrl: './reponses-list.component.html',
})
export class AppReponsesListComponent {
  displayedColumns: string[] = ['date', 'user', 'title', 'action'];

  dataSource: ResponseItem[] = [
    { date: '2025-07-10', user: 'Alice', title: 'Formulaire A' },
    { date: '2025-07-11', user: 'Bob',   title: 'Formulaire B' },
    { date: '2025-07-12', user: 'Carla', title: 'Formulaire C' },
    { date: '2025-07-13', user: 'David', title: 'Formulaire D' },
    { date: '2025-07-14', user: 'Emma',  title: 'Formulaire E' },
  ];
}
