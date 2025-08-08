// src/app/layouts/full/vertical/sidebar/sidebar.component.ts

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/authentification.service';

import { navItems } from './sidebar-data';
import { NavItem } from './nav-item/nav-item';          // <-- type NavItem

// Modules et composants à importer
import { MaterialModule } from 'src/app/material.module';
import { NgScrollbarModule } from 'ngx-scrollbar';
import { AppNavItemComponent } from './nav-item/nav-item.component';
import { BrandingComponent } from './branding.component';
import { TablerIconsModule } from 'angular-tabler-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,        // pour *ngIf, *ngFor
    RouterModule,        // pour routerLink
    MaterialModule,      // Mat-nav-list, Mat-icon-button, etc.
    NgScrollbarModule,   // pour <ng-scrollbar>
    AppNavItemComponent, // pour <app-nav-item>
    BrandingComponent,   // pour <app-branding>
    TablerIconsModule    // pour <i-tabler>
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @Input() showToggle = true;
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();

  public menuItems: NavItem[] = [];
  public societeLogo: string | null = null; // ✅ Ajouté pour logo dynamique


  constructor(
    public auth: AuthService,  // public pour l’utiliser dans le template
    private router: Router

  ) { }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    const role = user?.type ?? null;

    this.menuItems = navItems.filter(item => {
      if (!item.roles?.length) {
        return true;
      }
      return role !== null && item.roles.includes(role);
    });
        if (user?.societe_logo) {
      this.societeLogo = `http://localhost:3033${user.societe_logo}`;
    }
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/authentication/login']);
  }
}
