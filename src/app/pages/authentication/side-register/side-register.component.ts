import { Component } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CoreService } from 'src/app/services/core.service';
import { AuthService } from 'src/app/services/authentification.service';


@Component({
  selector: 'app-side-register',
  standalone: true,
  imports: [RouterModule, MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './side-register.component.html',
  styleUrls: ['./side-register.component.css'] ,


})
export class AppSideRegisterComponent {
  options = this.settings.getOptions();

  form = new FormGroup({
    nomSociete: new FormControl('', [Validators.required]),
    nom: new FormControl('', [Validators.required, Validators.minLength(6)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    tel: new FormControl('', [Validators.required]),
  });

  constructor(
    private settings: CoreService,
    private router: Router,
    private authService: AuthService
  ) {}

  get f() {
    return this.form.controls;
  }

  submit() {
    if (this.form.invalid) return;

    const data = {
      nomSociete: this.form.value.nomSociete,
      nom: this.form.value.nom,
      email: this.form.value.email,
      password: this.form.value.password,
      tel: this.form.value.tel,
    };

    this.authService.registerRh(data).subscribe({
      next: (res: any) => {
        console.log('✅ Inscription réussie :', res);
        this.router.navigate(['/authentication/login']);
      },
      error: (err: any) => {
        console.error('❌ Erreur inscription :', err);
      }
    });
  }
}
