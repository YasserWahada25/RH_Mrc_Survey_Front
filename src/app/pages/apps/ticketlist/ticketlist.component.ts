import { Component } from '@angular/core';
import { CommonModule }  from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { MatButtonModule }  from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { AppTicketDialogContentComponent } from './ticket-dialog-content';
import { SectionDialogContentComponent } from './section-dialog-content';

@Component({
  selector: 'app-ticket-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    AppTicketDialogContentComponent,
    SectionDialogContentComponent
  ],
  templateUrl: './ticketlist.component.html',
})
export class AppTicketlistComponent {
  constructor(private dialog: MatDialog) {}

  /** Lance le wizard complet */
  openDialog(): void {
    this.dialog.open(AppTicketDialogContentComponent, {
      width: '500px'
    });
  }
}
