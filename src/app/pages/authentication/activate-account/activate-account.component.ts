import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule],
  templateUrl: './activate-account.component.html',
  styleUrls: ['./activate-account.component.css']
})

export class ActivateAccountComponent implements OnInit {
  isSuccess = false;
  isError = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    public router: Router // <<< ici : public au lieu de private
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token');
    if (token) {
      this.http.get(`http://localhost:3033/api/auth/activate/${token}`).subscribe({
        next: (res: any) => {
          this.isSuccess = true;
          this.message = res.message;
        },
        error: (err) => {
          this.isError = true;
          this.message = err.error.message || 'Erreur d’activation.';
        }
      });
    }
  }
}
