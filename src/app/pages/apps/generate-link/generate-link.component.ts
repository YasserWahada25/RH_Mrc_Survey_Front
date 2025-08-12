import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { QuizLinkService, RecipientPayload } from 'src/app/services/quiz-link.service';

@Component({
  selector: 'app-generate-link',
  standalone: true,
  templateUrl: './generate-link.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  styleUrls: ['./generate-link.component.css'],


}) 
export class GenerateLinkComponent {
  form: FormGroup;
  loading = false;
  response: any;

  get recipientsFA() { return this.form.get('recipients') as FormArray; }

  constructor(private fb: FormBuilder, private quizLinkService: QuizLinkService) {
    this.form = this.fb.group({
      recipients: this.fb.array([this.buildRecipientGroup()])
    });
  }

buildRecipientGroup(): FormGroup {
  return this.fb.group({
    nom: [''],
    prenom: [''],
    email: ['', [Validators.required, Validators.email]],
    societe: [''],
    age: [null, [Validators.min(10), Validators.max(100)]],
    message: [`Bonjour

Voici votre lien pour accéder au questionnaire afin d'obtenir votre évaluation. 
Je vous invite à répondre spontanément aux questions dans un moment calme, et à ne pas y consacrer plus de 15–20 minutes.

Je vous remercie et vous souhaite une agréable journée !

L'équipe MRC`]
  });
}


  addRecipient() {
    this.recipientsFA.push(this.buildRecipientGroup());
  }

  removeRecipient(i: number) {
    if (this.recipientsFA.length > 1) this.recipientsFA.removeAt(i);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const recipients: RecipientPayload[] = this.recipientsFA.value;
    this.loading = true;

    this.quizLinkService.generateLinks(recipients).subscribe({
      next: (res) => {
        this.response = res;
        this.loading = false;
        this.form.reset();
        this.form.setControl('recipients', this.fb.array([this.buildRecipientGroup()]));
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors de la génération');
        this.loading = false;
      }
    });
  }
}
