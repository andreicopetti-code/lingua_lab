import itemsJson from '../data/items.json';
import type { DeckCard, GameSession, VocabItem } from '../types';
import { MAX_LIVES } from '../theme';
import { isAnswerCorrect, shuffle } from './normalize';
import { srsCorrect, srsError, srsPrioritize } from './srs';
import { loadSRS } from './storage';

export const ITEMS = itemsJson as VocabItem[];

export function createInitialSession(): GameSession {
  return {
    deck: [],
    idx: 0,
    lives: MAX_LIVES,
    score: 0,
    streak: 0,
    bestStreak: 0,
    totalErrors: 0,
    origLen: 0,
    selectedCats: [],
    sessionConsolidated: 0,
    sessionErrors: {},
    fb: null,
    wrongIn: '',
    gameOver: false,
    gameWon: false,
  };
}

export async function beginGame(selectedCats: string[]): Promise<GameSession> {
  const pool = ITEMS.filter((it) => selectedCats.includes(it.cat));
  const db = await loadSRS();
  const prioritized = srsPrioritize(pool, db);
  const splitAt = Math.ceil(prioritized.length * 0.3);
  const front = shuffle(prioritized.slice(0, splitAt));
  const rest = shuffle(prioritized.slice(splitAt));
  const deck: DeckCard[] = [...front, ...rest];

  return {
    ...createInitialSession(),
    deck,
    origLen: deck.length,
    selectedCats,
    lives: MAX_LIVES,
  };
}

export type SubmitResult = {
  session: GameSession;
  newlyConsolidated: boolean;
  lifeRecovered: boolean;
  toast?: string;
  toastColor?: string;
};

export async function submitAnswer(
  session: GameSession,
  value: string,
): Promise<SubmitResult> {
  if (session.fb !== null || session.gameOver || session.gameWon) {
    return { session, newlyConsolidated: false, lifeRecovered: false };
  }

  const cur = session.deck[session.idx];
  const ok = isAnswerCorrect(cur, value);
  const next: GameSession = { ...session, sessionErrors: { ...session.sessionErrors } };

  if (ok) {
    next.score++;
    next.streak++;
    if (next.streak > next.bestStreak) next.bestStreak = next.streak;
    next.fb = 'ok';
    next.wrongIn = '';

    const newlyConsolidated = await srsCorrect(cur.pt);
    if (newlyConsolidated) next.sessionConsolidated++;

    let lifeRecovered = false;
    let toast: string | undefined;
    let toastColor: string | undefined;

    if (next.streak % 5 === 0 && next.lives < MAX_LIVES) {
      next.lives++;
      lifeRecovered = true;
      toast = `¡Vida recuperada! ❤️ (${next.streak} seguidas)`;
    } else if (next.streak === 3) {
      toast = '🔥 Racha de 3! Seguí así…';
      toastColor = '#c96a20';
    } else if (next.streak === 5) {
      toast = '⚡ ¡5 seguidas! ¡Capa total!';
      toastColor = '#7b1fa2';
    }

    return { session: next, newlyConsolidated, lifeRecovered, toast, toastColor };
  }

  next.lives--;
  next.streak = 0;
  next.totalErrors++;
  next.wrongIn = value;
  next.fb = 'err';
  next.sessionErrors[cur.pt] = (next.sessionErrors[cur.pt] || 0) + 1;
  await srsError(cur.pt);

  const deck = [...next.deck];
  deck.splice(next.idx + 1, 0, { ...cur, immediateRetry: true });
  if (!cur.immediateRetry) {
    const insertAt = Math.min(
      next.idx + 2 + Math.floor(Math.random() * 5),
      deck.length,
    );
    deck.splice(insertAt, 0, { ...cur, retry: true });
  }
  next.deck = deck;

  if (next.lives <= 0) {
    // caller advances to gameOver after delay
  }

  return { session: next, newlyConsolidated: false, lifeRecovered: false };
}

export function advance(session: GameSession): GameSession {
  const nextIdx = session.idx + 1;
  if (nextIdx >= session.deck.length) {
    return { ...session, gameWon: true, fb: null, wrongIn: '' };
  }
  return {
    ...session,
    idx: nextIdx,
    fb: null,
    wrongIn: '',
  };
}

export function markGameOver(session: GameSession): GameSession {
  return { ...session, gameOver: true };
}
