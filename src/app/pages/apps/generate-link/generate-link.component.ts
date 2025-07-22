import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizLinkService } from 'src/app/services/quiz-link.service';
import { MaterialModule } from 'src/app/material.module';
@Component({
  selector: 'app-generate-link',
  standalone: true,
  templateUrl: './generate-link.component.html',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ]
})
export class GenerateLinkComponent {
  form: FormGroup;
  loading = false;
  response: any;

  constructor(
    private fb: FormBuilder,
    private quizLinkService: QuizLinkService
  ) {
    this.form = this.fb.group({
      emails: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    const emails = this.form.value.emails
      .split('\n')
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0);

    this.loading = true;
    this.quizLinkService.generateLinks(emails).subscribe({
      next: (res) => {
        this.response = res;
        this.loading = false;
        this.form.reset();
      },
      error: (err) => {
        alert(err.error?.message || 'Erreur lors de la génération');
        this.loading = false;
      },
    });
  }
}
