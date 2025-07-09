import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { QuizService } from 'src/app/services/quiz.service';
import { Lot } from 'src/app/models/quiz.model';

@Component({
  selector: 'app-checkbox',
  standalone: true,
  templateUrl: './checkbox.component.html',
  imports: [
    CommonModule,
    FormsModule,
    MatCheckboxModule,
    MatButtonModule,
    MatCardModule,
    MatRadioModule
  ]
})
export class AppCheckboxComponent implements OnInit {
  lots: Lot[] = [];
  answers: { plusIndex: number | null; minusIndex: number | null }[] = [];

  constructor(private quizService: QuizService) {}

  ngOnInit(): void {
    this.quizService.getAllLots().subscribe({
      next: (data: Lot[]) => {
        this.lots = data;
        this.answers = this.lots.map(() => ({
          plusIndex: null,
          minusIndex: null
        }));
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des lots :', err);
      }
    });
  }

  setPlus(lotIndex: number, questionIndex: number) {
    this.answers[lotIndex].plusIndex = questionIndex;
  }

  setMinus(lotIndex: number, questionIndex: number) {
    this.answers[lotIndex].minusIndex = questionIndex;
  }

  submitQuiz() {
    const formattedAnswers = this.lots.map((lot, i) => ({
      lotId: lot.id,
      plusIndex: this.answers[i].plusIndex ?? -1,
      minusIndex: this.answers[i].minusIndex ?? -1
    }));

    this.quizService.submitAnswers(formattedAnswers).subscribe({
      next: (res) => {
        alert('Réponses soumises avec succès');
        console.log(res);
      },
      error: (err) => {
        console.error('Erreur lors de la soumission :', err);
        alert('Erreur lors de la soumission du quiz');
      }
    });
  }
}
