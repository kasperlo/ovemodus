# Øvemodus

Øv på keyboard med en app som lytter. Den viser noter og neste tangent, hører hva du spiller via mikrofon eller MIDI, og går videre når du treffer riktig. Første låt er «I Dovregubbens hall», laget for et gameshow på julebord.

## Kom i gang

```bash
npm install
npm run dev
```

Åpne adressen Vite skriver ut i Chrome eller Edge. Trykk «Bruk mikrofon» (spill bare høyre hånd) eller «Koble til MIDI-keyboard» hvis keyboardet har USB.

## Tester

```bash
npm install
npx playwright install chromium
npm test           # Vitest
npm run test:e2e   # Playwright mot vite preview
```

Playwright-testene spiller pianoopptak inn i en falsk mikrofon og sjekker at appen kjenner igjen hver tone.

## Innhold

- `src/`, `index.html`: appen (Vite + TypeScript)
- `prototype/`: den opprinnelige appen i én fil, referanse for oppførselen
- `tests/`: Playwright-tester og lydfilene de bruker
- `noter/`: notearket (PDF og LilyPond-kilder) og lydfiler å lytte til
- `CLAUDE.md`: hvordan appen virker, viktige beslutninger og planen videre

Notearket tegnes med [abcjs](https://abcjs.net) (MIT-lisens).
