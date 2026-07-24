export type Category =
  | 'alimentos'
  | 'carnes'
  | 'frutas'
  | 'verduras'
  | 'padaria'
  | 'fast-food'
  | 'bebidas'
  | 'utensílios'
  | 'mercado'
  | 'expressões'
  | 'falsas amigas';

export type VocabItem = {
  pt: string;
  es: string[];
  cat: Category | string;
  dif: 1 | 2 | 3 | number;
  example?: string;
};

export type DeckCard = VocabItem & {
  retry?: boolean;
  immediateRetry?: boolean;
};

export type Feedback = 'ok' | 'err' | null;

export type SrsEntry = {
  correct: number;
  errors: number;
  lastSeen: number;
  interval: number;
};

export type SrsDb = Record<string, SrsEntry>;

export type ChefData = {
  consolidated: number;
  achievements: string[];
};

export type RankingEntry = {
  name: string;
  pts: number;
  streak: number;
  date: string;
};

export type GameSession = {
  deck: DeckCard[];
  idx: number;
  lives: number;
  score: number;
  streak: number;
  bestStreak: number;
  totalErrors: number;
  origLen: number;
  selectedCats: string[];
  sessionConsolidated: number;
  sessionErrors: Record<string, number>;
  fb: Feedback;
  wrongIn: string;
  gameOver: boolean;
  gameWon: boolean;
};

export type Screen = 'splash' | 'game' | 'end';
