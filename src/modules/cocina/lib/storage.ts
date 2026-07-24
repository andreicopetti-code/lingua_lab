import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ChefData, RankingEntry, SrsDb } from '../types';
import { MAX_RANKING } from '../theme';

const SRS_KEY = 'cocina_srs_v1';
const CHEF_KEY = 'cocina_chef_v1';
const RANKING_KEY = 'cocina_portena_ranking';
const CATS_KEY = 'cocina_cats';
const VOICE_KEY = 'cocina_voice';

const defaultChef = (): ChefData => ({ consolidated: 0, achievements: [] });

export async function loadSRS(): Promise<SrsDb> {
  try {
    const raw = await AsyncStorage.getItem(SRS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export async function saveSRS(data: SrsDb): Promise<void> {
  try {
    await AsyncStorage.setItem(SRS_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export async function loadChef(): Promise<ChefData> {
  try {
    const raw = await AsyncStorage.getItem(CHEF_KEY);
    return raw ? JSON.parse(raw) : defaultChef();
  } catch {
    return defaultChef();
  }
}

export async function saveChef(data: ChefData): Promise<void> {
  try {
    await AsyncStorage.setItem(CHEF_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}

export async function loadRanking(): Promise<RankingEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(RANKING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveRanking(list: RankingEntry[]): Promise<void> {
  await AsyncStorage.setItem(RANKING_KEY, JSON.stringify(list));
}

export async function addToRanking(
  name: string,
  pts: number,
  streak: number,
): Promise<RankingEntry[]> {
  const list = await loadRanking();
  list.push({
    name,
    pts,
    streak,
    date: new Date().toLocaleDateString('pt-BR'),
  });
  list.sort((a, b) => b.pts - a.pts);
  const trimmed = list.slice(0, MAX_RANKING);
  await saveRanking(trimmed);
  return trimmed;
}

export async function loadSelectedCats(
  allCats: string[],
): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(CATS_KEY);
    if (!raw) return allCats;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : allCats;
  } catch {
    return allCats;
  }
}

export async function saveSelectedCats(cats: string[]): Promise<void> {
  await AsyncStorage.setItem(CATS_KEY, JSON.stringify(cats));
}

export async function loadVoiceOn(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(VOICE_KEY)) !== 'off';
  } catch {
    return true;
  }
}

export async function saveVoiceOn(on: boolean): Promise<void> {
  await AsyncStorage.setItem(VOICE_KEY, on ? 'on' : 'off');
}
