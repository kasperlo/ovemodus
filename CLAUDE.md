# Øvemodus – keyboardtrener

Kaspers app for å øve på keyboard. Appen lytter via mikrofon eller MIDI, viser noter og neste tangent, og går videre når riktig tone spilles. Første låt er «I Dovregubbens hall» (Grieg, forenklet i a-moll), pluss to korte gameshow-effekter.

## Status nå

- Appen er Vite + TypeScript uten rammeverk (`index.html`, `src/`). abcjs 6.4.4 kommer fra npm.
- `prototype/ovemodus.html` er den opprinnelige appen i én fil. Den er referansen for oppførselen og kan fortsatt testes (`npm run test:e2e:prototype`).
- `tests/e2e/` har 10 Playwright-tester som kjører mot `vite preview`. To av dem bruker falsk mikrofon som spiller pianoopptak fra `tests/fixtures/`.
- `src/**/*.test.ts` har Vitest-tester for rene funksjoner: tonedeteksjon, `build`, `toAbc` og dømming.
- `noter/` har LilyPond-kildene til notearket (PDF), lydfilene (MP3) og skriptet som lager dem.

Steg 1 i planen er gjort. Neste er steg 2.

## Kommandoer

```bash
npm install
npx playwright install chromium   # én gang
npm run dev                       # utviklingsserver
npm run build                     # tsc + vite build til dist/
npm test                          # Vitest, under ett sekund
npm run test:e2e                  # bygger, starter vite preview (port 4173) og kjører Playwright, ca. 1 minutt
npm run test:e2e:prototype        # samme tester mot prototypen
```

Appen trenger en server (ES-moduler virker ikke fra `file://`). Prototypen åpnes direkte i Chrome eller Edge (`open -a "Google Chrome" prototype/ovemodus.html`). Mikrofonen virker ikke i forhåndsvisninger som kjører i en sandkasse (for eksempel inne i Claude).

## Hva appen gjør

- **Velg del:** Del A, Del B, Hele stykket (A A B A + sluttakkord), Riktig svar (fanfare), Feil svar (sad trombone).
- **Input:** mikrofon (høyre hånd alene), Web MIDI (USB-keyboard; toner under midtre C ignoreres som venstre hånd), eller klikk på skjermtastaturet.
- **Vent på meg:** står stille til riktig tone kommer. Tid måles fra første riktige tone. Klikk på en note eller bokstavbrikke for å starte derfra (da lagres ikke rekord).
- **Spill i takt:** én takt med innteller, metronom, valgfri venstre hånd. Hver tone dømmes treff/bom innenfor et tidsvindu. Resultat i prosent og gjennomsnittlig timing. Rekorden er høyeste tempo med minst 90 % treff.
- **Hør hvordan det går:** appen spiller delen selv og viser tangentene.
- **Visning:** noteark (abcjs) med fingersetting over og tonenavn under, eller bokstavbrikker. Gul markør = neste tone, grønn = riktig, rød = bom.
- Innstillinger og rekorder lagres i `localStorage` under nøkkelen `dovregubben-ovemodus-v1`.

## Datamodellen

Låtene er skrevet som takter i åttedeler (`s16=0.5, e=1, q=2, h=4, dh=6, w=8`):

- `N('D#5', e, 4)`: tone, varighet, finger. Navnet styrer stavemåten (`D#` vises som D♯, `Bb` som B♭).
- `CH(['A4','C5','E5','A5'], q, '1 2 3 5', 'A-moll', 'Am')`: akkord. Godtas når én av akkordtonene spilles.
- `R(q)`: pause.
- `LH`: mønstre for venstre hånd (bare til avspilling og noteark).
- `SECTIONS`: hver del er grupper av takter (`[taktnøkkel, venstrehåndsnøkkel]`) med en etikett.

`build(section)` gir `{ bars, items, steps, lh, total }`. `steps` er alle toner og akkorder i rekkefølge (uten pauser). Både dømming, tastatur, bokstavbrikker og noteark bygger på `steps`, så de kan aldri komme i utakt.

