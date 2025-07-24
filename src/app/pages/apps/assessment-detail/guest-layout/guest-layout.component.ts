import { Component }      from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';

@Component({
  selector: 'app-guest-layout',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  template: `
    <div class="guest-container">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .guest-container {
      padding: 0;
      margin: 0;
      width: 100%;
      min-height: 100vh;
      background: #f5f5f5;
    }
  `]
})
export class GuestLayoutComponent {}
