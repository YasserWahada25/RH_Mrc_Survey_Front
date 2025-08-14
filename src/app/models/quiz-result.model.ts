export interface QuizResult {
  beneficiaryEmail: string;
  dateTaken: string;          
  score: Record<string, number>;
  reportToken: string;
}
