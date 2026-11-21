export type Direction = "zh2ja" | "ja2zh";

export type OptionSet = {
  options: string[];
  correct: number;
  drop: number[];
};

export interface Word {
  id: number;
  form: string;
  zhForm: string;
  reading: string;
  pinyin: string;
  ja: string;
  zh: string;
  relation: "true" | "false" | "partial";
  kind?: "falseFriend";
  category: string;
  example: string;
  facts: string[];
  by?: string;
  trap?: boolean;
}

export type RoundContent = OptionSet & {
  word: Word;
  zh: OptionSet;
};

export type InitResponse = {
  type: "init";
  postId: string;
  count: number;
  username: string;
};

export type IncrementResponse = {
  type: "increment";
  postId: string;
  count: number;
};

export type DecrementResponse = {
  type: "decrement";
  postId: string;
  count: number;
};

export type DailyResponse = {
  type: "daily";
  puzzleNumber: number;
  seed: string;
  username: string;
  streak: number;
  alreadyPlayed: boolean;
  cards: RoundContent[];
  stats: Record<string, { [choice: string]: number }>;
};

export type ScoreRequest = {
  puzzleNumber: number;
  score: number;
  answers: { cardIdx: number; choiceIdx: number; correct: boolean }[];
  direction: Direction;
};

export type ScoreResponse = {
  type: "score";
  score: number;
  streak: number;
  flair?: string;
};

export type ShareRequest = {
  puzzleNumber: number;
  score: number;
  maxScore: number;
  streak: number;
  emoji: string;
};

export type ShareResponse = {
  type: "share";
  commentId: string;
};

export type ErrorResponse = {
  status: "error";
  message: string;
};