## Tonegjenkjenning (mikrofon) – beslutninger og feller

Dette er den delen som har tatt mest prøving. Ikke endre den uten å kjøre mikrofontestene.

1. **Opptak:** `getUserMedia` med `echoCancellation`, `noiseSuppression` og `autoGainControl` slått av. `AnalyserNode` med `fftSize = 2048`, lest hver `requestAnimationFrame`.
2. **Støyport:** RMS mot en port = `max(3 × støygulv, følsomhet)`, der følsomhet er 0,02 / 0,008 / 0,0035. Støygulvet følger stillheten raskt ned og kryper sakte opp (maks 0,006).
3. **YIN** (terskel 0,15, ellers globalt minimum hvis det er under 0,3; krever konfidens ≥ 0,75), 75–1400 Hz.
4. **Viktig:** YIN alene leser pianotoner **15–45 cent for høyt** (inharmoniske overtoner; målt mot FFT på opptakene). Det fikk enkelte toner avvist eller rundet feil. Derfor finjusteres grunntonen med en Goertzel-skanning rundt YIN-estimatet (±5 %, steg på 0,2 %, Hann-vindu, parabolsk interpolasjon i log-effekt). Resultatet ligger innenfor ±5 cent. Toner mer enn 42 cent fra nærmeste halvtone forkastes.
5. **Hendelser:** samme MIDI-tone i 3 rammer på rad gir en `stable`-hendelse; 9 rammer gir `sustain`. Feil tone telles bare som bom på `sustain`, så anslag og overganger ikke gir falske bom.
6. **Anslag:** RMS-hopp over 1,4 × glidende snitt (140 ms sperretid) markerer et nytt anslag. Uten anslag ignoreres en tone med samme tonenavn som forrige godkjente tone, fordi den bare klinger ut. Det trengs for å skille «C så C-dur-akkord» i fanfaren.
7. **Ekko:** mikrofonen ignoreres i 450 ms etter et klikk på skjermtastaturet eller en MIDI-tone, og under demo.
8. **Oktaver:** «Godta riktig tone i alle oktaver» er på som standard. Det dekker keyboard med oktavskift og oktavfeil i deteksjonen.
9. **Spill i takt med mikrofon:** 70 ms forsinkelse trekkes fra. Når appen spiller venstre hånd gjennom høyttaleren, ignoreres mikrofontoner under MIDI 55. Anbefal hodetelefoner.
10. **Tidsvindu i takt-modus:** `clamp(0,5 × min(varighet, kvartnote), 90 ms, 200 ms)`. Avspilling planlegges i `AudioContext`-tid med 0,3 s forsprang + `outputLatency`. MIDI bruker `event.timeStamp`.

## Noteark (abcjs) – feller

- ABC lages av samme data (`toAbc(model, perLine, showLH)`), aldri skrevet for hånd.
- Kobling note ↔ tone: noteelementene i `tune.lines[].staff[0].voices[0]` (uten pauser) i rekkefølge. Antallet sjekkes mot `steps` (`sheet.ok`).
- Markøren er et `<rect>` lagt først i SVG-en, plassert med `getBBox()` på `abselem.elemset`. `getBBox` virker ikke på skjulte elementer, så arket tegnes først når det er synlig, og tegnes på nytt etter at fontene har lastet.
- abcjs fanger klikk på hele SVG-en. I tester må man klikke på koordinatene til noten, ikke på elementet.

## Testkroken

`window.ovemodus` (`input`, `setSection`, `setMode`, `setTempo`, `startRun`, `stopRun`, `state`) brukes av testene. Den settes i `src/testHook.ts`. Behold formen. Typene står i `tests/e2e/helpers.ts`.

## Kodeoppdeling

