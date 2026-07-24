import examples from '../data/examples.json';
import type { VocabItem } from '../types';

const EXAMPLES = examples as Record<string, string>;

/** Returns HTML-ish example with <em> tags stripped for RN Text */
export function getExample(item: VocabItem): string | null {
  const raw = item.example || EXAMPLES[item.pt] || null;
  if (!raw) return null;
  return raw.replace(/<\/?em>/g, '');
}

export function getExampleParts(
  item: VocabItem,
): { before: string; highlight: string; after: string } | null {
  const raw = item.example || EXAMPLES[item.pt] || null;
  if (!raw) return null;
  const m = raw.match(/^(.*?)<em>(.*?)<\/em>(.*)$/);
  if (!m) return { before: raw.replace(/<\/?em>/g, ''), highlight: '', after: '' };
  return { before: m[1], highlight: m[2], after: m[3] };
}
