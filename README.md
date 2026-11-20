# Øvemodus

Øv på keyboard med en app som lytter. Den viser noter og neste tangent, hører hva du spiller via mikrofon eller MIDI, og går videre når du treffer riktig. Første låt er «I Dovregubbens hall», laget for et gameshow på julebord.

## Kom i gang

Åpne `prototype/ovemodus.html` i Chrome eller Edge. Trykk «Bruk mikrofon» (spill bare høyre hånd) eller «Koble til MIDI-keyboard» hvis keyboardet har USB.

## Tester

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

Testene spiller pianoopptak inn i en falsk mikrofon og sjekker at appen kjenner igjen hver tone.

## Innhold

- `prototype/`: dagens app i én fil
- `tests/`: Playwright-tester og lydfilene de bruker
- `noter/`: notearket (PDF og LilyPond-kilder) og lydfiler å lytte til
- `CLAUDE.md`: hvordan appen virker, viktige beslutninger og planen videre

Notearket tegnes med [abcjs](https://abcjs.net) (MIT-lisens).
