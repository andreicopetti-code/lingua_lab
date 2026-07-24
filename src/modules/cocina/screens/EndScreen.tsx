import React, { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MAX_RANKING, colors, radii } from '../theme';
import { ITEMS } from '../lib/game';
import { chefLevelProgress, getChefLevel } from '../lib/srs';
import { speakES } from '../lib/speech';
import {
  addToRanking,
  loadChef,
  loadRanking,
  loadSRS,
} from '../lib/storage';
import type { ChefData, GameSession, RankingEntry, SrsDb } from '../types';

type Props = {
  session: GameSession;
  onRestart: () => void;
};

export function EndScreen({ session, onRestart }: Props) {
  const [chef, setChef] = useState<ChefData>({ consolidated: 0, achievements: [] });
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [srs, setSrs] = useState<SrsDb>({});
  const [name, setName] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [savedName, setSavedName] = useState('');
  const [prevRecord, setPrevRecord] = useState<RankingEntry | null>(null);

  useEffect(() => {
    (async () => {
      const [c, r, db] = await Promise.all([
        loadChef(),
        loadRanking(),
        loadSRS(),
      ]);
      setChef(c);
      setRanking(r);
      setSrs(db);
      setPrevRecord(r[0] || null);
    })();
  }, []);

  const lv = getChefLevel(chef.consolidated || 0);
  const prog = chefLevelProgress(chef.consolidated || 0);
  const isNewRecord = !prevRecord || session.score > prevRecord.pts;

  const achievements = useMemo(() => {
    const achs: string[] = [];
    if (session.bestStreak >= 10) achs.push('🔥 Racha de 10+');
    if (session.bestStreak >= 5) achs.push('⚡ Racha de 5+');
    if (session.totalErrors === 0) achs.push('🏅 Sem erros!');
    else if (session.totalErrors <= 3) achs.push('✨ Quase perfeito');
    if (session.sessionConsolidated >= 5) achs.push('📚 5 novas consolidadas');
    if (session.sessionConsolidated >= 10) achs.push('🎓 10 novas consolidadas');
    session.selectedCats.forEach((c) => {
      const items = ITEMS.filter((it) => it.cat === c);
      const allOk = items.every((it) => (srs[it.pt]?.correct || 0) >= 3);
      if (allOk && items.length) achs.push(`🗂 ${c} dominada!`);
    });
    return achs;
  }, [session, srs]);

  const reviewKeys = Object.keys(session.sessionErrors || {})
    .sort((a, b) => session.sessionErrors[b] - session.sessionErrors[a])
    .slice(0, 8);

  const saveScore = async () => {
    if (!name.trim()) return;
    const n = name.trim();
    setJustSaved(true);
    setSavedName(n);
    const list = await addToRanking(n, session.score, session.bestStreak);
    setRanking(list);
  };

  const medals = ['🥇', '🥈', '🥉', '4º', '5º'];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          👨‍🍳 <Text style={styles.logoName}>La Cocina Porteña</Text>
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.end} showsVerticalScrollIndicator={false}>
        <Text style={styles.em}>{session.gameWon ? '🏆' : '😵'}</Text>
        <Text style={styles.title}>
          {session.gameWon ? '¡Ganaste, bocho!' : '¡Perdiste, che!'}
        </Text>
        <Text style={styles.sub}>
          {session.gameWon
            ? `Pasaste las ${session.origLen} cartas. ¡Sos un crak!`
            : `Llegaste a la carta ${session.idx + 1}. Mejor suerte la próxima.`}
        </Text>

        <View style={styles.stats}>
          <Stat n={session.score} l="correctas" />
          <Stat n={session.totalErrors} l="erradas" />
          <Stat n={session.bestStreak} l="mejor racha" />
          <Stat n={session.sessionConsolidated} l="consolidadas" />
        </View>

        <View style={styles.chefLevel}>
          <Text style={styles.chefText}>
            {lv.icon} {lv.name}
          </Text>
          <View style={styles.bar}>
            <View style={[styles.fill, { width: `${Math.round(prog * 100)}%` }]} />
          </View>
          <Text style={styles.chefPts}>{chef.consolidated || 0}</Text>
        </View>

        {achievements.length ? (
          <View style={styles.achs}>
            {achievements.map((a) => (
              <Text key={a} style={styles.achPill}>
                {a}
              </Text>
            ))}
          </View>
        ) : null}

        {reviewKeys.length ? (
          <View style={styles.review}>
            <Text style={styles.reviewTitle}>📖 Para revisar (toque para ouvir)</Text>
            <View style={styles.chips}>
              {reviewKeys.map((pt) => {
                const it = ITEMS.find((x) => x.pt === pt);
                if (!it) return null;
                return (
                  <Pressable
                    key={pt}
                    style={styles.chip}
                    onPress={() => speakES(it.es[0], true, true)}
                  >
                    <Text style={styles.chipText}>
                      {pt} → <Text style={{ color: colors.green, fontWeight: '700' }}>{it.es[0]}</Text>{' '}
                      🔊
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {prevRecord || isNewRecord ? (
          <View
            style={[
              styles.recordBanner,
              isNewRecord ? styles.recordNew : styles.recordSame,
            ]}
          >
            <Text style={styles.recordIcon}>{isNewRecord ? '🏆' : '🥇'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.recordLabel}>
                {isNewRecord ? 'Novo recorde!' : 'Recorde histórico'}
              </Text>
              <Text style={styles.recordName}>
                {isNewRecord
                  ? justSaved
                    ? savedName || 'Você'
                    : 'Você'
                  : prevRecord?.name}
              </Text>
            </View>
            <Text style={styles.recordPts}>
              {isNewRecord ? session.score : prevRecord?.pts}
            </Text>
          </View>
        ) : null}

        <View style={styles.ranking}>
          <Text style={styles.rankingTitle}>🏆 Top {MAX_RANKING}</Text>
          {ranking.map((r, i) => {
            const isCurrent =
              justSaved &&
              r.name === savedName &&
              r.pts === session.score &&
              i === ranking.findIndex((x) => x.name === savedName && x.pts === session.score);
            return (
              <View
                key={`${r.name}-${r.pts}-${i}`}
                style={[
                  styles.rankRow,
                  isCurrent && styles.rankCurrent,
                  i === 0 && styles.rankGold,
                ]}
              >
                <Text style={styles.rankPos}>{medals[i] || `${i + 1}º`}</Text>
                <Text style={styles.rankName} numberOfLines={1}>
                  {r.name}
                </Text>
                <Text style={styles.rankScore}>{r.pts}</Text>
                <Text style={styles.rankDetail}>
                  streak {r.streak} · {r.date}
                </Text>
              </View>
            );
          })}
          {!justSaved ? (
            <View style={styles.saveRow}>
              <TextInput
                style={styles.saveInput}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome…"
                placeholderTextColor={colors.dim}
                maxLength={18}
                onSubmitEditing={saveScore}
              />
              <Pressable style={styles.saveBtn} onPress={saveScore}>
                <Text style={styles.saveBtnText}>Salvar</Text>
              </Pressable>
            </View>
          ) : (
            <Text style={styles.savedOk}>✓ Salvo com sucesso!</Text>
          )}
        </View>

        <Pressable style={styles.restart} onPress={onRestart}>
          <Text style={styles.restartText}>Jugar de nuevo 🔄</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statN}>{n}</Text>
      <Text style={styles.statL}>{l}</Text>
    </View>
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
  end: {
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 20,
    gap: 14,
  },
  em: { fontSize: 68 },
  title: { fontSize: 26, fontWeight: '800', color: colors.accent },
  sub: { fontSize: 14, color: colors.muted, textAlign: 'center' },
  stats: { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  stat: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 72,
  },
  statN: { fontSize: 24, fontWeight: '800', color: colors.accent },
  statL: {
    fontSize: 9,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  chefLevel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff8ed',
    borderWidth: 1.5,
    borderColor: '#f0c070',
    borderRadius: 12,
    paddingVertical: 5,
    paddingHorizontal: 12,
    width: '100%',
    maxWidth: 340,
  },
  chefText: { fontSize: 11, fontWeight: '700', color: colors.gold },
  bar: { flex: 1, height: 5, backgroundColor: colors.progTrack, borderRadius: 99, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.accent },
  chefPts: { fontSize: 10, color: colors.dim },
  achs: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, maxWidth: 340 },
  achPill: {
    fontSize: 11,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 99,
    backgroundColor: '#fff4e0',
    borderWidth: 1,
    borderColor: '#f0c070',
    color: '#7a4800',
    fontWeight: '600',
    overflow: 'hidden',
  },
  review: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff8ed',
    borderWidth: 1.5,
    borderColor: '#f0c070',
    borderRadius: 14,
    padding: 12,
  },
  reviewTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.gold,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 7,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 99,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  chipText: { fontSize: 11, color: colors.text },
  recordBanner: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
  },
  recordNew: { backgroundColor: '#fffbe6', borderColor: '#f0c040' },
  recordSame: { backgroundColor: '#f5f5f5', borderColor: '#ddd' },
  recordIcon: { fontSize: 28 },
  recordLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.muted,
  },
  recordName: { fontSize: 12, fontWeight: '600', color: colors.text },
  recordPts: { fontSize: 26, fontWeight: '800', color: colors.accent, marginLeft: 'auto' },
  ranking: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
  },
  rankingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginBottom: 3,
  },
  rankCurrent: { backgroundColor: '#fff4e0', borderWidth: 1, borderColor: '#f0c070' },
  rankGold: { backgroundColor: '#fffde7' },
  rankPos: { fontSize: 16, minWidth: 24, textAlign: 'center' },
  rankName: { flex: 1, fontWeight: '700', color: colors.text },
  rankScore: { fontWeight: '800', color: colors.accent, minWidth: 36, textAlign: 'right' },
  rankDetail: { fontSize: 10, color: colors.muted, minWidth: 70, textAlign: 'right' },
  saveRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  saveInput: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  saveBtn: {
    backgroundColor: colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  savedOk: {
    fontSize: 12,
    color: colors.green,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  restart: {
    backgroundColor: colors.accent,
    borderRadius: radii.btn,
    paddingVertical: 14,
    paddingHorizontal: 34,
    marginTop: 4,
  },
  restartText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
