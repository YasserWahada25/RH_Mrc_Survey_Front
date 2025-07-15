import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  AbstractControl,
} from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'side-reinitiliser-mot-de-passe',
  standalone: true,
  imports: [
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    HttpClientModule,
  ],
  templateUrl: './side-reinitialiser-le-mot-de-passe.html',
})
export class AppSideReinitialiserMotDePasseComponent {
  form!: FormGroup;
  token!: string;
  options: any;

  constructor(
    private settings: CoreService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.options = this.settings.getOptions();
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    this.form = new FormGroup(
      {
        newPassword: new FormControl('', [
          Validators.required,
          Validators.minLength(6),
        ]),
        confirmPassword: new FormControl('', [Validators.required]),
      },
      { validators: this.passwordMatchValidator }
    );
  }

  get f() {
    return this.form.controls;
  }

  passwordMatchValidator(group: AbstractControl): { [key: string]: any } | null {
    const password = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) return;

    const payload = {
      newPassword: this.form.value.newPassword,
    };

    this.http
      .patch(`http://localhost:3033/api/auth/reset-password/${this.token}`, payload)
      .subscribe({
        next: () => {
          alert('✅ Mot de passe réinitialisé avec succès !');
          this.router.navigate(['/authentication/login']);
        },
        error: (err) => {
          console.error('❌ Erreur :', err);
          alert('Erreur lors de la réinitialisation.');
        },
      });
  }
}
