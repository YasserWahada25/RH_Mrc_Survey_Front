export interface Question {
  text: string;
  plusScore: number;
  minusScore: number;
}

export interface Lot {
  id: number;
  title: string;
  questions: Question[];
}
