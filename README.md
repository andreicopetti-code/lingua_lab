# Lingua Lab

App mobile (iOS + Android) para vocabulário em espanhol e inglês.

## Stack

- Expo SDK 57 + React Native + TypeScript
- AsyncStorage (SRS, ranking, progresso)
- expo-speech (pronúncia)

## Módulo atual

**La Cocina Porteña** — vocabulário gastronômico do espanhol rioplatense (PT → ES), portado do protótipo HTML `reference/cocina-portena-v19.html`.

- 1100 palavras · 11 categorias
- 5 vidas, rachas, retries SRS
- Nível de chef + ranking local

## Como rodar

```bash
npm install
npx expo start
```

Escaneie o QR no **Expo Go** (Android/iOS) ou use emulador.

```bash
npm run android
npm run ios   # requer macOS
npm run web
```

## Estrutura

```
src/modules/cocina/   # jogo Cocina Porteña
reference/            # protótipo HTML de referência
App.tsx               # navegação splash → game → end
```

## Próximos passos

- Módulo de inglês
- Conta / sync na nuvem
- Builds nativos (EAS Build → TestFlight / Play Store)
