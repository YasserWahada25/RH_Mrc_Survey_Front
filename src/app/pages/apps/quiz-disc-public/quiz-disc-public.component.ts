import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { QuizDiscPublicService } from 'src/app/services/quiz-disc-public.service';
import { QuizService } from 'src/app/services/quiz.service';
import { Lot } from 'src/app/models/quiz.model';
import { QuizResultDialogComponent } from '../quiz-disque/quiz-result-dialog/quiz-result-dialog.component';

@Component({
  selector: 'app-quiz-disc-public',
  styleUrls: ['./quiz-disc-public.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatRadioModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule
  ],
  templateUrl: './quiz-disc-public.component.html',
})
export class QuizDiscPublicComponent implements OnInit {
  token: string = '';
  beneficiaireEmail: string = '';
  lots: Lot[] = [];
  answers: { plusIndex: number | null; minusIndex: number | null }[] = [];
  isInvalidLink: boolean = false;
  errorMessage: string = '';
  quizSubmitted: boolean = false;

  /** lot affiché actuellement (0-based) */
  currentLotIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private quizService: QuizService,
    private publicService: QuizDiscPublicService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    this.publicService.getBeneficiaireEmail(this.token).subscribe({
      next: (data: any) => {
        if (data?.status === 'used') {
          this.isInvalidLink = true;
          this.errorMessage = data.message || 'Ce lien a déjà été utilisé ou est invalide.';
          return;
        }

        this.beneficiaireEmail = data.email;
        this.quizService.getAllLots().subscribe({
          next: (lots) => {
            this.lots = lots;
            // un objet {plusIndex, minusIndex} par lot
            this.answers = lots.map(() => ({ plusIndex: null, minusIndex: null }));
            // on démarre au lot 0
            this.currentLotIndex = 0;
          }
        });
      },
      error: () => {
        this.isInvalidLink = true;
        this.errorMessage = 'Ce lien a déjà été utilisé ou est invalide.';
      }
    });
  }

  /** sélection d’un + (garantit qu’un même item ne soit pas + et - à la fois) */
  setPlus(lotIndex: number, questionIndex: number) {
    const current = this.answers[lotIndex];
    if (current.minusIndex === questionIndex) current.minusIndex = null;
    current.plusIndex = questionIndex;
  }

  /** sélection d’un - (garantit qu’un même item ne soit pas + et - à la fois) */
  setMinus(lotIndex: number, questionIndex: number) {
    const current = this.answers[lotIndex];
    if (current.plusIndex === questionIndex) current.plusIndex = null;
    current.minusIndex = questionIndex;
  }

  /** true si le lot a bien un + et un - sélectionnés */
  lotCompleted = (lotIndex: number) => {
    const a = this.answers?.[lotIndex];
    return !!a && a.plusIndex !== null && a.minusIndex !== null;
  };

  /** true si tous les lots sont complets (utilisé pour activer le bouton "Soumettre") */
  allLotsCompleted = () =>
    this.answers?.length > 0 && this.answers.every(a => a.plusIndex !== null && a.minusIndex !== null);

  /** aller directement à un lot (clic sur la barre d’avancement) */
  goToLot(i: number) {
    if (i >= 0 && i < this.lots.length) {
      this.currentLotIndex = i;
    }
  }

  /** passer au lot suivant (autorisé seulement si le lot courant est complet) */
  nextLot() {
    if (this.lotCompleted(this.currentLotIndex) && this.currentLotIndex < this.lots.length - 1) {
      this.currentLotIndex++;
    }
  }

  /** revenir au lot précédent */
  prevLot() {
    if (this.currentLotIndex > 0) this.currentLotIndex--;
  }

  // ----- calculs & affichage des résultats (inchangé) -----

  calculateScorePercentages(result: any) {
    const totalPlus = [1, 2, 3, 4].reduce((sum, i) => sum + (result.plus[i] || 0), 0);
    const totalMinus = [1, 2, 3, 4].reduce((sum, i) => sum + (result.minus[i] || 0), 0);

    const scorePercentagesPlus: { [key: number]: number } = {};
    const scorePercentagesMinus: { [key: number]: number } = {};
    const dataPlus: number[] = [];
    const dataMinus: number[] = [];

    for (let i = 1; i <= 4; i++) {
      const plus = totalPlus ? Math.round(((result.plus[i] ?? 0) * 100) / totalPlus) : 0;
      const minus = totalMinus ? Math.round(((result.minus[i] ?? 0) * 100) / totalMinus) : 0;

      scorePercentagesPlus[i] = plus;
      scorePercentagesMinus[i] = minus;

      dataPlus.push(plus);
      dataMinus.push(minus);
    }

    const labels = ['D', 'I', 'S', 'C'];
    const dataDiff = dataPlus.map((val, i) => val - dataMinus[i]);

    const columnChartOptionsPlus = this.createChartOptions('Scores +', dataPlus, labels);
    const columnChartOptionsMinus = this.createChartOptions('Scores -', dataMinus, labels);
    const columnChartOptionsDiff = this.createChartOptions('Écart + / -', dataDiff, labels, true);

    return {
      columnChartOptionsPlus,
      columnChartOptionsMinus,
      columnChartOptionsDiff,
      scorePercentagesPlus,
      scorePercentagesMinus,
    };
  }

  createChartOptions(title: string, data: number[], labels: string[], isDiff = false) {
    const colors = isDiff
      ? data.map((val) => (val >= 0 ? '#4CAF50' : '#F44336'))
      : ['#FF4C4C', '#FFD700', '#4CAF50', '#2196F3'];

    return {
      series: [
        {
          name: title,
          data: data.map((val, idx) => ({
            x: labels[idx],
            y: val,
            fillColor: colors[idx % colors.length],
          })),
        },
      ],
      chart: { type: 'bar', height: 300 },
      xaxis: { categories: labels },
      yaxis: { min: isDiff ? -100 : 0, max: 100, title: { text: 'Pourcentage (%)' } },
      tooltip: { enabled: true },
      dataLabels: { enabled: true },
      plotOptions: { bar: { columnWidth: '50%', distributed: true } },
      colors,
    };
  }

  submitQuiz() {
    const formattedAnswers = this.answers.map((ans, i) => ({
      lotId: this.lots[i].id,
      plusIndex: ans.plusIndex ?? -1,
      minusIndex: ans.minusIndex ?? -1,
    }));

    this.publicService.submitQuiz(this.token, formattedAnswers, this.beneficiaireEmail).subscribe({
      next: (res: any) => {
        if (!res || !res.plus || !res.minus) {
          alert('Erreur : Résultat vide ou invalide');
          return;
        }

        const stats = this.calculateScorePercentages(res);
        this.quizSubmitted = true;

        this.dialog.open(QuizResultDialogComponent, {
          width: '80%',
          data: {
            result: { ...res, email: this.beneficiaireEmail },
            columnChartOptionsPlus: stats.columnChartOptionsPlus,
            columnChartOptionsMinus: stats.columnChartOptionsMinus,
            columnChartOptionsDiff: stats.columnChartOptionsDiff,
            scorePercentagesPlus: stats.scorePercentagesPlus,
            scorePercentagesMinus: stats.scorePercentagesMinus,
            token: this.token,
          },
        });
      },
      error: () => {
        alert('Erreur lors de la soumission du quiz.');
      },
    });
  }
}


// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { ActivatedRoute } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { MatCardModule } from '@angular/material/card';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatButtonModule } from '@angular/material/button';
// import { MatDialogModule, MatDialog } from '@angular/material/dialog';

// import { QuizDiscPublicService } from 'src/app/services/quiz-disc-public.service';
// import { QuizService } from 'src/app/services/quiz.service';
// import { Lot } from 'src/app/models/quiz.model';
// import { QuizResultDialogComponent } from '../quiz-disque/quiz-result-dialog/quiz-result-dialog.component';

// @Component({
//   selector: 'app-quiz-disc-public',
//   styleUrls: ['./quiz-disc-public.component.css'] ,
//   standalone: true,
//   imports: [
//     CommonModule,
//     FormsModule,
//     MatCardModule,
//     MatRadioModule,
//     MatButtonModule,
//     MatDialogModule
//   ],
//   templateUrl: './quiz-disc-public.component.html',

// })
// export class QuizDiscPublicComponent implements OnInit {
//   token: string = '';
//   beneficiaireEmail: string = '';
//   lots: Lot[] = [];
//   answers: { plusIndex: number | null; minusIndex: number | null }[] = [];
//   isInvalidLink: boolean = false;
//   errorMessage: string = '';
//   quizSubmitted: boolean = false;


//   constructor(
//     private route: ActivatedRoute,
//     private quizService: QuizService,
//     private publicService: QuizDiscPublicService,
//     private dialog: MatDialog
//   ) {}

//   ngOnInit(): void {
//     this.token = this.route.snapshot.paramMap.get('token') || '';

//     this.publicService.getBeneficiaireEmail(this.token).subscribe({
//       next: (data: any) => {
//         if (data?.status === 'used') {
//           this.isInvalidLink = true;
//           this.errorMessage = data.message || 'Ce lien a déjà été utilisé ou est invalide.';
//           return;
//         }

