import type { ChefData, SrsDb, VocabItem } from '../types';
import { CHEF_LEVELS } from '../theme';
import { loadChef, loadSRS, saveChef, saveSRS } from './storage';

export function getChefLevel(consolidated: number) {
  for (let i = CHEF_LEVELS.length - 1; i >= 0; i--) {
    if (consolidated >= CHEF_LEVELS[i].min) {
      return { ...CHEF_LEVELS[i], idx: i };
    }
  }
  return { ...CHEF_LEVELS[0], idx: 0 };
}

export function chefLevelProgress(consolidated: number): number {
  const lv = getChefLevel(consolidated);
  if (lv.max === Infinity) return 1;
  return Math.min((consolidated - lv.min) / (lv.max - lv.min), 1);
}

export async function srsCorrect(pt: string): Promise<boolean> {
  const db = await loadSRS();
  if (!db[pt]) db[pt] = { correct: 0, errors: 0, lastSeen: Date.now(), interval: 1 };
  db[pt].correct++;
  db[pt].lastSeen = Date.now();
  db[pt].interval = Math.min(db[pt].interval * 2, 64);
  await saveSRS(db);

  if (db[pt].correct === 3) {
    const chef = await loadChef();
    chef.consolidated = (chef.consolidated || 0) + 1;
    await saveChef(chef);
    return true;
  }
  return false;
}

export async function srsError(pt: string): Promise<void> {
  const db = await loadSRS();
  if (!db[pt]) db[pt] = { correct: 0, errors: 0, lastSeen: Date.now(), interval: 1 };
  db[pt].errors++;
  db[pt].lastSeen = Date.now();
  db[pt].interval = 1;
  await saveSRS(db);
}

export function srsPrioritize(items: VocabItem[], db: SrsDb): VocabItem[] {
  const now = Date.now();
  return [...items].sort((a, b) => {
    const da = db[a.pt] || { errors: 0, interval: 1, lastSeen: 0, correct: 0 };
    const db2 = db[b.pt] || { errors: 0, interval: 1, lastSeen: 0, correct: 0 };
    const scoreA =
      da.errors * 3 +
      Math.max(0, (now - da.lastSeen) / (da.interval * 24 * 3600 * 1000) - 1) * 10;
    const scoreB =
      db2.errors * 3 +
      Math.max(0, (now - db2.lastSeen) / (db2.interval * 24 * 3600 * 1000) - 1) * 10;
    return scoreB - scoreA;
  });
}

export function categoryProgress(
  items: VocabItem[],
  cat: string,
  db: SrsDb,
): { done: number; total: number; pct: number } {
  const catItems = items.filter((it) => it.cat === cat);
  const done = catItems.filter((it) => (db[it.pt]?.correct || 0) >= 3).length;
  const total = catItems.length;
  return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
}

export type { ChefData };
