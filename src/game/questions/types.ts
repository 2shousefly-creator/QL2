export type QuestionItem = {
  id: string;
  question: string;
  answers: [string, string, string, string];
  correctAnswerIndex: number; // 0, 1, 2, or 3
  category?: string;
};
