import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALL_CATEGORIES, CAT_ICON, CC, CHEF_LEVELS, colors } from '../theme';
import { ITEMS } from '../lib/game';
import { categoryProgress, chefLevelProgress, getChefLevel } from '../lib/srs';
import {
  loadChef,
  loadRanking,
  loadSelectedCats,
  loadSRS,
  saveSelectedCats,
} from '../lib/storage';
import type { ChefData, RankingEntry, SrsDb } from '../types';

type Props = {
  onStart: (cats: string[]) => void;
};

export function SplashScreen({ onStart }: Props) {
  const [selected, setSelected] = useState<string[]>(ALL_CATEGORIES);
  const [chef, setChef] = useState<ChefData>({ consolidated: 0, achievements: [] });
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [srs, setSrs] = useState<SrsDb>({});

  useEffect(() => {
    (async () => {
      const [cats, c, r, db] = await Promise.all([
        loadSelectedCats(ALL_CATEGORIES),
        loadChef(),
        loadRanking(),
        loadSRS(),
      ]);
      setSelected(cats);
      setChef(c);
      setRanking(r);
      setSrs(db);
    })();
  }, []);

  const wordCount = useMemo(
    () => ITEMS.filter((it) => selected.includes(it.cat)).length,
    [selected],
  );

  const lv = getChefLevel(chef.consolidated || 0);
  const prog = chefLevelProgress(chef.consolidated || 0);
  const nextLv = CHEF_LEVELS[lv.idx + 1] ?? null;
  const record = ranking[0] || null;

  const toggle = (cat: string) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const setAll = (val: boolean) => setSelected(val ? [...ALL_CATEGORIES] : []);

  const handlePlay = async () => {
    if (!wordCount) return;
    await saveSelectedCats(selected);
    onStart(selected);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>👨‍🍳 <Text style={styles.logoName}>La Cocina Porteña</Text></Text>
      </View>
      <ScrollView contentContainerStyle={styles.splash} showsVerticalScrollIndicator={false}>
        <Text style={styles.chefEmoji}>👨‍🍳</Text>
        <Text style={styles.title}>La Cocina Porteña</Text>
        <Text style={styles.sub}>
          Vocabulário gastronômico do espanhol rioplatense{'\n'}com pronúncia em áudio 🔊
        </Text>

        <View style={[styles.record, !record && { opacity: 0.55 }]}>
          <View>
            <Text style={styles.recordLabel}>🏅 Recorde histórico</Text>
            <Text style={[styles.recordName, !record && { color: colors.muted }]}>
              {record?.name || 'Nenhum ainda'}
            </Text>
          </View>
          <Text style={[styles.recordPts, !record && { color: colors.dim }]}>
            {record ? record.pts : '—'}
          </Text>
        </View>

        <View style={styles.chefLevel}>
          <View style={styles.sclTop}>
            <View>
              <Text style={styles.sclLabel}>Seu nível</Text>
              <Text style={styles.sclName}>
                {lv.icon} {lv.name}
              </Text>
            </View>
            <Text style={styles.sclPts}>
              {chef.consolidated || 0} palavras
              {nextLv ? ` · próx: ${nextLv.min}` : ''}
            </Text>
          </View>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${Math.round(prog * 100)}%` }]} />
          </View>
        </View>

        <View style={styles.catSelector}>
          <Text style={styles.catTitle}>Categorias para jogar</Text>
          <View style={styles.selectRow}>
            <Pressable onPress={() => setAll(true)} style={styles.miniBtn}>
              <Text style={styles.miniBtnText}>Todas</Text>
            </Pressable>
            <Pressable onPress={() => setAll(false)} style={styles.miniBtn}>
              <Text style={styles.miniBtnText}>Nenhuma</Text>
            </Pressable>
          </View>
          <View style={styles.catGrid}>
            {ALL_CATEGORIES.map((c) => {
              const col = CC[c];
              const sel = selected.includes(c);
              const { done, total, pct } = categoryProgress(ITEMS, c, srs);
              return (
                <Pressable
                  key={c}
                  onPress={() => toggle(c)}
                  style={[
                    styles.catToggle,
                    sel && {
                      borderColor: col.b,
                      backgroundColor: col.bg,
                    },
                  ]}
                >
                  <View style={styles.catMain}>
                    <Text style={[styles.catLabel, sel && { color: col.c }]}>
                      {CAT_ICON[c]} {c}
                    </Text>
                    <Text style={styles.catCount}>
                      {done > 0 ? `${done}/` : ''}
                      {total}
                    </Text>
                    {sel ? <Text style={styles.check}>✓</Text> : null}
                  </View>
                  <View style={styles.miniBar}>
                    <View style={[styles.miniFill, { width: `${pct}%` }]} />
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={handlePlay}
          disabled={!wordCount}
          style={[styles.playBtn, !wordCount && { opacity: 0.45 }]}
        >
          <Text style={styles.playText}>¡A jugar! 🍽</Text>
        </Pressable>
        <Text style={styles.info}>
          {wordCount} palavras selecionadas · 5 vidas · sequências recuperam vidas
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  logo: { fontSize: 15 },
  logoName: { fontWeight: '800', color: colors.accent },
  splash: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 32,
  },
  chefEmoji: { fontSize: 64, marginBottom: 10 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: -0.3,
    marginBottom: 3,
  },
  sub: {
    fontSize: 12,
    color: colors.muted,
    marginBottom: 16,
    lineHeight: 18,
    textAlign: 'center',
  },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff8ed',
    borderWidth: 1.5,
    borderColor: '#f0c070',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  recordLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.muted,
  },
  recordName: { fontSize: 12, fontWeight: '800', color: colors.text },
  recordPts: {
    marginLeft: 'auto',
    fontSize: 20,
    fontWeight: '800',
    color: colors.accent,
    paddingLeft: 12,
  },
  chefLevel: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: '#fff8ed',
    borderWidth: 1.5,
    borderColor: '#f0c070',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 6,
  },
  sclTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sclLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.muted,
  },
  sclName: { fontSize: 13, fontWeight: '800', color: colors.accent },
  sclPts: { fontSize: 11, color: colors.muted },
  bar: { height: 6, backgroundColor: colors.progTrack, borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent, borderRadius: 99 },
  catSelector: { width: '100%', maxWidth: 340, marginBottom: 14 },
  catTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 7,
    textAlign: 'left',
  },
  selectRow: { flexDirection: 'row', gap: 6, justifyContent: 'flex-end', marginBottom: 6 },
  miniBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 99,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  miniBtnText: { fontSize: 10, fontWeight: '700', color: colors.muted },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  catToggle: {
    width: '48.5%',
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 4,
  },
  catMain: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  catLabel: { flex: 1, fontSize: 11, fontWeight: '600', color: colors.text },
  catCount: { fontSize: 9, color: colors.dim },
  check: { fontSize: 12, color: colors.accent },
  miniBar: {
    height: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  miniFill: { height: '100%', backgroundColor: colors.green, borderRadius: 99 },
  playBtn: {
    backgroundColor: colors.accent,
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 44,
    marginTop: 4,
  },
  playText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.3 },
  info: { fontSize: 10, color: colors.dim, marginTop: 10, textAlign: 'center' },
});
