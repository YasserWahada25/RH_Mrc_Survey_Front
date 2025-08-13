import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { UserService, PresenceUser, PresenceResponse } from '../../../services/user.service';

@Component({
  selector: 'app-presence-sidebar',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  templateUrl: './presence-sidebar.component.html',
  styleUrls: ['./presence-sidebar.component.scss']
})
export class PresenceSidebarComponent implements OnInit, OnDestroy {
  loading = true;
  error: string | null = null;

  online: PresenceUser[] = [];
  offline: PresenceUser[] = [];

  private timer: any;

  constructor(private users: UserService) {}

  ngOnInit(): void {
    this.fetchPresence();
    // refresh every 30s like chat lists
    this.timer = setInterval(() => this.fetchPresence(true), 30000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  fetchPresence(silent = false) {
    if (!silent) { this.loading = true; this.error = null; }
    this.users.getPresence().subscribe({
      next: (res: PresenceResponse) => {
        this.online  = [...(res.online  || [])];
        this.offline = [...(res.offline || [])];
        if (!silent) this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || 'Erreur chargement présence';
        if (!silent) this.loading = false;
      }
    });
  }

  avatar(u: PresenceUser) {
    return this.users.absolute(u.photo) || '/assets/images/profile/user.png';
  }

  hint(u: PresenceUser) {
    return u.status === 'en_ligne' ? 'En ligne' : (u.lastActiveAgo || 'Hors ligne');
  }

  trackById(_: number, u: PresenceUser) { return u._id; }
}
