import type { VocabItem } from '../types';

export function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿¡?!.,;:]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function shuffle<T>(a: T[]): T[] {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

export function prefixChar(item: VocabItem): string {
  const es = item.es;
  if (es.every((a) => a.startsWith('¿'))) return '¿';
  if (es.every((a) => a.startsWith('¡'))) return '¡';
  return '';
}

export function isAnswerCorrect(item: VocabItem, value: string): boolean {
  return item.es.some((a) => norm(a) === norm(value));
}