- `src/music/`: `theory.ts` (tonenavn, MIDI), `song.ts` (låtformat, `N`/`CH`/`R`, `build`)
- `src/songs/`: én fil per låt, `index.ts` er registeret
- `src/notation/`: `abc.ts` (`toAbc`, rent), `sheet.ts` (abcjs-tegning og markør)
- `src/audio/synth.ts`: AudioContext, toner og metronomklikk
- `src/input/`: `pitch.ts` (YIN + Goertzel, rent), `mic.ts`, `midi.ts`
- `src/practice/`: `input.ts` (felles inngang for alle kilder), `wait.ts` (vent på meg), `takt.ts` (spill i takt og demo), `judge.ts` (rene regler), `progress.ts`, `session.ts` (del, modus, visning, hopp til note)
- `src/ui/`: `dom.ts` (alle elementer), `view.ts` (`refresh` og alt som tegnes), `keyboard.ts`, `strip.ts`
- `src/state.ts` (tilstand under øving), `src/storage.ts` (`localStorage`), `src/main.ts` (kobler alt sammen)

## Testoppsett

- Falsk mikrofon i Chromium: `--use-fake-ui-for-media-stream --use-fake-device-for-media-stream --use-file-for-fake-audio-capture=<fil.wav>%noloop`. Lyden starter når appen kaller `getUserMedia`. Flaggene settes per nettleser, så hver mikrofontest starter sin egen.
- `tests/fixtures/del-a-hoyre-hand.wav`: høyre hånd i del A, 100 BPM, staccato, 1,5 s stillhet først. Forventet: 26/26, 0 bom.
- `tests/fixtures/del-a-oktav-ned-feil-tone.wav`: samme en oktav lavere, med en feil F4 (0,45 s) før tone 8. Forventet: 26/26, 1 bom.
- Lydfilene er laget fra `noter/lyd-ovetempo.ly` → MIDI → `noter/scripts/postprocess.py` → fluidsynth (FluidR3_GM, 48 kHz) → ffmpeg (mono, 16 bit, 3 s stillhet til slutt).
- Testene kjører med én worker fordi takt-testene måler timing.

## Konvensjoner

- All tekst i appen er på norsk bokmål. Kode og identifikatorer på engelsk, kommentarer gjerne på norsk.
- Designet er et gameshow-brett: dyp blå flate, gull for «det du skal gjøre nå», grønt og rødt bare for treff og bom. Fargene ligger som tokens i `:root`.
- Tydelig fokusmarkering, `prefers-reduced-motion` respekteres.
- Bokstavnavn følger engelsk stavemåte (B, B♭); notearket sier at B heter H på norsk.

## Plan

Kjør testene grønne etter hvert steg.

1. ✅ **Bygg om til Vite + TypeScript** (uten rammeverk), uten å endre oppførsel. Samme DOM-id-er og samme testkrok. abcjs fra npm (6.4.4). Foreslått oppdeling:
   - `src/music/` (teori, låtformat, `build`)
   - `src/songs/` (én fil per låt + register)
   - `src/notation/` (`toAbc`, tegning og markør)
   - `src/audio/` (synth og klikk)
   - `src/input/` (`pitch.ts` med YIN og Goertzel, `mic.ts`, `midi.ts`)
   - `src/practice/` (vent, takt, demo)
   - `src/ui/`, `src/storage.ts`

   Legg `webServer` med `vite preview` i `playwright.config.ts`, og Vitest for rene funksjoner: tonedeteksjon på syntetiske toner med inharmoniske overtoner, `toAbc`, `build` og dømming.
2. **Flere låter:** låtvelger + delvelger, skill Dovregubben og gameshow-effektene. Valideringstest: hver takt fyller taktarten, fingre er 1–5, venstre hånd holder seg innenfor takten.
3. **PWA og GitHub Pages:** `vite-plugin-pwa` (offline, kan installeres), GitHub Actions som tester og publiserer (`base: './'`). Med HTTPS virker mikrofonen også på iPad og mobil.
4. **Ideer videre:** nedtellingsmodus som blir raskere for hver runde (som `noter/lyd/dovregubben-nedtelling.mp3`), loop av én takt, venstre hånd via MIDI, import av ABC eller MusicXML fra MuseScore, kalibrering av forsinkelse, statistikk over tid, bedre layout på iPad.