//         this.beneficiaireEmail = data.email;
//         this.quizService.getAllLots().subscribe({
//           next: (lots) => {
//             this.lots = lots;
//             this.answers = lots.map(() => ({ plusIndex: null, minusIndex: null }));
//           }
//         });
//       },
//       error: () => {
//         this.isInvalidLink = true;
//         this.errorMessage = 'Ce lien a déjà été utilisé ou est invalide.';
//       }
//     });
//   }

//   setPlus(lotIndex: number, questionIndex: number) {
//     const current = this.answers[lotIndex];
//     if (current.minusIndex === questionIndex) current.minusIndex = null;
//     current.plusIndex = questionIndex;
//   }

//   setMinus(lotIndex: number, questionIndex: number) {
//     const current = this.answers[lotIndex];
//     if (current.plusIndex === questionIndex) current.plusIndex = null;
//     current.minusIndex = questionIndex;
//   }

//   calculateScorePercentages(result: any) {
//     const totalPlus = [1, 2, 3, 4].reduce((sum, i) => sum + (result.plus[i] || 0), 0);
//     const totalMinus = [1, 2, 3, 4].reduce((sum, i) => sum + (result.minus[i] || 0), 0);

//     const scorePercentagesPlus: { [key: number]: number } = {};
//     const scorePercentagesMinus: { [key: number]: number } = {};
//     const dataPlus: number[] = [];
//     const dataMinus: number[] = [];

//     for (let i = 1; i <= 4; i++) {
//       const plus = totalPlus ? Math.round((result.plus[i] ?? 0) * 100 / totalPlus) : 0;
//       const minus = totalMinus ? Math.round((result.minus[i] ?? 0) * 100 / totalMinus) : 0;

//       scorePercentagesPlus[i] = plus;
//       scorePercentagesMinus[i] = minus;

//       dataPlus.push(plus);
//       dataMinus.push(minus);
//     }

//     const labels = ['D', 'I', 'S', 'C'];
//     const dataDiff = dataPlus.map((val, i) => val - dataMinus[i]);

//     const columnChartOptionsPlus = this.createChartOptions('Scores +', dataPlus, labels);
//     const columnChartOptionsMinus = this.createChartOptions('Scores -', dataMinus, labels);
//     const columnChartOptionsDiff = this.createChartOptions('Écart + / -', dataDiff, labels, true);

//     return {
//       columnChartOptionsPlus,
//       columnChartOptionsMinus,
//       columnChartOptionsDiff,
//       scorePercentagesPlus,
//       scorePercentagesMinus
//     };
//   }

//   createChartOptions(title: string, data: number[], labels: string[], isDiff = false) {
//     const colors = isDiff
//       ? data.map(val => val >= 0 ? '#4CAF50' : '#F44336')
//       : ['#FF4C4C', '#FFD700', '#4CAF50', '#2196F3'];

//     return {
//       series: [{
//         name: title,
//         data: data.map((val, idx) => ({
//           x: labels[idx],
//           y: val,
//           fillColor: colors[idx % colors.length]
//         }))
//       }],
//       chart: {
//         type: 'bar',
//         height: 300
//       },
//       xaxis: {
//         categories: labels
//       },
//       yaxis: {
//         min: isDiff ? -100 : 0,
//         max: 100,
//         title: { text: 'Pourcentage (%)' }
//       },
//       tooltip: { enabled: true },
//       dataLabels: { enabled: true },
//       plotOptions: {
//         bar: {
//           columnWidth: '50%',
//           distributed: true
//         }
//       },
//       colors
//     };
//   }

//   submitQuiz() {
//     const formattedAnswers = this.answers.map((ans, i) => ({
//       lotId: this.lots[i].id,
//       plusIndex: ans.plusIndex ?? -1,
//       minusIndex: ans.minusIndex ?? -1
//     }));

//     this.publicService.submitQuiz(this.token, formattedAnswers, this.beneficiaireEmail).subscribe({
//       next: (res: any) => {
//         if (!res || !res.plus || !res.minus) {
//           alert('Erreur : Résultat vide ou invalide');
//           return;
//         }

//         const stats = this.calculateScorePercentages(res);
//         this.quizSubmitted = true;

//         this.dialog.open(QuizResultDialogComponent, {
//           width: '80%',
//           data: {
//             result: { ...res, email: this.beneficiaireEmail },
//             columnChartOptionsPlus: stats.columnChartOptionsPlus,
//             columnChartOptionsMinus: stats.columnChartOptionsMinus,
//             columnChartOptionsDiff: stats.columnChartOptionsDiff,
//             scorePercentagesPlus: stats.scorePercentagesPlus,
//             scorePercentagesMinus: stats.scorePercentagesMinus,
//             token: this.token
//           }
//         });
//       },
//       error: () => {
//         alert('Erreur lors de la soumission du quiz.');
//       }
//     });
//   }

  
// }
